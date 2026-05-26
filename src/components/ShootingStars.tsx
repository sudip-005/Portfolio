"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ShootingStarsProps {
  themeProgress: number; // 0: day, 1: night
}

interface ShootingStarState {
  x: number;
  y: number;
  z: number;
  dirX: number;
  dirY: number;
  speed: number;
  length: number;
  active: boolean;
  progress: number;
  cooldown: number;
}

export default function ShootingStars({ themeProgress }: ShootingStarsProps) {
  const meshesRef = useRef<(THREE.Mesh | null)[]>([]);
  const materialsRef = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  // 3 shooting stars running independently — all travel upper-right → lower-left
  const DIR_X = -0.82;
  const DIR_Y = -0.57;
  const starsState = useRef<ShootingStarState[]>([
    { x: 0, y: 0, z: -40, dirX: DIR_X, dirY: DIR_Y, speed: 28.0, length: 2.2, active: false, progress: 0, cooldown: 1.5 },
    { x: 0, y: 0, z: -40, dirX: DIR_X, dirY: DIR_Y, speed: 34.0, length: 2.8, active: false, progress: 0, cooldown: 4.5 },
    { x: 0, y: 0, z: -40, dirX: DIR_X, dirY: DIR_Y, speed: 24.0, length: 1.8, active: false, progress: 0, cooldown: 8.0 },
  ]);

  useFrame((state, delta) => {
    // Limit delta to prevent huge jumps on lag spikes
    const dt = Math.min(delta, 0.1);
    
    // Only run shooting stars at night
    const isNight = themeProgress > 0.4;

    starsState.current.forEach((s, idx) => {
      const mesh = meshesRef.current[idx];
      const mat = materialsRef.current[idx];

      if (!mesh || !mat) return;

      if (!isNight) {
        // Keep hidden during daytime
        mesh.scale.setScalar(0.001);
        mat.opacity = 0;
        s.active = false;
        return;
      }

      const duration = s.length / s.speed + 0.5; // duration of streak in seconds

      if (!s.active) {
        // Cooldown period
        mesh.scale.setScalar(0.001);
        mat.opacity = 0;
        s.cooldown -= dt;
        if (s.cooldown <= 0) {
          // Initialize a new shooting star streak — always spawn upper-right, travel lower-left
          s.x = 15.0 + Math.random() * 20.0;  // upper-right region
          s.y = 14.0 + Math.random() * 8.0;   // high in the sky
          s.z = -38.0 - Math.random() * 10.0; // background depth

          // Fixed direction: upper-right → lower-left (consistent meteor shower)
          s.dirX = DIR_X;
          s.dirY = DIR_Y;
          s.speed = 22.0 + Math.random() * 14.0;
          s.length = 1.8 + Math.random() * 1.5;
          s.progress = 0.0;
          s.active = true;
        }
      } else {
        // Active streak animation
        s.progress += dt;

        if (s.progress >= duration) {
          // Reset for next cooldown
          s.active = false;
          s.cooldown = 4.0 + Math.random() * 8.0; // random cooldown until next streak
        } else {
          // Calculate current head position
          const currentX = s.x + s.dirX * s.speed * s.progress;
          const currentY = s.y + s.dirY * s.speed * s.progress;
          
          mesh.position.set(currentX, currentY, s.z);
          mesh.scale.set(1, 1, 1);

          // Align rotation with direction vector (angle offset around Z-axis)
          const angle = Math.atan2(s.dirY, s.dirX);
          mesh.rotation.z = angle - Math.PI / 2; // cylinder default is Y-axis alignment

          // Fade-in at start, fade-out at tail
          const normProgress = s.progress / duration;
          const opacity = Math.sin(normProgress * Math.PI) * 0.95;
          mat.opacity = opacity * themeProgress; // scale by night progress
        }
      }
    });
  });

  return (
    <group>
      {starsState.current.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) meshesRef.current[i] = el;
          }}
          scale={[0.001, 0.001, 0.001]}
        >
          {/* Tapered cylinder: top is 0.002 (tail), bottom is 0.038 (head) */}
          <cylinderGeometry args={[0.002, 0.038, s.length, 4]} />
          <meshBasicMaterial
            ref={(el) => {
              if (el) materialsRef.current[i] = el;
            }}
            color="#e3f0ff"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
