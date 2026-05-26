"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CharacterProps {
  themeProgress: number; // 0: day, 1: night
}

export default function Character({ themeProgress }: CharacterProps) {
  // Refs for body parts to animate
  const characterGroupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  
  const laptopGroupRef = useRef<THREE.Group>(null);
  const laptopLidRef = useRef<THREE.Group>(null);
  const laptopScreenLightRef = useRef<THREE.SpotLight>(null);
  const laptopScreenMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const hoodieMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const skinMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const hairMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const zRefs = useRef<THREE.Group[]>([]);

  // Build hair styling procedurally — small, neat swept pompadour
  const hairClumpData = useMemo(() => {
    return [
      // === MAIN TOP VOLUME ===
      { pos: [ 0.01, 0.26, 0.00], scale: [0.18, 0.12, 0.16] }, // Central top
      { pos: [ 0.05, 0.25, -0.02], scale: [0.13, 0.11, 0.12] }, // Right crest
      { pos: [-0.02, 0.24, -0.01], scale: [0.12, 0.10, 0.12] }, // Left top
      { pos: [ 0.08, 0.22, 0.01], scale: [0.10, 0.09, 0.10] }, // Far right peak

      // === FRONT BANGS (swoop across forehead) ===
      { pos: [ 0.04, 0.22, 0.08], scale: [0.12, 0.07, 0.09] }, // Right swoop
      { pos: [-0.01, 0.20, 0.09], scale: [0.11, 0.07, 0.08] }, // Center wave
      { pos: [-0.05, 0.18, 0.08], scale: [0.08, 0.06, 0.07] }, // Left fringe

      // === SIDE HAIR ===
      { pos: [ 0.19, 0.14, 0.03], scale: [0.06, 0.10, 0.08] }, // Right side
      { pos: [-0.19, 0.14, 0.03], scale: [0.06, 0.10, 0.08] }, // Left side

      // === BACK OF HEAD ===
      { pos: [ 0.00, 0.14, -0.17], scale: [0.16, 0.12, 0.08] }, // Back main
      { pos: [ 0.04, 0.20, -0.15], scale: [0.10, 0.09, 0.08] }, // Back-right
      { pos: [-0.04, 0.20, -0.15], scale: [0.10, 0.09, 0.08] }, // Back-left

      // === TOP TIP ===
      { pos: [ 0.02, 0.30, 0.01], scale: [0.07, 0.04, 0.06] }, // Peak tuft
    ];
  }, []);

  // --- Animation Loop ---
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Interpolation weight
    const progress = themeProgress; // 0 is day, 1 is night

    // 2. Breathing Cycle
    // Day: faster breathing (frequency ~ 2.0, amplitude ~ 0.012)
    // Night: slower/deeper breathing (frequency ~ 1.1, amplitude ~ 0.018)
    const breathFreq = THREE.MathUtils.lerp(2.0, 1.1, progress);
    const breathAmp = THREE.MathUtils.lerp(0.012, 0.018, progress);
    const breathingOffset = Math.sin(time * breathFreq) * breathAmp;

    // Apply breathing to torso height and slight head bobbing
    if (torsoRef.current) {
      // Day Torso Posture: slightly forward coding position
      // Night Torso Posture: slumped down, resting back against the tree
      const targetTorsoY = THREE.MathUtils.lerp(0.38, 0.26, progress) + breathingOffset;
      const targetTorsoZ = THREE.MathUtils.lerp(0.68, 0.52, progress);
      const targetTorsoRotX = THREE.MathUtils.lerp(-0.06, 0.14, progress);
      const targetTorsoRotZ = THREE.MathUtils.lerp(0.0, 0.25, progress); // lean to the side

      torsoRef.current.position.y = THREE.MathUtils.lerp(torsoRef.current.position.y, targetTorsoY, 0.06);
      torsoRef.current.position.z = THREE.MathUtils.lerp(torsoRef.current.position.z, targetTorsoZ, 0.06);
      torsoRef.current.rotation.x = THREE.MathUtils.lerp(torsoRef.current.rotation.x, targetTorsoRotX, 0.06);
      torsoRef.current.rotation.z = THREE.MathUtils.lerp(torsoRef.current.rotation.z, targetTorsoRotZ, 0.06);
    }

    if (headRef.current) {
      // Day Head: looking forward/down at screen (rotX ~ 0.25)
      // Night Head: tilted sideways resting (rotX ~ 0.35, rotZ ~ 0.3)
      const targetHeadRotX = THREE.MathUtils.lerp(0.24, 0.36, progress);
      const targetHeadRotY = THREE.MathUtils.lerp(0.0, -0.22, progress);
      const targetHeadRotZ = THREE.MathUtils.lerp(0.0, 0.32, progress) + breathingOffset * 0.2; // head bobs with breathing

      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetHeadRotX, 0.06);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetHeadRotY, 0.06);
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, targetHeadRotZ, 0.06);
    }

    // 3. Arms Positioning
    if (leftArmRef.current && rightArmRef.current) {
      // Day: Arms forward typing
      const targetLeftArmRotX = THREE.MathUtils.lerp(-0.6, 0.2, progress);
      const targetLeftArmRotZ = THREE.MathUtils.lerp(0.1, 0.4, progress);
      const targetRightArmRotX = THREE.MathUtils.lerp(-0.6, 0.2, progress);
      const targetRightArmRotZ = THREE.MathUtils.lerp(-0.1, -0.4, progress);

      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, targetLeftArmRotX, 0.06);
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, targetLeftArmRotZ, 0.06);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, targetRightArmRotX, 0.06);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, targetRightArmRotZ, 0.06);
    }

    // 4. Laptop Placement and Screen Angle
    if (laptopGroupRef.current) {
      // Day: Laptop in front of coder on legs/grass
      // Night: Laptop sitting closed on the grass to the side
      const targetX = THREE.MathUtils.lerp(0.0, 0.65, progress);
      const targetY = THREE.MathUtils.lerp(0.3, 0.05, progress);
      const targetZ = THREE.MathUtils.lerp(1.15, 1.05, progress);
      const targetRotY = THREE.MathUtils.lerp(0, 0.45, progress);

      laptopGroupRef.current.position.set(
        THREE.MathUtils.lerp(laptopGroupRef.current.position.x, targetX, 0.06),
        THREE.MathUtils.lerp(laptopGroupRef.current.position.y, targetY, 0.06),
        THREE.MathUtils.lerp(laptopGroupRef.current.position.z, targetZ, 0.06)
      );
      laptopGroupRef.current.rotation.y = THREE.MathUtils.lerp(laptopGroupRef.current.rotation.y, targetRotY, 0.06);
    }

    if (laptopLidRef.current) {
      // Day: lid is open (rotation.x = -1.35)
      // Night: lid is closed flat (rotation.x = 0)
      const targetLidRotX = THREE.MathUtils.lerp(-1.35, 0, progress);
      laptopLidRef.current.rotation.x = THREE.MathUtils.lerp(laptopLidRef.current.rotation.x, targetLidRotX, 0.06);
    }

    // 5. Laptop screen light emit
    if (laptopScreenLightRef.current && laptopScreenMaterialRef.current) {
      const activeIntensity = 3.5;
      const targetIntensity = THREE.MathUtils.lerp(activeIntensity, 0, progress);
      laptopScreenLightRef.current.intensity = THREE.MathUtils.lerp(
        laptopScreenLightRef.current.intensity,
        targetIntensity,
        0.08
      );

      // Flickering screen effect in day mode (like coding activity)
      if (progress < 0.1) {
        laptopScreenLightRef.current.intensity = activeIntensity + Math.sin(time * 15) * 0.3;
      }

      // Smooth color blend for the screen face
      const activeColor = new THREE.Color("#64d2ff"); // bright sky blue glow
      const offColor = new THREE.Color("#08090a");    // black off screen
      laptopScreenMaterialRef.current.color.lerpColors(activeColor, offColor, progress);
    }

    // 6. Color blending for clothes/materials based on atmospheric lighting
    if (hoodieMaterialRef.current && skinMaterialRef.current && hairMaterialRef.current) {
      // Hoodie: vibrant lavender/purple (day) -> deep grape indigo (night)
      const dayHoodie = new THREE.Color("#7d66d9");
      const nightHoodie = new THREE.Color("#382773");
      hoodieMaterialRef.current.color.lerpColors(dayHoodie, nightHoodie, progress);

      // Skin: creamy cartoon warm skin (day) -> warm shadow skin tone (night)
      const daySkin = new THREE.Color("#ffd4be");
      const nightSkin = new THREE.Color("#c69d87");
      skinMaterialRef.current.color.lerpColors(daySkin, nightSkin, progress);

      // Hair: warm milk chocolate brown (day) -> rich dark brown (night)
      const dayHair = new THREE.Color("#734b35");
      const nightHair = new THREE.Color("#3a241b");
      hairMaterialRef.current.color.lerpColors(dayHair, nightHair, progress);
    }

    // 7. Sleeping Zs Animation at night
    const zDataInfo = [
      { delay: 0.0, scale: 0.75 },
      { delay: 1.5, scale: 0.55 },
      { delay: 3.0, scale: 0.4 },
    ];
    
    zDataInfo.forEach((zInfo, idx) => {
      const zGroup = zRefs.current[idx];
      if (zGroup) {
        const cycleDuration = 4.5;
        const t = (time + zInfo.delay) % cycleDuration;
        const p = t / cycleDuration;
        
        if (progress > 0.55) {
          // Night time sleep animation: drift up from head (head is near x=0.16, y=0.82, z=0.68)
          const x = 0.16 + Math.sin(time * 1.8 + idx * 1.5) * 0.1;
          const y = 0.82 + p * 0.85;
          const z = 0.68 - p * 0.15;
          
          zGroup.position.set(x, y, z);
          zGroup.rotation.z = Math.sin(time * 1.2 + idx) * 0.15;
          
          const scaleVal = Math.sin(p * Math.PI) * zInfo.scale * progress;
          zGroup.scale.setScalar(scaleVal);
          
          zGroup.children.forEach((child) => {
            const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
            if (m) {
              m.opacity = (1.0 - p) * 0.85 * progress;
            }
          });
        } else {
          zGroup.scale.setScalar(0.001);
          zGroup.children.forEach((child) => {
            const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
            if (m) m.opacity = 0;
          });
        }
      }
    });
  });

  return (
    <group ref={characterGroupRef} position={[0, 0, 0.85]}>
      {/* --- CHARACTER MODEL GROUP --- */}
      <group ref={torsoRef} position={[0, 0.38, 0.68]}>
        
        {/* Torso (Hoodie Sweater) */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.28, 0.65, 10]} />
          <meshStandardMaterial ref={hoodieMaterialRef} roughness={0.85} color="#7d66d9" />
        </mesh>

        {/* Inner White T-Shirt Collar */}
        <mesh position={[0, 0.33, -0.01]} rotation={[0.08, 0, 0]}>
          <cylinderGeometry args={[0.125, 0.125, 0.06, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>

        {/* Hoodie Collar Ring */}
        <mesh position={[0, 0.32, 0]} rotation={[0.08, 0, 0]}>
          <torusGeometry args={[0.15, 0.04, 8, 20]} />
          <meshStandardMaterial color="#6a52c7" roughness={0.85} ref={hoodieMaterialRef} />
        </mesh>

        {/* Hoodie Drawstrings (clean off-white cords) */}
        <group position={[0, 0.16, 0.23]}>
          <mesh position={[0.045, -0.08, 0]} rotation={[0.05, 0, -0.1]}>
            <cylinderGeometry args={[0.006, 0.006, 0.16, 4]} />
            <meshStandardMaterial color="#f0eff5" roughness={0.85} />
          </mesh>
          <mesh position={[-0.045, -0.08, 0]} rotation={[0.05, 0, 0.1]}>
            <cylinderGeometry args={[0.006, 0.006, 0.16, 4]} />
            <meshStandardMaterial color="#f0eff5" roughness={0.85} />
          </mesh>
          {/* Silver Tips */}
          <mesh position={[0.053, -0.165, 0.008]}>
            <cylinderGeometry args={[0.008, 0.008, 0.02, 4]} />
            <meshBasicMaterial color="#a0aec0" />
          </mesh>
          <mesh position={[-0.053, -0.165, 0.008]}>
            <cylinderGeometry args={[0.008, 0.008, 0.02, 4]} />
            <meshBasicMaterial color="#a0aec0" />
          </mesh>
        </group>

        {/* Legs (Jeans) - Cross Legged Sitting */}
        <group position={[0, -0.32, 0.08]}>
          {/* Left Leg Upper */}
          <mesh position={[0.22, -0.06, 0.12]} rotation={[0.2, 0.5, 1.25]} castShadow>
            <cylinderGeometry args={[0.09, 0.07, 0.45, 8]} />
            <meshStandardMaterial color="#2d3748" roughness={0.8} />
          </mesh>
          {/* Left Leg Lower */}
          <mesh position={[0.12, -0.15, 0.28]} rotation={[0, -0.8, 1.57]} castShadow>
            <cylinderGeometry args={[0.07, 0.06, 0.45, 8]} />
            <meshStandardMaterial color="#2d3748" roughness={0.8} />
          </mesh>

          {/* Right Leg Upper */}
          <mesh position={[-0.22, -0.06, 0.12]} rotation={[0.2, -0.5, -1.25]} castShadow>
            <cylinderGeometry args={[0.09, 0.07, 0.45, 8]} />
            <meshStandardMaterial color="#2d3748" roughness={0.8} />
          </mesh>
          {/* Right Leg Lower */}
          <mesh position={[-0.12, -0.15, 0.28]} rotation={[0, 0.8, -1.57]} castShadow>
            <cylinderGeometry args={[0.07, 0.06, 0.45, 8]} />
            <meshStandardMaterial color="#2d3748" roughness={0.8} />
          </mesh>

          {/* Sneakers */}
          {/* Left Sneaker */}
          <group position={[0.28, -0.21, 0.36]} rotation={[0.1, -0.6, 0.2]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.07, 0.17]} />
              <meshStandardMaterial color="#2b6cb0" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.04, 0]}>
              <boxGeometry args={[0.085, 0.018, 0.18]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, -0.01, 0.09]} rotation={[-0.1, 0, 0]}>
              <boxGeometry args={[0.075, 0.05, 0.05]} />
              <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>
          </group>
          
          {/* Right Sneaker */}
          <group position={[-0.28, -0.21, 0.36]} rotation={[0.1, 0.6, -0.2]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.07, 0.17]} />
              <meshStandardMaterial color="#2b6cb0" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.04, 0]}>
              <boxGeometry args={[0.085, 0.018, 0.18]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, -0.01, 0.09]} rotation={[-0.1, 0, 0]}>
              <boxGeometry args={[0.075, 0.05, 0.05]} />
              <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>
          </group>
        </group>

        {/* Arms (Hoodie sleeves with hands) */}
        {/* Left Arm */}
        <group ref={leftArmRef} position={[0.26, 0.15, 0.12]} rotation={[-0.6, 0, 0.1]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.05, 0.42, 8]} />
            <meshStandardMaterial ref={hoodieMaterialRef} color="#ecebe5" roughness={0.85} />
          </mesh>
          {/* Left Hand */}
          <mesh position={[0, -0.23, 0]} castShadow>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial ref={skinMaterialRef} color="#ffd4be" roughness={0.6} />
          </mesh>
        </group>
        {/* Right Arm */}
        <group ref={rightArmRef} position={[-0.26, 0.15, 0.12]} rotation={[-0.6, 0, -0.1]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.05, 0.42, 8]} />
            <meshStandardMaterial ref={hoodieMaterialRef} color="#7d66d9" roughness={0.85} />
          </mesh>
          {/* Right Hand */}
          <mesh position={[0, -0.23, 0]} castShadow>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial ref={skinMaterialRef} color="#ffd4be" roughness={0.6} />
          </mesh>
        </group>

        {/* --- HEAD GROUP --- */}
        <group ref={headRef} position={[0, 0.45, 0.02]}>
          {/* Face (Stylized Head) */}
          <mesh castShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial ref={skinMaterialRef} roughness={0.6} color="#ffd4be" />
          </mesh>

          {/* Ears (Stylized side ears matching skin tone) */}
          <mesh position={[0.185, 0.0, 0.0]} rotation={[0, -0.2, -0.15]}>
            <sphereGeometry args={[0.038, 10, 10]} />
            <meshStandardMaterial ref={skinMaterialRef} roughness={0.6} color="#ffd4be" />
          </mesh>
          <mesh position={[-0.185, 0.0, 0.0]} rotation={[0, 0.2, 0.15]}>
            <sphereGeometry args={[0.038, 10, 10]} />
            <meshStandardMaterial ref={skinMaterialRef} roughness={0.6} color="#ffd4be" />
          </mesh>

          {/* Geeky Glasses & Eyes */}
          <group position={[0, 0.01, 0.02]}>
            {/* Left Eye */}
            <group position={[0.052, 0.01, 0.138]}>
              <mesh>
                <sphereGeometry args={[0.024, 16, 16]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              <mesh position={[0.002, 0.0, 0.018]}>
                <sphereGeometry args={[0.012, 12, 12]} />
                <meshBasicMaterial color="#111113" />
              </mesh>
              <mesh position={[0.006, 0.006, 0.026]}>
                <sphereGeometry args={[0.004, 6, 6]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>

            {/* Right Eye */}
            <group position={[-0.052, 0.01, 0.138]}>
              <mesh>
                <sphereGeometry args={[0.024, 16, 16]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              <mesh position={[-0.002, 0.0, 0.018]}>
                <sphereGeometry args={[0.012, 12, 12]} />
                <meshBasicMaterial color="#111113" />
              </mesh>
              <mesh position={[-0.006, 0.006, 0.026]}>
                <sphereGeometry args={[0.004, 6, 6]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>

            {/* Torus Glasses Frame (Thicker dark purple frames matching image) */}
            <mesh position={[0.052, 0.01, 0.160]}>
              <torusGeometry args={[0.045, 0.006, 8, 24]} />
              <meshBasicMaterial color="#2d244a" />
            </mesh>
            <mesh position={[-0.052, 0.01, 0.160]}>
              <torusGeometry args={[0.045, 0.006, 8, 24]} />
              <meshBasicMaterial color="#2d244a" />
            </mesh>
            {/* Bridge */}
            <mesh position={[0, 0.01, 0.163]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.005, 0.005, 0.06, 6]} />
              <meshBasicMaterial color="#2d244a" />
            </mesh>
            {/* Temples (Sides) */}
            <mesh position={[0.095, 0.02, 0.08]} rotation={[0, -0.3, 0]}>
              <boxGeometry args={[0.005, 0.006, 0.15]} />
              <meshBasicMaterial color="#2d244a" />
            </mesh>
            <mesh position={[-0.095, 0.02, 0.08]} rotation={[0, 0.3, 0]}>
              <boxGeometry args={[0.005, 0.006, 0.15]} />
              <meshBasicMaterial color="#2d244a" />
            </mesh>
          </group>

          {/* Smiling Mouth */}
          <mesh position={[0, -0.05, 0.156]} rotation={[0.2, 0, Math.PI]}>
            <torusGeometry args={[0.035, 0.005, 6, 16, Math.PI]} />
            <meshBasicMaterial color="#593b30" />
          </mesh>

          {/* Hair System */}
          <group>
            {hairClumpData.map((data, idx) => (
              <mesh
                key={idx}
                position={data.pos as [number, number, number]}
                scale={data.scale as [number, number, number]}
                castShadow
              >
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial
                  ref={idx === 0 ? hairMaterialRef : undefined}
                  roughness={0.9}
                  color="#734b35"
                />
              </mesh>
            ))}
          </group>

          {/* Soft Hoodie Cap (behind the head) */}
          <mesh position={[0, -0.05, -0.14]} rotation={[-0.2, 0, 0]}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshStandardMaterial color="#7d66d9" roughness={0.85} ref={hoodieMaterialRef} />
          </mesh>

          {/* Glowing Laptop Light Target (placed right in front of face) */}
          <group name="faceTarget" position={[0, 0, 0.2]} />
        </group>
      </group>

      {/* --- LAPTOP SYSTEM --- */}
      <group ref={laptopGroupRef} position={[0, 0.3, 1.15]}>
        {/* Keyboard Base */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.36, 0.016, 0.25]} />
          <meshStandardMaterial color="#ae99f7" roughness={0.65} metalness={0.1} />
        </mesh>
        
        {/* Keys grid block */}
        <mesh position={[0, 0.009, 0.01]}>
          <boxGeometry args={[0.32, 0.005, 0.18]} />
          <meshStandardMaterial color="#1a1c1e" roughness={0.8} />
        </mesh>

        {/* Laptop Lid Pivot */}
        <group ref={laptopLidRef} position={[0, 0.008, -0.12]} rotation={[-1.35, 0, 0]}>
          {/* Lid Shell */}
          <mesh position={[0, 0.12, 0.004]} castShadow>
            <boxGeometry args={[0.36, 0.24, 0.01]} />
            <meshStandardMaterial color="#ae99f7" roughness={0.65} metalness={0.1} />
          </mesh>

          {/* Emissive Screen Face */}
          <mesh position={[0, 0.12, 0.01]}>
            <planeGeometry args={[0.34, 0.22]} />
            <meshBasicMaterial ref={laptopScreenMaterialRef} color="#64d2ff" toneMapped={false} />
          </mesh>

          {/* Spotlight projecting screen glow on face */}
          <spotLight
            ref={laptopScreenLightRef}
            position={[0, 0.12, 0.02]}
            angle={0.7}
            penumbra={0.9}
            distance={1.6}
            intensity={3.5}
            color="#aae5ff"
            castShadow
          />
        </group>
      </group>

      {/* 8. Floating Sleeping Zs (rendered at night) */}
      {Array.from({ length: 3 }).map((_, idx) => (
        <group
          key={idx}
          ref={(el) => {
            if (el) zRefs.current[idx] = el;
          }}
          scale={[0.001, 0.001, 0.001]}
        >
          {/* Top horizontal bar */}
          <mesh position={[0, 0.045, 0]}>
            <boxGeometry args={[0.08, 0.015, 0.015]} />
            <meshBasicMaterial color="#c2c7d9" transparent opacity={0} depthWrite={false} />
          </mesh>
          {/* Diagonal bar */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, -0.7]}>
            <boxGeometry args={[0.015, 0.1, 0.015]} />
            <meshBasicMaterial color="#c2c7d9" transparent opacity={0} depthWrite={false} />
          </mesh>
          {/* Bottom horizontal bar */}
          <mesh position={[0, -0.045, 0]}>
            <boxGeometry args={[0.08, 0.015, 0.015]} />
            <meshBasicMaterial color="#c2c7d9" transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
