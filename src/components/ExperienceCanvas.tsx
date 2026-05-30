"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Scene from "./Scene";

interface ExperienceCanvasProps {
  isDark: boolean;
  themeProgress: number; // 0: day, 1: night
}

// Camera Controller handles scroll keyframes, cursor parallax, and theme zoom effects
function CameraController({ themeProgress }: { themeProgress: number }) {
  const { camera } = useThree();
  const scrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Pushed camera coordinates further back (z values increased) to show the tree and landscape properly
  const keyframes = [
    {
      // Hero (Tree is offset to the right in the frame, text card on left)
      pos: new THREE.Vector3(0.8, 3.2, 16.0),
      look: new THREE.Vector3(0.0, 1.8, 0.0),
    },
    {
      // About
      pos: new THREE.Vector3(-7.8, 2.5, 14.0),
      look: new THREE.Vector3(3.4, 0.6, 0.6),
    },
    {
      // Skills
      pos: new THREE.Vector3(2.2, 1.2, 7.5),
      look: new THREE.Vector3(2.2, 4.5, -0.5),
    },
    {
      // Projects
      pos: new THREE.Vector3(18.2, 7.0, 16.0),
      look: new THREE.Vector3(2.2, 2.2, 0.0),
    },
    {
      // Experience
      pos: new THREE.Vector3(-9.8, 5.0, -12.0),
      look: new THREE.Vector3(2.2, 1.8, 1.0),
    },
    {
      // Contact
      pos: new THREE.Vector3(4.7, 2.2, 9.5),
      look: new THREE.Vector3(2.2, 1.0, 0.5),
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetScrollRef.current = maxScroll > 0 ? scrollY / maxScroll : 0;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);
    
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Update Camera in the frame loop
  useFrame((state) => {
    // Smooth out scroll progression using lerp
    scrollRef.current = THREE.MathUtils.lerp(scrollRef.current, targetScrollRef.current, 0.04);
    
    // Calculate keyframe index and local interpolation weight
    const totalSegments = keyframes.length - 1;
    const progress = scrollRef.current * totalSegments;
    const index = Math.min(Math.floor(progress), totalSegments - 1);
    const weight = progress - index;

    const currentFrame = keyframes[index];
    const nextFrame = keyframes[index + 1];

    const pos = new THREE.Vector3().lerpVectors(currentFrame.pos, nextFrame.pos, weight);
    const look = new THREE.Vector3().lerpVectors(currentFrame.look, nextFrame.look, weight);

    // Apply cursor parallax (subtle offset based on pointer)
    const parallaxX = mouseRef.current.x * 0.45;
    const parallaxY = mouseRef.current.y * 0.3;
    pos.x += parallaxX;
    pos.y += parallaxY;

    // --- Cinematic Theme Zoom Offset ---
    // Camera zooms out slightly in the middle of day/night transition, and pulls back in as it settles
    const zoomOffset = Math.sin(themeProgress * Math.PI) * 1.8;
    
    // Calculate look direction vector
    const lookDir = new THREE.Vector3().subVectors(pos, look).normalize();
    // Offset the camera position backwards along its look direction
    pos.addScaledVector(lookDir, zoomOffset);

    // Smoothly update camera position
    camera.position.lerp(pos, 0.07);

    // Smoothly update camera rotation
    const targetLook = new THREE.Vector3().copy(look);
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.lookAt(camera.position, targetLook, new THREE.Vector3(0, 1, 0));
    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(tempMatrix);
    camera.quaternion.slerp(targetQuaternion, 0.07);
  });

  return null;
}

export default function ExperienceCanvas({ isDark, themeProgress }: ExperienceCanvasProps) {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none canvas-container bg-[#f5f2eb] dark:bg-[#0c0d12]">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0.6, 2.2, 9.8], fov: 45, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <Scene isDark={isDark} themeProgress={themeProgress} />
        <CameraController themeProgress={themeProgress} />
      </Canvas>
    </div>
  );
}
