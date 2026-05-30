"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SkyAndAtmosphereProps {
  isDark: boolean;
  themeProgress: number; // 0 for day, 1 for night
}

export default function SkyAndAtmosphere({ isDark, themeProgress }: SkyAndAtmosphereProps) {
  const skyRef = useRef<THREE.Mesh>(null);
  const sunRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Group>(null);
  const moonMaskRef = useRef<THREE.MeshBasicMaterial>(null);
  const starsRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const cloudsGroupRef = useRef<THREE.Group>(null);



  // 1. Generate Star Coordinates
  const starData = useMemo(() => {
    const count = 1800; // Increased star count for a dense night sky
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random());
      const r = 90 + Math.random() * 10;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return { positions };
  }, []);

  // 2. Generate Floating Environmental Particles
  const particleCount = 220;
  const particleData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 16;
      
      positions[i * 3] = r * Math.cos(theta);
      positions[i * 3 + 1] = 0.2 + Math.random() * 12;
      positions[i * 3 + 2] = r * Math.sin(theta);
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.025;
      velocities[i * 3 + 1] = 0.006 + Math.random() * 0.016;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.025;

      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, velocities, phases };
  }, []);

  // 3. Define 3D Cloud positions and scales
  const cloudsData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 9; i++) {
      data.push({
        x: (Math.random() - 0.5) * 70,
        y: 22 + Math.random() * 8,
        z: -15 - Math.random() * 35,
        scale: 0.6 + Math.random() * 0.8,
        speed: 0.02 + Math.random() * 0.03
      });
    }
    return data;
  }, []);

  // 6. R3F Animation loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const progress = themeProgress;

    // Animate Sun position: rises during day, sets at night (rises to y=28, sets to y=-18)
    if (sunRef.current) {
      const targetY = THREE.MathUtils.lerp(28.0, -18.0, progress);
      sunRef.current.position.y = THREE.MathUtils.lerp(sunRef.current.position.y, targetY, 0.05);
      sunRef.current.position.x = -14 + Math.sin(time * 0.04) * 2;
    }

    // Animate Moon position: sets during day, rises at night (rises to y=26, sets to y=-18)
    if (moonRef.current) {
      const targetY = THREE.MathUtils.lerp(-18.0, 26.0, progress);
      moonRef.current.position.y = THREE.MathUtils.lerp(moonRef.current.position.y, targetY, 0.05);
      moonRef.current.position.x = 14 + Math.cos(time * 0.03) * 2;
    }

    // Animate crescent mask color to match sky background
    if (moonMaskRef.current) {
      // At moon's typical position (upper sky), pick the zenith sky color
      const daySkyZenith = new THREE.Color(0.38, 0.62, 0.90);
      const nightSkyZenith = new THREE.Color(0.01, 0.02, 0.05);
      moonMaskRef.current.color.lerpColors(daySkyZenith, nightSkyZenith, progress);
    }

    // Animate Sky Colors in shader
    if (skyRef.current) {
      const mat = skyRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms) {
        mat.uniforms.uThemeProgress.value = THREE.MathUtils.lerp(
          mat.uniforms.uThemeProgress.value,
          progress,
          0.04
        );
        mat.uniforms.uTime.value = time;
      }
    }

    // Twinkling Starfield
    if (starsRef.current) {
      const mat = starsRef.current.material as THREE.PointsMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, progress * 0.85, 0.04);
      mat.size = 0.32 + Math.sin(time * 2.5) * 0.08; // Reduced star size for a delicate twinkle
    }

    // Animate Particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const mat = particlesRef.current.material as THREE.ShaderMaterial;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const phase = particleData.phases[i];
        
        positions[idx + 1] += particleData.velocities[idx + 1];
        positions[idx] += Math.sin(time * 0.4 + phase) * 0.006 + particleData.velocities[idx];
        positions[idx + 2] += Math.cos(time * 0.4 + phase) * 0.006 + particleData.velocities[idx + 2];

        if (positions[idx + 1] > 14) {
          positions[idx + 1] = 0.2;
          const theta = Math.random() * Math.PI * 2;
          const r = 2.5 + Math.random() * 13;
          positions[idx] = r * Math.cos(theta);
          positions[idx + 2] = r * Math.sin(theta);
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;

      if (mat.uniforms) {
        mat.uniforms.uThemeProgress.value = THREE.MathUtils.lerp(
          mat.uniforms.uThemeProgress.value,
          progress,
          0.04
        );
        mat.uniforms.uTime.value = time;
      }
    }

    // Animate Cloud colors (but keep position fixed)
    if (cloudsGroupRef.current) {
      cloudsGroupRef.current.children.forEach((cloud, i) => {
        const meshGroup = cloud as THREE.Group;
        const dayColor = new THREE.Color("#ffffff");
        const nightColor = new THREE.Color("#18192b");
        meshGroup.children.forEach((sphereMesh) => {
          const s = sphereMesh as THREE.Mesh;
          const mat = s.material as THREE.MeshLambertMaterial;
          mat.color.lerpColors(dayColor, nightColor, progress);
          mat.opacity = THREE.MathUtils.lerp(0.75, 0.25, progress);
        });
      });
    }
  });

  const skyShader = useMemo(() => {
    return {
      uniforms: {
        uThemeProgress: { value: 0 },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        uniform float uThemeProgress;
        uniform float uTime;

        void main() {
          vec3 viewDirection = normalize(vWorldPosition);
          float heightFactor = max(0.0, viewDirection.y);

          vec3 dayHorizon = vec3(0.96, 0.86, 0.72);
          vec3 dayZenith = vec3(0.38, 0.62, 0.90);
          vec3 daySky = mix(dayHorizon, dayZenith, heightFactor);

          vec3 nightHorizon = vec3(0.05, 0.07, 0.18);
          vec3 nightZenith = vec3(0.01, 0.02, 0.05);
          vec3 nightSky = mix(nightHorizon, nightZenith, heightFactor);

          vec3 finalSky = mix(daySky, nightSky, uThemeProgress);

          float glow = pow(1.0 - heightFactor, 5.0) * 0.22;
          vec3 glowColor = mix(vec3(1.0, 0.92, 0.78), vec3(0.2, 0.4, 0.8), uThemeProgress);
          finalSky += glowColor * glow;

          gl_FragColor = vec4(finalSky, 1.0);
        }
      `,
    };
  }, []);

  const particleShader = useMemo(() => {
    return {
      uniforms: {
        uThemeProgress: { value: 0 },
        uTime: { value: 0 },
      },
      vertexShader: `
        uniform float uTime;
        varying float vPhase;
        void main() {
          vPhase = position.x * 2.0;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = (14.0 / -mvPosition.z) * (1.0 + sin(uTime * 1.6 + position.y) * 0.3);
        }
      `,
      fragmentShader: `
        uniform float uThemeProgress;
        uniform float uTime;
        varying float vPhase;

        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;

          float alpha = smoothstep(0.5, 0.15, dist);

          vec3 dayColor = vec3(0.98, 0.84, 0.42);
          float dayAlpha = alpha * 0.55;

          vec3 nightColor = vec3(0.38, 0.94, 0.58);
          float blink = 0.5 + 0.5 * sin(uTime * 2.2 + vPhase);
          float nightAlpha = alpha * blink * 0.95;

          vec3 color = mix(dayColor, nightColor, uThemeProgress);
          float finalAlpha = mix(dayAlpha, nightAlpha, uThemeProgress);

          gl_FragColor = vec4(color, finalAlpha);
        }
      `,
    };
  }, []);

  return (
    <group>
      {/* 1. Sky Dome */}
      <mesh ref={skyRef}>
        <sphereGeometry args={[100, 32, 16]} />
        <shaderMaterial
          vertexShader={skyShader.vertexShader}
          fragmentShader={skyShader.fragmentShader}
          uniforms={skyShader.uniforms}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Celestial Background (Sun & Moon in the direct line of sight) */}
      <group>
        {/* Sun (rises during day, sets vertically at night in z = -42) */}
        <group ref={sunRef} position={[-15, 28, -42]}>
          <mesh>
            <sphereGeometry args={[3.8, 20, 20]} />
            <meshBasicMaterial color="#fff2dc" toneMapped={false} />
          </mesh>
          <pointLight color="#ffeed0" intensity={3.5} distance={140} decay={1.3} castShadow />
        </group>

        {/* Crescent Moon: full bright sphere + offset dark sphere to carve crescent shape */}
        <group ref={moonRef} position={[15, -18, -42]}>
          {/* Full moon base — pale silvery-blue */}
          <mesh>
            <sphereGeometry args={[2.8, 32, 32]} />
            <meshBasicMaterial color="#ddeeff" toneMapped={false} />
          </mesh>
          {/* Dark overlay sphere — offset to carve out the crescent shadow side */}
          <mesh position={[1.05, 0.3, -0.4]}>
            <sphereGeometry args={[2.55, 32, 32]} />
            <meshBasicMaterial ref={moonMaskRef} color="#030510" toneMapped={false} />
          </mesh>
          {/* Small crater circles on the lit side */}
          <mesh position={[-0.9, 0.8, 2.55]} rotation={[0, 0, 0]}>
            <circleGeometry args={[0.22, 16]} />
            <meshBasicMaterial color="#b8ccdf" toneMapped={false} />
          </mesh>
          <mesh position={[-1.6, -0.5, 2.35]} rotation={[0, 0.3, 0]}>
            <circleGeometry args={[0.14, 16]} />
            <meshBasicMaterial color="#b8ccdf" toneMapped={false} />
          </mesh>
          <mesh position={[-0.4, -1.4, 2.6]} rotation={[0, -0.15, 0]}>
            <circleGeometry args={[0.18, 16]} />
            <meshBasicMaterial color="#b8ccdf" toneMapped={false} />
          </mesh>
          <pointLight color="#cadcff" intensity={1.8} distance={140} decay={1.3} />
        </group>
      </group>

      {/* 3. Starfield */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starData.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.32}
          sizeAttenuation={true}
          transparent={true}
          opacity={0}
          depthWrite={false}
        />
      </points>

      {/* 4. Drifting 3D Cloud Clusters */}
      <group ref={cloudsGroupRef}>
        {cloudsData.map((cloud, i) => (
          <group
            key={i}
            position={[cloud.x, cloud.y, cloud.z]}
            scale={[cloud.scale, cloud.scale, cloud.scale]}
          >
            <mesh castShadow>
              <sphereGeometry args={[2.5, 8, 8]} />
              <meshLambertMaterial transparent opacity={0.7} color="#ffffff" />
            </mesh>
            <mesh position={[-1.6, -0.3, 0.2]} scale={[0.7, 0.7, 0.7]}>
              <sphereGeometry args={[2.5, 8, 8]} />
              <meshLambertMaterial transparent opacity={0.7} color="#ffffff" />
            </mesh>
            <mesh position={[1.5, -0.1, -0.3]} scale={[0.8, 0.8, 0.8]}>
              <sphereGeometry args={[2.5, 8, 8]} />
              <meshLambertMaterial transparent opacity={0.7} color="#ffffff" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 7. Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleData.positions, 3]}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={particleShader.vertexShader}
          fragmentShader={particleShader.fragmentShader}
          uniforms={particleShader.uniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
