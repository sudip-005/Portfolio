"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import SkyAndAtmosphere from "./SkyAndAtmosphere";
import GrassAndWater from "./GrassAndWater";
import Tree from "./Tree";
import Character from "./Character";
import Butterflies from "./Butterflies";
import Birds from "./Birds";
import JumpingFishes from "./JumpingFishes";
import ShootingStars from "./ShootingStars";

interface SceneProps {
  isDark: boolean;
  themeProgress: number; // 0: day, 1: night
}

export default function Scene({ isDark, themeProgress }: SceneProps) {
  // Lighting references
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const moonLightRef = useRef<THREE.DirectionalLight>(null);
  const treeGlowLightRef = useRef<THREE.PointLight>(null);
  const characterNightLightRef = useRef<THREE.PointLight>(null);
  const fogRef = useRef<THREE.FogExp2>(null);

  // Update light intensities and fog colors in the R3F frame loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const progress = themeProgress;

    // 1. Ambient Light
    if (ambientLightRef.current) {
      const dayColor = new THREE.Color("#e8efe9");
      const dayIntensity = 1.1;
      const nightColor = new THREE.Color("#0c0f1d");
      const nightIntensity = 0.65;

      ambientLightRef.current.color.lerpColors(dayColor, nightColor, progress);
      ambientLightRef.current.intensity = THREE.MathUtils.lerp(dayIntensity, nightIntensity, progress);
    }

    // 2. Sunlight (Directional)
    if (sunLightRef.current) {
      const sunColor = new THREE.Color("#fffefa");
      const targetIntensity = THREE.MathUtils.lerp(2.2, 0.0, progress);
      sunLightRef.current.intensity = THREE.MathUtils.lerp(sunLightRef.current.intensity, targetIntensity, 0.08);
      sunLightRef.current.color.copy(sunColor);

      sunLightRef.current.position.x = 20 * Math.cos(time * 0.03);
      sunLightRef.current.position.z = -15 + 10 * Math.sin(time * 0.03);
    }

    // 3. Moonlight (Directional)
    if (moonLightRef.current) {
      const moonColor = new THREE.Color("#adcaff");
      const targetIntensity = THREE.MathUtils.lerp(0.0, 1.8, progress);
      moonLightRef.current.intensity = THREE.MathUtils.lerp(moonLightRef.current.intensity, targetIntensity, 0.08);
      moonLightRef.current.color.copy(moonColor);

      moonLightRef.current.position.x = -15 * Math.cos(time * 0.02 + Math.PI);
      moonLightRef.current.position.z = 20 * Math.sin(time * 0.02 + Math.PI);
    }

    // 4. Subtle glowing moonlight around the central tree canopy at night
    if (treeGlowLightRef.current) {
      const targetIntensity = THREE.MathUtils.lerp(0.0, 2.0, progress);
      treeGlowLightRef.current.intensity = THREE.MathUtils.lerp(treeGlowLightRef.current.intensity, targetIntensity, 0.05);
      if (progress > 0.5) {
        treeGlowLightRef.current.intensity += Math.sin(time * 1.5) * 0.15;
      }
    }

    // 4b. Soft warm light on character at night
    if (characterNightLightRef.current) {
      const targetIntensity = THREE.MathUtils.lerp(0.0, 1.8, progress);
      characterNightLightRef.current.intensity = THREE.MathUtils.lerp(
        characterNightLightRef.current.intensity,
        targetIntensity,
        0.08
      );
    }

    // 5. Exponential Fog
    if (fogRef.current) {
      const dayFogColor = new THREE.Color("#ebf0e9");
      const dayFogDensity = 0.012;
      const nightFogColor = new THREE.Color("#0c0d12");
      const nightFogDensity = 0.018;

      fogRef.current.color.lerpColors(dayFogColor, nightFogColor, progress);
      fogRef.current.density = THREE.MathUtils.lerp(dayFogDensity, nightFogDensity, progress);
    }
  });

  return (
    <group>
      {/* 1. Global Scene Fog */}
      <fogExp2 ref={fogRef} attach="fog" args={["#ebf0e9", 0.012]} />

      {/* 2. Ambient Lighting Rig */}
      <ambientLight ref={ambientLightRef} intensity={1.1} color="#e8efe9" />

      {/* 3. Sunlight */}
      <directionalLight
        ref={sunLightRef}
        position={[15, 30, -10]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0005}
      />

      {/* 4. Moonlight */}
      <directionalLight
        ref={moonLightRef}
        position={[-15, 25, 20]}
        intensity={0}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.0005}
      />

      {/* 6. Sky & Atmosphere Background (stays centered) */}
      <SkyAndAtmosphere isDark={isDark} themeProgress={themeProgress} />
      <ShootingStars themeProgress={themeProgress} />
      <Birds themeProgress={themeProgress} />

      {/* Shifted Environment Group (tree, character, landscape elements offset right by 2.2 units) */}
      <group position={[2.2, 0, 0]}>
        {/* 5. Tree Moonlight Glow (placed inside canopy y=5.5) */}
        <pointLight
          ref={treeGlowLightRef}
          position={[0, 5.5, 0]}
          intensity={0}
          distance={15}
          decay={2.0}
          color="#8ae0ff"
        />

        {/* 5b. Character Night Light */}
        <pointLight
          ref={characterNightLightRef}
          position={[0, 1.1, 1.8]}
          intensity={0}
          distance={6}
          decay={1.6}
          color="#ffe2b5"
        />

        {/* Core Shifted Environment Objects */}
        <GrassAndWater themeProgress={themeProgress} />
        <Tree themeProgress={themeProgress} />
        <Character themeProgress={themeProgress} />
        <Butterflies themeProgress={themeProgress} />
        <JumpingFishes themeProgress={themeProgress} />
      </group>
    </group>
  );
}
