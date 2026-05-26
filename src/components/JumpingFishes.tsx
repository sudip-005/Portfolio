"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface JumpingFishesProps {
  themeProgress: number; // 0: day, 1: night
}

interface FishState {
  id: number;
  xBase: number;
  zStart: number;
  zLength: number;
  height: number;
  duration: number;
  color: string;
  nextJumpTime: number;
  jumpStartTime: number;
  isJumping: boolean;
}

interface SplashState {
  id: number;
  x: number;
  z: number;
  startTime: number;
  active: boolean;
}

export default function JumpingFishes({ themeProgress }: JumpingFishesProps) {
  const fishesRef = useRef<THREE.Group[]>([]);
  const tailRefs = useRef<THREE.Group[]>([]);
  const ripplesRef = useRef<THREE.Mesh[]>([]);

  // 1. Splash Ripples Pool
  const splashes = useMemo(() => {
    const list: SplashState[] = [];
    for (let i = 0; i < 6; i++) {
      list.push({ id: i, x: 0, z: 0, startTime: 0, active: false });
    }
    return list;
  }, []);

  // 2. Initialize 3 fishes
  const fishes = useMemo(() => {
    const list: FishState[] = [];
    const colors = ["#ff7675", "#fdcb6e", "#e84393"]; // Vibrant goldfish colors
    for (let i = 0; i < 3; i++) {
      list.push({
        id: i,
        xBase: 2.2 + i * 1.2 + Math.random() * 0.4, // Positioned inside the stream (x from 1.4 to 6.2)
        zStart: -12.0 + i * 8.0 + (Math.random() - 0.5) * 4.0, // Spread along stream length near tree
        zLength: 3.0 + Math.random() * 2.0,
        height: 0.7 + Math.random() * 0.6,
        duration: 1.0 + Math.random() * 0.3,
        color: colors[i % colors.length],
        nextJumpTime: 2.0 + Math.random() * 3.0, // Initial delay before first jump
        jumpStartTime: 0,
        isJumping: false,
      });
    }
    return list;
  }, []);

  // Helper to trigger a splash ripple
  const triggerSplash = (x: number, z: number, time: number) => {
    const freeSplash = splashes.find((s) => !s.active);
    if (freeSplash) {
      freeSplash.x = x;
      freeSplash.z = z;
      freeSplash.startTime = time;
      freeSplash.active = true;
    } else {
      // Evict oldest splash
      const oldest = splashes.reduce((prev, curr) => (prev.startTime < curr.startTime ? prev : curr));
      oldest.x = x;
      oldest.z = z;
      oldest.startTime = time;
      oldest.active = true;
    }
  };

  // 3. Animation loop for jump physics & splashes
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Update Fishes
    fishes.forEach((fish, idx) => {
      const group = fishesRef.current[idx];
      if (!group) return;

      if (!fish.isJumping) {
        // Under water waiting - hide the mesh below stream height
        group.position.set(0, -5.0, 0);
        group.scale.setScalar(0.001);

        // Check if it's time to jump
        if (time >= fish.nextJumpTime) {
          fish.isJumping = true;
          fish.jumpStartTime = time;
          // Re-roll jump parameters
          fish.xBase = 2.4 + Math.random() * 2.6; // Stream center range
          fish.zStart = -14.0 + Math.random() * 20.0; // In view of the camera
          fish.zLength = 2.8 + Math.random() * 2.2;
          fish.height = 0.7 + Math.random() * 0.55;
          fish.duration = 0.95 + Math.random() * 0.25;

          // Trigger entry splash
          triggerSplash(fish.xBase, fish.zStart, time);
        }
      } else {
        const elapsed = time - fish.jumpStartTime;
        const progress = Math.min(1.0, elapsed / fish.duration);

        // Parabolic physics
        const p = progress;
        // Horizontal forward motion along Z
        const z = fish.zStart + p * fish.zLength;
        // Arc motion in X (wobble)
        const x = fish.xBase + Math.sin(p * Math.PI) * 0.35;
        // Vertical parabola height (stream surface y = -0.12)
        const y = -0.12 + Math.sin(p * Math.PI) * fish.height;

        group.position.set(x, y, z);
        group.scale.setScalar(0.8 + Math.sin(p * Math.PI) * 0.4); // slightly puff up at peak

        // Orientation: align fish nose to velocity tangent
        const dx = Math.cos(p * Math.PI) * Math.PI * 0.35;
        const dy = Math.cos(p * Math.PI) * Math.PI * fish.height;
        const dz = fish.zLength;

        const pitch = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
        const yaw = Math.atan2(dx, dz);
        group.rotation.set(pitch, yaw + Math.PI / 2, 0); // cone points along Y/Z local axis, offset Y rotation

        // Wiggle the tail fin
        const tail = tailRefs.current[idx];
        if (tail) {
          tail.rotation.y = Math.sin(time * 28 + fish.id * 2.0) * 0.45;
        }

        // Check if jump finished
        if (p >= 1.0) {
          fish.isJumping = false;
          // Trigger splashdown exit ripple
          triggerSplash(x, z, time);
          // Set delay for next jump (3.5s to 7s)
          fish.nextJumpTime = time + 3.5 + Math.random() * 3.5;
        }
      }
    });

    // Update Splash Ripples
    splashes.forEach((splash, idx) => {
      const mesh = ripplesRef.current[idx];
      if (!mesh) return;

      if (splash.active) {
        const age = time - splash.startTime;
        const duration = 0.7; // ripple lasts 0.7 seconds

        if (age >= duration) {
          splash.active = false;
          mesh.position.set(0, -10.0, 0); // Hide away
        } else {
          const ratio = age / duration;
          // Position ripple at water surface
          mesh.position.set(splash.x, -0.11, splash.z);
          // Ripple expands outwards
          const scale = ratio * 0.9;
          mesh.scale.set(scale, scale, 1.0);
          
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = (1.0 - ratio) * 0.65;
        }
      } else {
        mesh.position.set(0, -10.0, 0); // Hide away
      }
    });
  });

  return (
    <group>
      {/* 1. Fish Models */}
      {fishes.map((fish, i) => (
        <group
          key={fish.id}
          ref={(el) => {
            if (el) fishesRef.current[i] = el;
          }}
        >
          {/* Detailed Fish Body (Elongated low-poly sphere) */}
          <mesh castShadow scale={[0.7, 1.0, 1.9]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial
              color={fish.color}
              emissive={fish.color}
              emissiveIntensity={THREE.MathUtils.lerp(0.1, 0.8, themeProgress)}
              roughness={0.15}
              metalness={0.8}
            />
          </mesh>

          {/* Eyes */}
          <mesh position={[0.04, 0.02, 0.08]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshBasicMaterial color="#050505" />
          </mesh>
          <mesh position={[-0.04, 0.02, 0.08]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshBasicMaterial color="#050505" />
          </mesh>

          {/* Dorsal Fin */}
          <mesh position={[0, 0.07, -0.02]} rotation={[0.4, 0, 0]}>
            <coneGeometry args={[0.01, 0.06, 3]} />
            <meshStandardMaterial color={fish.color} roughness={0.3} />
          </mesh>

          {/* Pectoral Fins (Left & Right) */}
          <mesh position={[0.06, -0.02, 0.04]} rotation={[0.2, 0, -0.5]}>
            <coneGeometry args={[0.008, 0.05, 3]} />
            <meshStandardMaterial color={fish.color} roughness={0.3} />
          </mesh>
          <mesh position={[-0.06, -0.02, 0.04]} rotation={[0.2, 0, 0.5]}>
            <coneGeometry args={[0.008, 0.05, 3]} />
            <meshStandardMaterial color={fish.color} roughness={0.3} />
          </mesh>

          {/* Tail Fin Group (Pivoted at z=-0.13, wiggles) */}
          <group
            ref={(el) => {
              if (el) tailRefs.current[i] = el;
            }}
            position={[0, 0, -0.13]}
          >
            <mesh position={[0, 0, -0.05]} rotation={[0, 0, Math.PI / 2]}>
              <coneGeometry args={[0.045, 0.09, 3]} />
              <meshStandardMaterial color={fish.color} roughness={0.3} />
            </mesh>
          </group>
        </group>
      ))}

      {/* 2. Splash Ripples (Torus rings placed flat on the water plane) */}
      {splashes.map((splash, i) => (
        <mesh
          key={splash.id}
          ref={(el) => {
            if (el) ripplesRef.current[i] = el;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -10, 0]}
        >
          <ringGeometry args={[0.05, 0.22, 16]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
