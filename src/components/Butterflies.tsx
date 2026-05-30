"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ButterfliesProps {
  themeProgress: number; // 0: day, 1: night
}

interface ButterflyData {
  id: number;
  initialPos: THREE.Vector3;
  color: string;
  speed: number;
  phase: number;
  scale: number;
  radiusX: number;
  radiusZ: number;
}

export default function Butterflies({ themeProgress }: ButterfliesProps) {
  const butterfliesRef = useRef<THREE.Group[]>([]);
  const leftWingsRef = useRef<THREE.Group[]>([]);
  const rightWingsRef = useRef<THREE.Group[]>([]);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // 1. Generate flock of 16 butterflies with distinct trajectories across the background
  const butterflies = useMemo(() => {
    const list: ButterflyData[] = [];
    const colors = ["#ff5e7e", "#ffd15c", "#00d2fc", "#c56cf0", "#ff9f43", "#32ff7e"];
    
    for (let i = 0; i < 16; i++) {
      // Spread them across the entire grass terrain size
      const x = (Math.random() - 0.5) * 52.0;
      const z = (Math.random() - 0.5) * 45.0 - 5.0; // cover from forest edge to near foreground
      const y = 0.5 + Math.random() * 4.5; // varied hovering heights

      list.push({
        id: i,
        initialPos: new THREE.Vector3(x, y, z),
        color: colors[i % colors.length],
        speed: 0.6 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        scale: 0.65 + Math.random() * 0.5,
        radiusX: 3.0 + Math.random() * 6.0,
        radiusZ: 3.0 + Math.random() * 6.0,
      });
    }
    return list;
  }, []);

  // 2. Animate positions and wing flapping
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    butterflies.forEach((b, idx) => {
      const group = butterfliesRef.current[idx];
      const leftWing = leftWingsRef.current[idx];
      const rightWing = rightWingsRef.current[idx];

      if (group) {
        // Flutter path: combination of horizontal orbital drift + vertical noise waves
        const angle = time * b.speed + b.phase;
        
        // Erratic circular/figure-eight motion
        const xOffset = Math.sin(angle) * b.radiusX + Math.cos(angle * 2.1) * 0.3;
        const zOffset = Math.cos(angle) * b.radiusZ + Math.sin(angle * 1.8) * 0.3;
        const yOffset = Math.sin(angle * 3.2) * 0.45 + Math.cos(angle * 1.5) * 0.15;

        const targetX = b.initialPos.x + xOffset;
        const targetZ = b.initialPos.z + zOffset;
        const targetY = Math.max(0.25, b.initialPos.y + yOffset); // stay above ground

        // Smoothly look at the direction of movement
        const currentPos = group.position.clone();
        const nextPos = new THREE.Vector3(targetX, targetY, targetZ);
        
        group.position.copy(nextPos);
        
        // Face the movement direction
        const moveDir = new THREE.Vector3().subVectors(nextPos, currentPos).normalize();
        if (moveDir.lengthSq() > 0.0001) {
          const targetRotationY = Math.atan2(moveDir.x, moveDir.z);
          // Interpolate rotation to prevent snapping
          group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotationY, 0.1);
          
          // Subtle tilt in pitch/roll based on movement speed
          group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, moveDir.y * 0.5, 0.1);
          group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, -Math.sin(angle) * 0.2, 0.1);
        }

        // 3. High-frequency wing flap animation (Z-axis rotation around the pivot offset)
        const flap = Math.sin(time * 30 + b.phase * 5) * 0.95;
        if (leftWing) leftWing.rotation.z = flap;
        if (rightWing) rightWing.rotation.z = -flap;
      }
    });

    // 4. Update material glows - butterflies glow brightly like spirits at night
    materialsRef.current.forEach((mat) => {
      if (mat) {
        // Brighten up at night (range 0.15 daytime -> 2.2 nighttime glow)
        const targetEmissive = THREE.MathUtils.lerp(0.15, 2.2, themeProgress);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetEmissive, 0.05);
      }
    });
  });

  return (
    <group>
      {butterflies.map((b, i) => (
        <group
          key={b.id}
          ref={(el) => {
            if (el) butterfliesRef.current[i] = el;
          }}
          scale={[b.scale, b.scale, b.scale]}
        >
          {/* Main Butterfly Group */}
          
          {/* Central Body (Dark minimal capsule) */}
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.16, 6]} />
            <meshBasicMaterial color="#1c1c1c" />
          </mesh>

          {/* Left Wing Group (Pivot at x=0) */}
          <group
            ref={(el) => {
              if (el) leftWingsRef.current[i] = el;
            }}
            position={[-0.015, 0, 0]}
          >
            <mesh position={[-0.09, 0, 0]}>
              <planeGeometry args={[0.18, 0.14]} />
              <meshStandardMaterial
                ref={(el) => {
                  if (el) materialsRef.current[i * 2] = el;
                }}
                color={b.color}
                emissive={b.color}
                emissiveIntensity={0.2}
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
                roughness={0.1}
                metalness={0.1}
              />
            </mesh>
          </group>

          {/* Right Wing Group (Pivot at x=0) */}
          <group
            ref={(el) => {
              if (el) rightWingsRef.current[i] = el;
            }}
            position={[0.015, 0, 0]}
          >
            <mesh position={[0.09, 0, 0]}>
              <planeGeometry args={[0.18, 0.14]} />
              <meshStandardMaterial
                ref={(el) => {
                  if (el) materialsRef.current[i * 2 + 1] = el;
                }}
                color={b.color}
                emissive={b.color}
                emissiveIntensity={0.2}
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
                roughness={0.1}
                metalness={0.1}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
