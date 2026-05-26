"use client";

import React, { useRef, useMemo, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TreeProps {
  themeProgress: number; // 0: day, 1: night
}

export default function Tree({ themeProgress }: TreeProps) {
  const leavesRef = useRef<THREE.InstancedMesh>(null);
  const fallingLeavesRef = useRef<THREE.Mesh[]>([]);
  const treeGroupRef = useRef<THREE.Group>(null);

  // Jerk state: startTime=-1 means inactive, amplitude controls shake strength
  const jerkRef = useRef({ startTime: -1, amplitude: 0, dirX: 1 });

  // --- 1. Procedural Bark Canvas Texture ---
  const barkTexture = useMemo(() => {
    if (typeof window === "undefined") return null;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fill base warm medium brown
    ctx.fillStyle = "#9b6c48";
    ctx.fillRect(0, 0, 1024, 1024);

    // Stylized bark vertical stripes
    const colors = [
      "#5d391d", // dark brown
      "#4c2d15", // very dark brown
      "#aa7b54", // mid-light brown
      "#be8b60", // golden tan
      "#d4a57b", // highlight tan
      "#805332", // mid brown
    ];

    for (let i = 0; i < 200; i++) {
      ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.lineWidth = 2 + Math.random() * 8;
      ctx.globalAlpha = 0.55 + Math.random() * 0.45;

      ctx.beginPath();
      const startX = Math.random() * 1024;
      ctx.moveTo(startX, 0);

      // Draw wavy line down with low frequency and high frequency wiggles
      let currentX = startX;
      for (let y = 0; y <= 1024; y += 40) {
        const wiggle = Math.sin(y * 0.015 + startX) * 25 + Math.sin(y * 0.08) * 6;
        currentX = startX + wiggle;
        ctx.lineTo(currentX, y);
      }
      ctx.stroke();
    }

    // Add some fine wood grain knots
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 15; i++) {
      ctx.fillStyle = "#3a200a";
      const knotX = Math.random() * 1024;
      const knotY = Math.random() * 1024;
      const knotRadius = 15 + Math.random() * 30;
      ctx.beginPath();
      ctx.arc(knotX, knotY, knotRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 1);
    return texture;
  }, []);

  // --- 2. Custom Trunk & Branch Shaders Setup ---
  const trunkShader = useMemo(() => {
    return {
      vertexShader: `
        uniform vec2 uBend;
        uniform float uLength;
        uniform float uIsTrunk;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPos;

        void main() {
          vUv = uv;
          vNormal = normalMatrix * normal;
          
          vec3 pos = position;
          
          // Normalize height coordinate from 0.0 at bottom to 1.0 at top
          float h = position.y + uLength * 0.5;
          float t = clamp(h / uLength, 0.0, 1.0);
          
          // 1. Base root flare - 5 sweeping roots (only for main trunk)
          if (uIsTrunk > 0.5) {
            float rootFactor = smoothstep(1.0, 0.0, t * 2.8); // only flares at bottom 35%
            float angle = atan(pos.z, pos.x);
            // Create 5 sweeping finger-like roots with quadratic decay
            float flare = (sin(angle * 5.0) * 0.38 + 0.52) * rootFactor * rootFactor;
            pos.xz += normalize(pos.xz) * flare;
          }
          
          // 2. Quadratic bend along height
          pos.x += uBend.x * t * t;
          pos.z += uBend.y * t * t;
          
          // 3. Subtle wind sway (stronger at the tips)
          float sway = sin(uTime * 1.4 + position.y) * 0.04 * t;
          pos.x += sway;
          
          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPos = worldPos.xyz;
          
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uThemeProgress;
        uniform sampler2D uTexture;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPos;

        void main() {
          vec3 normalVec = normalize(vNormal);
          // Warm cartoon lighting direction from top-left
          vec3 lightDir = normalize(vec3(-0.4, 0.8, 0.4));
          float NdotL = dot(normalVec, lightDir);
          
          // Sharp cel-shading transition
          float cel = smoothstep(-0.15, 0.15, NdotL) * 0.45 + 0.55;
          
          // Look up bark texture
          vec3 barkColor = texture2D(uTexture, vUv * vec2(2.0, 1.0)).rgb;
          
          // Highlight and shadow blend
          vec3 highlight = barkColor * 1.25;
          vec3 shadow = barkColor * 0.58;
          vec3 dayFinal = mix(shadow, highlight, cel);
          
          // Add mossy base green tint near soil Y < 1.0
          float mossFactor = smoothstep(1.0, 0.1, vWorldPos.y);
          vec3 mossColor = vec3(0.22, 0.42, 0.14) * (barkColor.r * 0.8 + 0.2); // structured by bark texture
          dayFinal = mix(dayFinal, mossColor, mossFactor * 0.35);
          
          // Add vertical gradient to trunk (darker base, lighter top)
          float heightFactor = clamp((vWorldPos.y - 0.2) / 4.0, 0.0, 1.0);
          dayFinal = mix(dayFinal * 0.75, dayFinal * 1.1, heightFactor);
          
          // Night colors - deep navy/indigo shade with a subtle glowing indigo rim light
          vec3 nightBase = dayFinal * vec3(0.1, 0.12, 0.22);
          float rim = 1.0 - clamp(dot(normalVec, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
          vec3 nightFinal = nightBase + vec3(0.04, 0.09, 0.24) * rim * rim;
          
          // Moss dims down at night but retains a cool, dark green ambient tone
          vec3 nightMoss = mix(nightFinal, vec3(0.02, 0.09, 0.05), mossFactor * 0.25);
          nightFinal = mix(nightFinal, nightMoss, mossFactor);
          
          vec3 finalColor = mix(dayFinal, nightFinal, uThemeProgress);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    };
  }, []);

  const trunkMaterialsUniforms = useMemo(() => {
    const defaultTex = new THREE.Texture();
    return {
      trunk: {
        uTime: { value: 0 },
        uThemeProgress: { value: themeProgress },
        uTexture: { value: barkTexture || defaultTex },
        uBend: { value: new THREE.Vector2(0.25, 0.1) },
        uLength: { value: 3.8 },
        uIsTrunk: { value: 1.0 },
      },
      branch1: {
        uTime: { value: 0 },
        uThemeProgress: { value: themeProgress },
        uTexture: { value: barkTexture || defaultTex },
        uBend: { value: new THREE.Vector2(-0.6, 0.2) },
        uLength: { value: 2.2 },
        uIsTrunk: { value: 0.0 },
      },
      branch2: {
        uTime: { value: 0 },
        uThemeProgress: { value: themeProgress },
        uTexture: { value: barkTexture || defaultTex },
        uBend: { value: new THREE.Vector2(0.6, -0.1) },
        uLength: { value: 2.2 },
        uIsTrunk: { value: 0.0 },
      },
      branch3: {
        uTime: { value: 0 },
        uThemeProgress: { value: themeProgress },
        uTexture: { value: barkTexture || defaultTex },
        uBend: { value: new THREE.Vector2(0.1, 0.5) },
        uLength: { value: 1.8 },
        uIsTrunk: { value: 0.0 },
      },
      branch4: {
        uTime: { value: 0 },
        uThemeProgress: { value: themeProgress },
        uTexture: { value: barkTexture || defaultTex },
        uBend: { value: new THREE.Vector2(-0.1, -0.5) },
        uLength: { value: 1.8 },
        uIsTrunk: { value: 0.0 },
      },
    };
  }, [barkTexture, themeProgress]);

  // --- 3. Custom 3D Leaf Shader ---
  const canopyShader = useMemo(() => {
    return {
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          vUv = uv;
          vec3 pos = position;
          
          // Normalize height coordinate
          float t = clamp((pos.y + 0.35) / 0.7, 0.0, 1.0);
          
          // 1. Taper shape into teardrop leaf
          float widthProfile = sin(t * 3.14159) * (1.0 - t * 0.25);
          pos.x *= widthProfile;
          
          // 2. Add center crease (V-fold)
          float xNormalized = abs(pos.x) / 0.25;
          pos.z += (1.0 - xNormalized) * 0.12 * widthProfile;
          
          // 3. Cup the leaf along its length
          pos.z -= sin(t * 3.14159) * 0.06;
          
          // Subtle wind flutter in local space
          float flutter = sin(uTime * 5.0 + position.x * 10.0 + position.y * 8.0) * 0.015 * t;
          pos.z += flutter;
          
          #ifdef USE_INSTANCING
            vec4 worldPos = modelMatrix * instanceMatrix * vec4(pos, 1.0);
          #else
            vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          #endif
          
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uThemeProgress;
        varying vec2 vUv;
        varying vec3 vWorldPos;

        // Hash function for random per-leaf properties
        float hash(vec3 p) {
          p = fract(p * vec3(443.897, 397.297, 491.187));
          p += dot(p.xyz, p.yzx + 19.19);
          return fract(p.x * p.y * p.z);
        }

        void main() {
          // Taper boundary check for perfect teardrop edge
          float t = vUv.y;
          float widthProfile = sin(t * 3.14159) * (1.0 - t * 0.25);
          float distFromCenter = abs(vUv.x - 0.5) * 2.0;
          if (distFromCenter > widthProfile) discard;
          
          // Calculate face normal dynamically in screen space
          vec3 N = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
          if (!gl_FrontFacing) N = -N;
          
          // Lighting from top-left
          vec3 lightDir = normalize(vec3(-0.4, 0.8, 0.4));
          float NdotL = dot(N, lightDir);
          
          // Toon shading color bands
          float cel = smoothstep(-0.2, 0.3, NdotL) * 0.5 + 0.5;
          
          // Height gradient for canopy depth shading
          float heightFactor = clamp((vWorldPos.y - 2.8) / 3.6, 0.0, 1.0);
          float finalT = clamp(cel * 0.72 + heightFactor * 0.28, 0.0, 1.0);
          
          // Generate a stable random seed per leaf instance based on world coordinates
          float leafSeed = hash(floor(vWorldPos * 80.0));
          
          // Day colors (lime -> mid green -> forest green)
          vec3 dayBright = vec3(0.67, 0.90, 0.18); // lime green
          vec3 dayMid = vec3(0.42, 0.72, 0.09);    // mid green
          vec3 dayDark = vec3(0.20, 0.42, 0.06);   // dark green
          
          // Apply random hue variations to mimic realistic canopy foliage variety
          vec3 hueShift = vec3(leafSeed * 0.12 - 0.05, leafSeed * 0.08 - 0.02, leafSeed * 0.04 - 0.03);
          dayBright += hueShift;
          dayMid += hueShift * 0.8;
          dayDark += hueShift * 0.6;
          
          vec3 dayColor;
          if (finalT > 0.6) {
            dayColor = mix(dayMid, dayBright, (finalT - 0.6) / 0.4);
          } else {
            dayColor = mix(dayDark, dayMid, finalT / 0.6);
          }
          
          // Center crease shadow line
          float creaseDist = abs(vUv.x - 0.5);
          float creaseShadow = smoothstep(0.0, 0.06, creaseDist) * 0.28 + 0.72;
          dayColor *= creaseShadow;
          
          // Subsurface Scattering (leaf translucency back-lit sun glow)
          float backLight = clamp(dot(lightDir, -N), 0.0, 1.0);
          vec3 translucencyColor = vec3(0.72, 0.95, 0.25) + hueShift;
          dayColor += translucencyColor * backLight * 0.28;
          
          // --- Magical Bioluminescent Night Colors ---
          vec3 nightDark = vec3(0.02, 0.06, 0.12) + hueShift * 0.1;
          vec3 nightMid = vec3(0.05, 0.15, 0.24) + hueShift * 0.2;
          vec3 nightBright = vec3(0.12, 0.42, 0.52) + hueShift * 0.3;
          
          vec3 nightColor;
          if (finalT > 0.6) {
            nightColor = mix(nightMid, nightBright, (finalT - 0.6) / 0.4);
          } else {
            nightColor = mix(nightDark, nightMid, finalT / 0.6);
          }
          
          // Add mystical crease glow at night (with leaf-specific color variations)
          float creaseGlow = (1.0 - smoothstep(0.0, 0.05, creaseDist)) * 0.18;
          vec3 glowColor = mix(vec3(0.2, 0.7, 0.9), vec3(0.3, 0.9, 0.6), leafSeed);
          nightColor += glowColor * creaseGlow;
          
          // Ambient Occlusion: leaves deeper inside the canopy are darker
          float centerDist = length(vWorldPos - vec3(0.0, 4.8, 0.0));
          float ao = smoothstep(0.4, 2.8, centerDist) * 0.48 + 0.52;
          dayColor *= ao;
          nightColor *= ao;
          
          vec3 finalColor = mix(dayColor, nightColor, uThemeProgress);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    };
  }, []);

  const canopyUniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uThemeProgress: { value: themeProgress },
    };
  }, [themeProgress]);

  const fallingLeavesUniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uThemeProgress: { value: themeProgress },
    };
  }, [themeProgress]);

  // --- 4. Canopy 3D Leaf Instances Setup ---
  // Doubled leaf density again to 9600 for incredibly lush, thick coverage
  const leafCount = 9600;
  
  const branchEnds = useMemo(() => [
    new THREE.Vector3(0, 5.8, 0),        // Top center
    new THREE.Vector3(1.6, 4.8, 0.8),    // Branch East
    new THREE.Vector3(-1.8, 4.5, -0.6),  // Branch West
    new THREE.Vector3(-0.8, 5.0, 1.4),   // Branch South
    new THREE.Vector3(0.8, 5.2, -1.5),   // Branch North
    new THREE.Vector3(1.2, 4.0, -1.0),   // Lower Branch East-North
    new THREE.Vector3(-1.2, 3.8, 1.0)    // Lower Branch West-South
  ], []);

  const leavesData = useMemo(() => {
    const tempObject = new THREE.Object3D();
    const matrices: THREE.Matrix4[] = [];
    const canopyCenter = new THREE.Vector3(0, 4.8, 0);

    for (let i = 0; i < leafCount; i++) {
      const center = branchEnds[Math.floor(Math.random() * branchEnds.length)];
      // Radial scatter radius increased (up to 2.4) to make the head of the tree significantly bigger
      const radius = 0.3 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      const dx = radius * Math.sin(phi) * Math.cos(theta);
      const dy = radius * Math.cos(phi) * 0.82;
      const dz = radius * Math.sin(phi) * Math.sin(theta);

      const pos = new THREE.Vector3(center.x + dx, center.y + dy, center.z + dz);
      tempObject.position.copy(pos);

      // Point leaf Y-axis outwards from center
      const dir = new THREE.Vector3().subVectors(pos, canopyCenter).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const alignQuat = new THREE.Quaternion().setFromUnitVectors(up, dir);
      
      // Pitch/Yaw/Roll variations for volumetric clutter
      const pitch = (Math.random() - 0.5) * 0.7;
      const yaw = (Math.random() - 0.5) * 0.7;
      const roll = (Math.random() - 0.5) * 1.2;
      
      const localRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll));
      alignQuat.multiply(localRot);
      tempObject.quaternion.copy(alignQuat);

      // Leaf dimensions scaled slightly (0.28 to 0.56 scale factors) for optimal dense visual weight
      const scale = 0.28 + Math.random() * 0.28;
      tempObject.scale.set(scale * 1.2, scale * 1.6, scale);
      tempObject.updateMatrix();
      
      matrices.push(tempObject.matrix.clone());
    }
    return { matrices };
  }, [branchEnds]);

  // Load matrices on mount
  useEffect(() => {
    if (leavesRef.current) {
      leavesData.matrices.forEach((matrix, i) => {
        leavesRef.current!.setMatrixAt(i, matrix);
      });
      leavesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [leavesData]);

  // --- 5. Falling Leaves Animation System ---
  const fallingLeavesCount = 12;
  const fallingLeavesData = useMemo(() => {
    const data = [];
    for (let i = 0; i < fallingLeavesCount; i++) {
      const startNode = branchEnds[Math.floor(Math.random() * branchEnds.length)];
      data.push({
        x: startNode.x + (Math.random() - 0.5) * 1.5,
        y: startNode.y - Math.random() * 1.5,
        z: startNode.z + (Math.random() - 0.5) * 1.5,
        speedY: 0.015 + Math.random() * 0.015,
        swaySpeed: 1.6 + Math.random() * 1.6,
        swayWidth: 0.15 + Math.random() * 0.2,
        rotSpeedX: 0.6 + Math.random() * 1.2,
        rotSpeedY: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2
      });
    }
    return data;
  }, [branchEnds]);

  // --- 6. Animation Frame Loop ---
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const progress = themeProgress;

    // Update Trunk & Branch shaders
    trunkMaterialsUniforms.trunk.uTime.value = time;
    trunkMaterialsUniforms.trunk.uThemeProgress.value = progress;

    trunkMaterialsUniforms.branch1.uTime.value = time;
    trunkMaterialsUniforms.branch1.uThemeProgress.value = progress;

    trunkMaterialsUniforms.branch2.uTime.value = time;
    trunkMaterialsUniforms.branch2.uThemeProgress.value = progress;

    trunkMaterialsUniforms.branch3.uTime.value = time;
    trunkMaterialsUniforms.branch3.uThemeProgress.value = progress;

    trunkMaterialsUniforms.branch4.uTime.value = time;
    trunkMaterialsUniforms.branch4.uThemeProgress.value = progress;

    // Update Canopy leaves
    canopyUniforms.uTime.value = time;
    canopyUniforms.uThemeProgress.value = THREE.MathUtils.lerp(
      canopyUniforms.uThemeProgress.value,
      progress,
      0.05
    );

    // Update falling leaves shader uniforms
    fallingLeavesUniforms.uTime.value = time;
    fallingLeavesUniforms.uThemeProgress.value = progress;

    // Animate individual falling leaf meshes
    fallingLeavesData.forEach((leafData, idx) => {
      const mesh = fallingLeavesRef.current[idx];
      if (mesh) {
        mesh.position.y -= leafData.speedY;

        // Sway on x and z
        const swayPhase = time * leafData.swaySpeed + leafData.phase;
        mesh.position.x = leafData.x + Math.sin(swayPhase) * leafData.swayWidth;
        mesh.position.z = leafData.z + Math.cos(swayPhase * 0.7) * (leafData.swayWidth * 0.6);

        // Fluttering rotations
        mesh.rotation.x = swayPhase * leafData.rotSpeedX;
        mesh.rotation.y = swayPhase * leafData.rotSpeedY;

        // Recycle leaf when it hits the ground
        if (mesh.position.y < 0.1) {
          const startNode = branchEnds[Math.floor(Math.random() * branchEnds.length)];
          mesh.position.y = startNode.y + (Math.random() - 0.5) * 0.5;
          leafData.x = startNode.x + (Math.random() - 0.5) * 1.5;
          leafData.z = startNode.z + (Math.random() - 0.5) * 1.5;
        }
      }
    });

    // --- Tree group sway + jerk ---
    if (treeGroupRef.current) {
      // 1. Gentle idle sway (continuous)
      const idleSwayX = Math.sin(time * 0.55) * 0.012;
      const idleSwayZ = Math.sin(time * 0.38 + 1.2) * 0.008;

      // 2. Click jerk: damped spring oscillation
      let jerkX = 0;
      const jerk = jerkRef.current;
      if (jerk.startTime >= 0) {
        const elapsed = performance.now() / 1000 - jerk.startTime;
        const decay = Math.exp(-elapsed * 4.5);     // exponential decay
        const freq = 18.0;                            // fast oscillation frequency
        jerkX = Math.sin(elapsed * freq) * jerk.amplitude * decay * jerk.dirX;

        // Deactivate once vibration dies out
        if (decay < 0.01) jerk.startTime = -1;
      }

      treeGroupRef.current.rotation.x = idleSwayX + jerkX * 0.4;
      treeGroupRef.current.rotation.z = idleSwayZ + jerkX;
    }
  });

  // Click/touch handler — triggers a jerk impulse on the tree
  const handleClick = useCallback(() => {
    jerkRef.current.startTime = performance.now() / 1000;
    jerkRef.current.amplitude = 0.18;
    jerkRef.current.dirX = Math.random() > 0.5 ? 1 : -1;
  }, []);

  return (
    <group
      ref={treeGroupRef}
      position={[0, 0, 0]}
      onClick={handleClick}
      onPointerDown={handleClick}
    >
      {/* --- 1. Procedural Tree Trunk & Branches --- */}
      <group>
        {/* Main Base Trunk */}
        <mesh position={[0, 1.9, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.65, 3.8, 16, 24]} />
          <shaderMaterial
            vertexShader={trunkShader.vertexShader}
            fragmentShader={trunkShader.fragmentShader}
            uniforms={trunkMaterialsUniforms.trunk}
          />
        </mesh>

        {/* Branch 1 (West - Curves left and up) */}
        <mesh position={[-0.2, 3.2, -0.1]} rotation={[0.2, 0, 0.8]} castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.22, 2.2, 12, 16]} />
          <shaderMaterial
            vertexShader={trunkShader.vertexShader}
            fragmentShader={trunkShader.fragmentShader}
            uniforms={trunkMaterialsUniforms.branch1}
          />
        </mesh>

        {/* Branch 2 (East - Curves right and up) */}
        <mesh position={[0.3, 3.1, 0.2]} rotation={[-0.2, 0, -0.7]} castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.22, 2.2, 12, 16]} />
          <shaderMaterial
            vertexShader={trunkShader.vertexShader}
            fragmentShader={trunkShader.fragmentShader}
            uniforms={trunkMaterialsUniforms.branch2}
          />
        </mesh>

        {/* Branch 3 (South - Curves forward) */}
        <mesh position={[0.0, 3.3, 0.3]} rotation={[0.7, 0, 0.1]} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.16, 1.8, 12, 16]} />
          <shaderMaterial
            vertexShader={trunkShader.vertexShader}
            fragmentShader={trunkShader.fragmentShader}
            uniforms={trunkMaterialsUniforms.branch3}
          />
        </mesh>

        {/* Branch 4 (North - Curves backward) */}
        <mesh position={[-0.1, 3.4, -0.3]} rotation={[-0.7, 0.2, -0.2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.16, 1.8, 12, 16]} />
          <shaderMaterial
            vertexShader={trunkShader.vertexShader}
            fragmentShader={trunkShader.fragmentShader}
            uniforms={trunkMaterialsUniforms.branch4}
          />
        </mesh>
      </group>

      {/* --- 2. Instanced Leaves Canopy --- */}
      <instancedMesh
        ref={leavesRef}
        args={[null as any, null as any, leafCount]}
        castShadow
        frustumCulled={false}
      >
        <planeGeometry args={[0.5, 0.7, 8, 8]} />
        <shaderMaterial
          vertexShader={canopyShader.vertexShader}
          fragmentShader={canopyShader.fragmentShader}
          uniforms={canopyUniforms}
          side={THREE.DoubleSide}
          transparent={false}
          depthWrite={true}
        />
      </instancedMesh>

      {/* --- 3. Dynamic Falling Leaves System --- */}
      {fallingLeavesData.map((leaf, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) fallingLeavesRef.current[i] = el;
          }}
          position={[leaf.x, leaf.y, leaf.z]}
          scale={[0.5, 0.5, 0.5]}
          castShadow
        >
          <planeGeometry args={[0.5, 0.7, 8, 8]} />
          <shaderMaterial
            vertexShader={canopyShader.vertexShader}
            fragmentShader={canopyShader.fragmentShader}
            uniforms={fallingLeavesUniforms}
            side={THREE.DoubleSide}
            transparent={false}
            depthWrite={true}
          />
        </mesh>
      ))}
    </group>
  );
}
