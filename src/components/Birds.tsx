"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BirdsProps {
  themeProgress: number; // 0: day, 1: night
}

interface BirdData {
  id: number;
  speed: number;
  height: number;
  depth: number;
  phase: number;
  scale: number;
  flapSpeed: number;
  direction: number; // 1: left-to-right, -1: right-to-left
  yOscAmp: number;   // height oscillation amplitude
  yOscFreq: number;  // height oscillation frequency
}

export default function Birds({ themeProgress }: BirdsProps) {
  const birdsRef = useRef<THREE.Group[]>([]);
  const leftWingsRef = useRef<THREE.Group[]>([]);
  const rightWingsRef = useRef<THREE.Group[]>([]);

  // Generate 10 birds flying on randomized independent paths
  const birds = useMemo((): BirdData[] => {
    const list: BirdData[] = [];
    for (let i = 0; i < 10; i++) {
      const direction = Math.random() > 0.45 ? 1 : -1;
      list.push({
        id: i,
        speed: 3.2 + Math.random() * 2.4, // randomized flight speeds
        height: 11.5 + Math.random() * 6.5, // randomized heights (so they fit in screen view)
        depth: -58.0 + Math.random() * 12.0, // randomized background depths
        phase: Math.random() * Math.PI * 2,
        scale: 0.55 + Math.random() * 0.35, // randomized scales for depth/size variety
        flapSpeed: 12 + Math.random() * 6,
        direction,
        yOscAmp: 0.4 + Math.random() * 0.8,
        yOscFreq: 0.6 + Math.random() * 0.8,
      });
    }
    return list;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const showFactor = Math.max(0.0, 1.0 - themeProgress); // 1.0 at day, 0.0 at night

    birds.forEach((b, idx) => {
      const group = birdsRef.current[idx];
      const leftWing = leftWingsRef.current[idx];
      const rightWing = rightWingsRef.current[idx];

      if (group) {
        // Adjust scale dynamically (fades out at night)
        const currentScale = b.scale * showFactor;
        group.scale.set(currentScale, currentScale, currentScale);

        if (currentScale > 0.01) {
          // Travel distance from -80 to 80 (total 160 units)
          const pathWidth = 160.0;
          const progress = (time * b.speed + b.phase * 20.0) % pathWidth;
          
          let x = -80.0 + progress;
          if (b.direction === -1) {
            x = 80.0 - progress;
          }

          // Gentle height oscillation
          const y = b.height + Math.sin(time * b.yOscFreq + b.phase) * b.yOscAmp;
          const z = b.depth;

          group.position.set(x, y, z);
          
          // Face the direction of flight (positive X or negative X)
          const yaw = b.direction === 1 ? Math.PI / 2 : -Math.PI / 2;
          
          // Pitch rotation based on height derivative
          const dy = Math.cos(time * b.yOscFreq + b.phase) * b.yOscAmp * b.yOscFreq;
          const pitch = Math.atan2(dy, b.speed) * b.direction;

          group.rotation.set(pitch, yaw, 0);

          // Wing flapping
          const flap = Math.sin(time * b.flapSpeed + b.phase) * 0.65;
          if (leftWing) leftWing.rotation.z = flap;
          if (rightWing) rightWing.rotation.z = -flap;
        }
      }
    });
  });

  return (
    <group>
      {birds.map((b, i) => (
        <group
          key={b.id}
          ref={(el) => {
            if (el) birdsRef.current[i] = el;
          }}
        >
          {/* Bird Body: oriented along Z axis in local space */}
          <group rotation={[Math.PI / 2, 0, 0]}>
            {/* Main torso */}
            <mesh>
              <cylinderGeometry args={[0.12, 0.09, 0.85, 4]} />
              <meshBasicMaterial color="#1f1f1f" />
            </mesh>
            {/* Beak / Head */}
            <mesh position={[0, 0.45, 0]}>
              <coneGeometry args={[0.08, 0.2, 4]} />
              <meshBasicMaterial color="#1f1f1f" />
            </mesh>
          </group>

          {/* Left Wing Group (hinge at x = -0.09) */}
          <group
            ref={(el) => {
              if (el) leftWingsRef.current[i] = el;
            }}
            position={[-0.09, 0, 0]}
          >
            <mesh position={[-0.6, 0, 0]} rotation={[0.0, 0, 0.08]}>
              <planeGeometry args={[1.2, 0.42]} />
              <meshBasicMaterial color="#111111" side={THREE.DoubleSide} />
            </mesh>
          </group>

          {/* Right Wing Group (hinge at x = 0.09) */}
          <group
            ref={(el) => {
              if (el) rightWingsRef.current[i] = el;
            }}
            position={[0.09, 0, 0]}
          >
            <mesh position={[0.6, 0, 0]} rotation={[0.0, 0, -0.08]}>
              <planeGeometry args={[1.2, 0.42]} />
              <meshBasicMaterial color="#111111" side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
