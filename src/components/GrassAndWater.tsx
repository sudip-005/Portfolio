"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GrassAndWaterProps {
  themeProgress: number; // 0: day, 1: night
}

// Simple seedable pseudo-random number generator (LCG) to make placements fully deterministic
function createSeedRandom(seed: number) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280.0;
  };
}

export default function GrassAndWater({ themeProgress }: GrassAndWaterProps) {
  const grassRef = useRef<THREE.InstancedMesh>(null);
  const flowersRef = useRef<THREE.InstancedMesh>(null);
  const flowerStemsRef = useRef<THREE.InstancedMesh>(null);
  const rocksRef = useRef<THREE.InstancedMesh>(null);
  const streamRef = useRef<THREE.Mesh>(null);
  
  const rockMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const flowerStemShaderRef = useRef<THREE.ShaderMaterial>(null);
  const groundShaderRef = useRef<THREE.ShaderMaterial>(null);
  const flowerShaderRef = useRef<THREE.ShaderMaterial>(null);

  const size = 95; // Ground size covering horizon

  // --- 1. Grass Setup ---
  const grassCount = 3600; // Densely populated grass field
  const grassBladesData = useMemo(() => {
    const rand = createSeedRandom(42);
    const tempObject = new THREE.Object3D();
    const positions: [number, number, number][] = [];
    
    for (let i = 0; i < grassCount; i++) {
      let x = 0;
      let z = 0;
      
      // Combined loop to avoid stream channel and tree base
      let valid = false;
      while (!valid) {
        x = (rand() - 0.5) * size;
        z = (rand() - 0.5) * size;
        const inStream = (x > -0.8 && x < 8.4);
        const nearTree = (Math.abs(x) < 1.5 && Math.abs(z) < 1.5);
        if (!inStream && !nearTree) {
          valid = true;
        }
      }

      const y = -0.05 + Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.3;
      positions.push([x, y, z]);
    }
    return { positions, tempObject };
  }, [grassCount]);

  // --- 2. Flowers Setup ---
  const flowerCount = 1200; // Scattered everywhere in huge quantity
  const flowerTypes = [
    "#ff577b", // vibrant pink (matching reference)
    "#ffa238", // bubbly orange/yellow
    "#9d66db", // soft purple
    "#ffffff", // clean white daisy
    "#fed136", // soft yellow
    "#ff3b3b", // bright red
    "#3db4ff", // soft blue
    "#e0b0ff", // soft lavender
  ];
  const flowersData = useMemo(() => {
    const rand = createSeedRandom(100);
    const tempObject = new THREE.Object3D();
    const positions: [number, number, number][] = [];
    const colors: string[] = [];

    for (let i = 0; i < flowerCount; i++) {
      let x = 0;
      let z = 0;

      // Combined loop to avoid stream channel and tree base
      let valid = false;
      while (!valid) {
        x = (rand() - 0.5) * (size - 4);
        z = (rand() - 0.5) * (size - 4);
        const inStream = (x > -0.8 && x < 8.4);
        const nearTree = (Math.abs(x) < 1.5 && Math.abs(z) < 1.5);
        if (!inStream && !nearTree) {
          valid = true;
        }
      }

      const y = 0.05 + Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.3;
      positions.push([x, y, z]);
      colors.push(flowerTypes[Math.floor(rand() * flowerTypes.length)]);
    }
    return { positions, colors, tempObject };
  }, [flowerCount]);

  const flowerColors = useMemo(() => {
    const array = new Float32Array(flowerCount * 3);
    const { colors } = flowersData;
    const tempColor = new THREE.Color();
    for (let i = 0; i < flowerCount; i++) {
      tempColor.set(colors[i]);
      array[i * 3] = tempColor.r;
      array[i * 3 + 1] = tempColor.g;
      array[i * 3 + 2] = tempColor.b;
    }
    return array;
  }, [flowersData, flowerCount]);

  // --- 3. Stones & Pebbles Setup ---
  const rockCount = 110;
  const rocksData = useMemo(() => {
    const rand = createSeedRandom(2026);
    const tempObject = new THREE.Object3D();
    const positions: [number, number, number][] = [];
    const scales: [number, number, number][] = [];
    const rotations: [number, number, number][] = [];

    for (let i = 0; i < rockCount; i++) {
      let x = 0;
      let z = 0;

      if (i < 55) {
        // Group 1: Riverbank stones
        const isLeft = i % 2 === 0;
        x = isLeft 
          ? 1.3 - rand() * 0.5 
          : 6.3 + rand() * 0.5;
        z = (rand() - 0.5) * (size - 4);
      } else if (i < 82) {
        // Group 2: Tree base stones
        const radius = 0.8 + rand() * 1.6;
        const angle = rand() * Math.PI * 2;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
      } else {
        // Group 3: Grass plain pebbles
        let valid = false;
        while (!valid) {
          x = (rand() - 0.5) * (size - 10);
          z = (rand() - 0.5) * (size - 10);
          const inStream = (x > -0.8 && x < 8.4);
          const nearTree = (Math.abs(x) < 1.2 && Math.abs(z) < 1.2);
          if (!inStream && !nearTree) {
            valid = true;
          }
        }
      }
      
      const y = -0.1 + Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.3;

      positions.push([x, y, z]);
      const scaleX = 0.12 + rand() * 0.28;
      const scaleY = 0.05 + rand() * 0.12;
      const scaleZ = 0.15 + rand() * 0.35;
      scales.push([scaleX, scaleY, scaleZ]);
      
      rotations.push([
        (rand() - 0.5) * 0.3,
        rand() * Math.PI,
        (rand() - 0.5) * 0.3
      ]);
    }
    return { positions, scales, rotations, tempObject };
  }, []);

  // Initialize instanced mesh matrices on mount (fully seeded for determinism)
  useEffect(() => {
    if (grassRef.current) {
      const { positions, tempObject } = grassBladesData;
      const rand = createSeedRandom(999);
      positions.forEach(([x, y, z], i) => {
        tempObject.position.set(x, y, z);
        tempObject.rotation.set(
          (rand() - 0.5) * 0.1,
          rand() * Math.PI,
          (rand() - 0.5) * 0.1
        );
        const scale = 0.7 + rand() * 0.6;
        tempObject.scale.set(scale, scale * 1.2, scale);
        tempObject.updateMatrix();
        grassRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      grassRef.current.instanceMatrix.needsUpdate = true;
    }

    if (flowersRef.current && flowerStemsRef.current) {
      const { positions, colors, tempObject } = flowersData;
      const rand = createSeedRandom(888);
      positions.forEach(([x, y, z], i) => {
        const stemScale = 0.6 + rand() * 0.5;
        const stemHeight = 0.35 * stemScale;
        
        // 1. Position and scale stem
        tempObject.position.set(x, y + stemHeight / 2, z);
        tempObject.rotation.set(0, rand() * Math.PI, 0);
        tempObject.scale.set(1.0, stemScale, 1.0);
        tempObject.updateMatrix();
        flowerStemsRef.current!.setMatrixAt(i, tempObject.matrix);
        
        // 2. Position and scale blossom on top of the stem
        tempObject.position.set(x, y + stemHeight, z);
        tempObject.rotation.set(
          -Math.PI / 2 + (rand() - 0.5) * 0.2,
          rand() * Math.PI,
          (rand() - 0.5) * 0.2
        );
        const blossomScale = 0.65 + rand() * 0.3;
        tempObject.scale.set(blossomScale, blossomScale, blossomScale);
        tempObject.updateMatrix();
        flowersRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      flowersRef.current.instanceMatrix.needsUpdate = true;
      flowerStemsRef.current.instanceMatrix.needsUpdate = true;
    }

    if (rocksRef.current) {
      const { positions, scales, rotations, tempObject } = rocksData;
      positions.forEach(([x, y, z], i) => {
        tempObject.position.set(x, y, z);
        tempObject.rotation.set(rotations[i][0], rotations[i][1], rotations[i][2]);
        tempObject.scale.set(scales[i][0], scales[i][1], scales[i][2]);
        tempObject.updateMatrix();
        rocksRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      rocksRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [grassBladesData, flowersData, rocksData]);

  // --- Custom Grass Wind Shader ---
  const grassShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uThemeProgress: { value: themeProgress },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        // Hash function for blade-specific seed
        float hash(vec3 p) {
          p = fract(p * vec3(443.897, 397.297, 491.187));
          p += dot(p.xyz, p.yzx + 19.19);
          return fract(p.x * p.y * p.z);
        }

        void main() {
          vUv = uv;
          vec3 pos = position;

          #ifdef USE_INSTANCING
            mat4 instanceMat = instanceMatrix;
          #else
            mat4 instanceMat = modelMatrix;
          #endif

          vec4 worldPos = instanceMat * vec4(pos, 1.0);
          vWorldPos = worldPos.xyz;

          float t = uv.y;
          float bladeSeed = hash(floor(worldPos.xyz * 25.0));

          // 1. Taper: width goes to 0 at the tip
          float widthProfile = sin((1.0 - t) * 1.57079);
          pos.x *= widthProfile;

          // 2. Crease: V-fold crease along length
          float xNormalized = abs(pos.x) / 0.04;
          pos.z += (1.0 - xNormalized) * 0.015 * widthProfile;

          // 3. Twist: rotate around Y-axis (xz) along the length for organic curvature
          float twist = (bladeSeed - 0.5) * 0.5 * t;
          float cosT = cos(twist);
          float sinT = sin(twist);
          pos.xz = vec2(pos.x * cosT - pos.z * sinT, pos.x * sinT + pos.z * cosT);

          // 4. Bend: curve grass backward dynamically
          pos.z -= t * t * 0.12;

          // 5. Wind sway (with variation across height and space)
          float windTime = uTime * 2.2;
          float sway = sin(windTime + worldPos.x * 0.5 + worldPos.z * 0.5) * 0.15 * t;
          float swayCross = cos(windTime * 1.5 + worldPos.x * 0.3) * 0.06 * t;

          pos.x += sway;
          pos.z += swayCross;

          gl_Position = projectionMatrix * viewMatrix * instanceMat * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uThemeProgress;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        float hash(vec3 p) {
          p = fract(p * vec3(443.897, 397.297, 491.187));
          p += dot(p.xyz, p.yzx + 19.19);
          return fract(p.x * p.y * p.z);
        }

        void main() {
          float t = vUv.y;
          vec3 N = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
          if (!gl_FrontFacing) N = -N;

          float bladeSeed = hash(floor(vWorldPos * 25.0));

          vec3 dayRoot = vec3(0.18, 0.28, 0.12);
          vec3 dayTip = vec3(0.42, 0.58, 0.32);
          
          vec3 nightRoot = vec3(0.04, 0.08, 0.08);
          vec3 nightTip = vec3(0.15, 0.28, 0.22);

          vec3 tint = vec3(bladeSeed * 0.08 - 0.04, bladeSeed * 0.1 - 0.05, bladeSeed * 0.04 - 0.02);
          dayTip += tint;
          dayRoot += tint * 0.5;
          nightTip += tint * 0.4;

          vec3 dayColor = mix(dayRoot, dayTip, t);
          vec3 nightColor = mix(nightRoot, nightTip, t);

          vec3 finalColor = mix(dayColor, nightColor, uThemeProgress);

          vec3 lightDir = normalize(vec3(-0.4, 0.8, 0.4));
          float NdotL = dot(N, lightDir);
          float cel = smoothstep(-0.2, 0.3, NdotL) * 0.25 + 0.75;

          gl_FragColor = vec4(finalColor * cel, 1.0);
        }
      `,
    };
  }, [themeProgress]);

  // --- Custom Stream/Water Shader ---
  const waterShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uThemeProgress: { value: themeProgress },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uThemeProgress;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                     mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
        }

        void main() {
          float speed = uTime * 0.8;
          
          vec2 uv1 = vec2(vWorldPos.z * 0.4 + speed, vWorldPos.x * 1.5);
          vec2 uv2 = vec2(vWorldPos.z * 0.6 - speed * 0.7, vWorldPos.x * 2.0);
          
          float n1 = noise(uv1);
          float n2 = noise(uv2);
          float ripple = (n1 + n2) * 0.5;

          vec3 dayWater = vec3(0.25, 0.52, 0.68);
          vec3 nightWater = vec3(0.05, 0.08, 0.18);
          vec3 baseWater = mix(dayWater, nightWater, uThemeProgress);

          vec3 specularColor = mix(vec3(1.0, 0.95, 0.85), vec3(0.8, 0.9, 1.0), uThemeProgress);
          float specIntensity = pow(ripple, 4.0) * 0.35;
          
          vec3 finalColor = baseWater + specularColor * specIntensity;
          float opacity = mix(0.85, 0.95, uThemeProgress);

          gl_FragColor = vec4(finalColor, opacity);
        }
      `,
    };
  }, [themeProgress]);

  // --- Custom Ground Shader ---
  const groundShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uThemeProgress: { value: themeProgress },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vNormal;

        void main() {
          vUv = uv;
          vNormal = normalMatrix * normal;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uThemeProgress;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vNormal;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                     mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
        }

        void main() {
          vec3 normalVec = normalize(vNormal);
          
          float n = noise(vWorldPos.xz * 0.25);
          float nCoarse = noise(vWorldPos.xz * 0.05);

          vec3 dayGrassLush = vec3(0.25, 0.48, 0.15);
          vec3 dayGrassDeep = vec3(0.14, 0.29, 0.08);
          vec3 dayGrass = mix(dayGrassDeep, dayGrassLush, n * 0.6 + nCoarse * 0.4);

          vec3 daySoil = vec3(0.24, 0.16, 0.09);
          vec3 daySand = vec3(0.82, 0.70, 0.44);

          vec3 nightGrassLush = vec3(0.04, 0.09, 0.08);
          vec3 nightGrassDeep = vec3(0.01, 0.03, 0.04);
          vec3 nightGrass = mix(nightGrassDeep, nightGrassLush, n * 0.6 + nCoarse * 0.4);

          vec3 nightSoil = vec3(0.08, 0.05, 0.03);
          vec3 nightSand = vec3(0.18, 0.14, 0.10);

          float riverDist = abs(vWorldPos.x - 3.8);
          float sandFactor = smoothstep(5.0, 2.5, riverDist);

          float treeDist = length(vWorldPos.xz);
          float soilFactor = smoothstep(2.5, 0.8, treeDist);

          vec3 dayColor = mix(dayGrass, daySand, sandFactor);
          dayColor = mix(dayColor, daySoil, soilFactor);

          vec3 nightColor = mix(nightGrass, nightSand, sandFactor);
          nightColor = mix(nightColor, nightSoil, soilFactor);

          vec3 finalColor = mix(dayColor, nightColor, uThemeProgress);

          vec3 lightDir = normalize(vec3(-0.4, 0.8, 0.4));
          float NdotL = dot(normalVec, lightDir);
          float cel = smoothstep(-0.2, 0.3, NdotL) * 0.38 + 0.62;

          gl_FragColor = vec4(finalColor * cel, 1.0);
        }
      `,
    };
  }, [themeProgress]);

  // --- Custom Flower Stem Shader ---
  const stemShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uThemeProgress: { value: themeProgress },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          vUv = uv;
          vec3 pos = position;

          #ifdef USE_INSTANCING
            mat4 instanceMat = instanceMatrix;
          #else
            mat4 instanceMat = modelMatrix;
          #endif

          vec4 worldPos = instanceMat * vec4(pos, 1.0);
          vWorldPos = worldPos.xyz;

          // Normalize local Y to [0, 1] (geometry height is 0.35, centered at 0)
          float t = (position.y + 0.175) / 0.35;
          t = clamp(t, 0.0, 1.0);

          // Get base instance position (at t=0)
          vec4 instanceBasePos = instanceMat * vec4(0.0, -0.175, 0.0, 1.0);

          // Wind sway sways stems dynamically
          float windTime = uTime * 2.2;
          float sway = sin(windTime + instanceBasePos.x * 0.5 + instanceBasePos.z * 0.5) * 0.15 * t;
          float swayCross = cos(windTime * 1.5 + instanceBasePos.x * 0.3) * 0.06 * t;

          pos.x += sway;
          pos.z += swayCross;

          gl_Position = projectionMatrix * viewMatrix * instanceMat * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uThemeProgress;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          vec3 dayStem = vec3(0.18, 0.32, 0.15); // rich green stem
          vec3 nightStem = vec3(0.03, 0.08, 0.02); // dark night green
          
          vec3 finalColor = mix(dayStem, nightStem, uThemeProgress);

          // Standard simple cel shading
          vec3 lightDir = normalize(vec3(-0.4, 0.8, 0.4));
          vec3 N = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
          if (!gl_FrontFacing) N = -N;
          
          float NdotL = dot(N, lightDir);
          float cel = smoothstep(-0.2, 0.3, NdotL) * 0.2 + 0.8;

          gl_FragColor = vec4(finalColor * cel, 1.0);
        }
      `,
    };
  }, [themeProgress]);

  // --- Custom 3D Clay Flower Shader (Bubbly reference-accurate layout) ---
  const flowerShader = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uThemeProgress: { value: themeProgress },
      },
      vertexShader: `
        uniform float uTime;
        attribute vec3 aColor;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vColor;

        void main() {
          vUv = uv;
          vColor = aColor;

          #ifdef USE_INSTANCING
            vec4 instanceWorldPos = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            float sx = length(vec3(instanceMatrix[0][0], instanceMatrix[0][1], instanceMatrix[0][2]));
            float sy = length(vec3(instanceMatrix[1][0], instanceMatrix[1][1], instanceMatrix[1][2]));
          #else
            vec4 instanceWorldPos = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            float sx = 1.0;
            float sy = 1.0;
          #endif

          // Wind sway sways flower heads in sync with stems
          vec3 instancePos = instanceWorldPos.xyz;
          float windTime = uTime * 2.2;
          float sway = sin(windTime + instancePos.x * 0.5 + instancePos.z * 0.5) * 0.15;
          float swayCross = cos(windTime * 1.5 + instancePos.x * 0.3) * 0.06;

          instancePos.x += sway;
          instancePos.z += swayCross;

          // Extract camera right and up vectors in world space from the view matrix
          vec3 camRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
          vec3 camUp = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);

          // Position the vertex facing the viewer
          vec3 vertexWorldPos = instancePos + camRight * position.x * sx + camUp * position.y * sy;

          vWorldPos = vertexWorldPos;
          gl_Position = projectionMatrix * viewMatrix * vec4(vertexWorldPos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uThemeProgress;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vColor;

        void main() {
          // Translate UV to center (range -0.5 to 0.5)
          vec2 rUv = vUv - vec2(0.5);
          float r = length(rUv) * 2.0; // Normalized radius from 0 to 1
          float phi = atan(rUv.y, rUv.x);

          // 8 very rounded, fat lobes for reference-accurate Ghibli clay flowers
          float numPetals = 8.0;
          float sharpness = 0.16;
          float baseRadius = 0.65;
          
          float petalShape = baseRadius + sharpness * cos(phi * numPetals);
          if (r > petalShape) discard;

          // 1. Calculate base geometric normal in screen space
          vec3 geomN = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
          if (!gl_FrontFacing) geomN = -geomN;

          // Scalloped center ring border (12 little bumps around main button dome)
          float centerSize = 0.235;
          float bumpLimit = centerSize + 0.05 + 0.035 * cos(phi * 12.0);
          vec3 finalNormal;
          
          vec3 centerColor = vec3(0.98, 0.82, 0.15); // rich yellow center
          vec3 petalColor = vColor;

          vec3 dayColor;
          if (r < bumpLimit) {
            // Hemisphere normal for the center dome -> makes it shade like a 3D ball
            float xNorm = rUv.x / (bumpLimit * 0.5);
            float zNorm = rUv.y / (bumpLimit * 0.5);
            float yNorm = sqrt(max(0.0, 1.0 - xNorm*xNorm - zNorm*zNorm));
            vec3 domeNormal = normalize(vec3(xNorm, yNorm * 0.8, zNorm));
            
            // Smoothly blend dome normal with geometry normal at the edges
            float centerBlend = smoothstep(bumpLimit - 0.08, bumpLimit, r);
            finalNormal = normalize(mix(domeNormal, geomN, centerBlend));
            dayColor = mix(centerColor, petalColor, centerBlend);
          } else {
            // Cupped normal for petals -> curves the outer edges upwards like a bowl
            vec3 bowlNormal = normalize(vec3(rUv.x, 0.62, rUv.y));
            finalNormal = normalize(mix(geomN, bowlNormal, 0.65));
            dayColor = petalColor;
          }

          // Crease separation: Darken the transition between the 8 fat petals
          float petalRadial = cos(phi * 8.0);
          float crease = smoothstep(-1.0, -0.6, petalRadial);
          dayColor *= mix(0.55, 1.0, crease);

          // Night coloring (cool moonlight ambient glow)
          vec3 nightPetal = mix(petalColor * 0.15, vec3(0.08, 0.22, 0.38), 0.45);
          vec3 nightCenter = vec3(0.35, 0.28, 0.06);
          vec3 nightColor;
          if (r < bumpLimit) {
            float centerBlend = smoothstep(bumpLimit - 0.08, bumpLimit, r);
            nightColor = mix(nightCenter, nightPetal, centerBlend);
          } else {
            nightColor = nightPetal;
          }
          nightColor += vec3(0.03, 0.08, 0.12) * (1.0 - smoothstep(0.2, 0.5, r));

          vec3 finalColor = mix(dayColor, nightColor, uThemeProgress);

          // Cel-shaded clay style lighting
          vec3 lightDir = normalize(vec3(-0.4, 0.8, 0.4));
          float NdotL = dot(finalNormal, lightDir);
          float cel = smoothstep(-0.25, 0.25, NdotL) * 0.25 + 0.75;

          gl_FragColor = vec4(finalColor * cel, 1.0);
        }
      `,
    };
  }, [themeProgress]);

  // --- Animation Updates ---
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const progress = themeProgress;

    if (grassRef.current) {
      const mat = grassRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms) {
        mat.uniforms.uTime.value = time;
        mat.uniforms.uThemeProgress.value = THREE.MathUtils.lerp(
          mat.uniforms.uThemeProgress.value,
          progress,
          0.05
        );
      }
    }

    if (streamRef.current) {
      const mat = streamRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms) {
        mat.uniforms.uTime.value = time;
        mat.uniforms.uThemeProgress.value = THREE.MathUtils.lerp(
          mat.uniforms.uThemeProgress.value,
          progress,
          0.05
        );
      }
    }

    if (groundShaderRef.current) {
      groundShaderRef.current.uniforms.uTime.value = time;
      groundShaderRef.current.uniforms.uThemeProgress.value = THREE.MathUtils.lerp(
        groundShaderRef.current.uniforms.uThemeProgress.value,
        progress,
        0.05
      );
    }

    if (flowerShaderRef.current) {
      flowerShaderRef.current.uniforms.uTime.value = time;
      flowerShaderRef.current.uniforms.uThemeProgress.value = THREE.MathUtils.lerp(
        flowerShaderRef.current.uniforms.uThemeProgress.value,
        progress,
        0.05
      );
    }

    if (flowerStemShaderRef.current) {
      flowerStemShaderRef.current.uniforms.uTime.value = time;
      flowerStemShaderRef.current.uniforms.uThemeProgress.value = THREE.MathUtils.lerp(
        flowerStemShaderRef.current.uniforms.uThemeProgress.value,
        progress,
        0.05
      );
    }

    if (rockMaterialRef.current) {
      const dayRock = new THREE.Color("#8c857b");
      const nightRock = new THREE.Color("#0c0f16");
      rockMaterialRef.current.color.lerpColors(dayRock, nightRock, progress);
    }
  });

  const groundGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, 40, 40);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      
      let y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.3;
      const streamDist = Math.abs(x - 3.8);
      if (streamDist < 4.2) {
        y -= (4.2 - streamDist) * 0.18;
      }
      
      pos.setZ(i, y);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      {/* 1. Main Ground Terrain with Painterly Shader */}
      <mesh geometry={groundGeometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shaderMaterial
          ref={groundShaderRef}
          vertexShader={groundShader.vertexShader}
          fragmentShader={groundShader.fragmentShader}
          uniforms={groundShader.uniforms}
        />
      </mesh>

      {/* 2. Instanced Grass Fields (Tapered, bent, twisted, creased 3D blades) */}
      <instancedMesh
        key={`grass-${grassCount}`}
        ref={grassRef}
        args={[null as any, null as any, grassCount]}
      >
        <planeGeometry args={[0.08, 0.7, 1, 4]} />
        <shaderMaterial
          vertexShader={grassShader.vertexShader}
          fragmentShader={grassShader.fragmentShader}
          uniforms={grassShader.uniforms}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      {/* 3. Instanced Flowers (Scattered everywhere, big heads, scalloped centers) */}
      <instancedMesh
        key={`flowers-${flowerCount}`}
        ref={flowersRef}
        args={[null as any, null as any, flowerCount]}
      >
        <planeGeometry args={[0.32, 0.32]}>
          <instancedBufferAttribute
            attach="attributes-aColor"
            args={[flowerColors, 3]}
          />
        </planeGeometry>
        <shaderMaterial
          ref={flowerShaderRef}
          vertexShader={flowerShader.vertexShader}
          fragmentShader={flowerShader.fragmentShader}
          uniforms={flowerShader.uniforms}
          side={THREE.DoubleSide}
          transparent={false}
          depthWrite={true}
        />
      </instancedMesh>

      {/* Flower Stems (Thinned to 0.005 radius) */}
      <instancedMesh
        key={`stems-${flowerCount}`}
        ref={flowerStemsRef}
        args={[null as any, null as any, flowerCount]}
      >
        <cylinderGeometry args={[0.005, 0.005, 0.35, 4]} />
        <shaderMaterial
          ref={flowerStemShaderRef}
          vertexShader={stemShader.vertexShader}
          fragmentShader={stemShader.fragmentShader}
          uniforms={stemShader.uniforms}
        />
      </instancedMesh>

      {/* 4. Instanced Riverbank & Tree base Pebbles */}
      <instancedMesh
        key={`rocks-${rockCount}`}
        ref={rocksRef}
        args={[null as any, null as any, rockCount]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial ref={rockMaterialRef} roughness={0.8} metalness={0.15} />
      </instancedMesh>

      {/* 5. Stream / Water */}
      <mesh
        ref={streamRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[3.8, -0.12, 0]}
        receiveShadow
      >
        <planeGeometry args={[4.8, size, 1, 20]} />
        <shaderMaterial
          vertexShader={waterShader.vertexShader}
          fragmentShader={waterShader.fragmentShader}
          uniforms={waterShader.uniforms}
          transparent={true}
        />
      </mesh>
    </group>
  );
}
