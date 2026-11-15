"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import type { MotionValue } from "motion/react";
import type { Group } from "three";
import { createScreenTexture, drawScreen } from "./screen-texture";

const BODY = { w: 2.06, h: 4.3, d: 0.22, r: 0.3 };
const SCREEN_W = 1.92;
const SCREEN_H = SCREEN_W * (1272 / 600);
// When each part of the conversation appears (ms after load).
const STEPS_MS = [900, 2200, 3300];

function Phone({ still, scroll }: { still: boolean; scroll?: MotionValue<number> }) {
  const group = useRef<Group>(null);
  const [step, setStep] = useState(still ? 3 : 0);
  const screen = useMemo(createScreenTexture, []);

  useEffect(() => {
    if (still) return;
    const timers = STEPS_MS.map((ms, index) => setTimeout(() => setStep(index + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [still]);

  useEffect(() => {
    drawScreen(screen.canvas, step);
    screen.texture.needsUpdate = true;
  }, [screen, step]);

  useEffect(() => () => screen.texture.dispose(), [screen]);

  useFrame(({ pointer }, delta) => {
    if (!group.current || still) return;
    // Ease toward the pointer so the phone tilts with the cursor.
    const ease = 1 - Math.exp(-delta * 4);
    // Scrolling down turns the phone further as the hero leaves the screen.
    const turn = (scroll?.get() ?? 0) * 1.1;
    group.current.rotation.y += (-0.32 + turn + pointer.x * 0.35 - group.current.rotation.y) * ease;
    group.current.rotation.x += (0.06 - pointer.y * 0.18 - group.current.rotation.x) * ease;
  });

  return (
    <group ref={group} rotation={[0.06, -0.32, 0.02]}>
      <RoundedBox args={[BODY.w, BODY.h, BODY.d]} radius={BODY.r} smoothness={8}>
        <meshPhysicalMaterial color="#2A2160" metalness={0.75} roughness={0.28} clearcoat={1} clearcoatRoughness={0.15} />
      </RoundedBox>
      {/* Black glass around the screen */}
      <RoundedBox args={[BODY.w - 0.06, BODY.h - 0.06, 0.02]} radius={BODY.r - 0.03} smoothness={8} position={[0, 0, BODY.d / 2]}>
        <meshPhysicalMaterial color="#07051A" roughness={0.08} metalness={0.2} clearcoat={1} />
      </RoundedBox>
      <mesh position={[0, 0, BODY.d / 2 + 0.012]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial map={screen.texture} transparent toneMapped={false} />
      </mesh>
      {/* Side buttons */}
      {(
        [
          [BODY.w / 2 + 0.012, 0.9, 0.5],
          [-BODY.w / 2 - 0.012, 1.15, 0.28],
          [-BODY.w / 2 - 0.012, 0.65, 0.42]
        ] as const
      ).map(([x, y, length]) => (
        <RoundedBox key={`${x}-${y}`} args={[0.04, length, 0.08]} radius={0.018} position={[x, y, 0]}>
          <meshStandardMaterial color="#3A3180" metalness={0.8} roughness={0.3} />
        </RoundedBox>
      ))}
    </group>
  );
}

export default function PhoneScene({ still, scroll }: { still: boolean; scroll?: MotionValue<number> }) {
  return (
    <Canvas camera={{ position: [0, 0, 7.4], fov: 38 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }} aria-hidden>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      {/* Coral and raspberry rim lights pick out the edges against the indigo page */}
      <pointLight position={[-3.5, 2, -1.5]} intensity={28} color="#FF6B5E" />
      <pointLight position={[3.5, -2.5, -1]} intensity={22} color="#E0457B" />
      <Float speed={still ? 0 : 1.4} rotationIntensity={still ? 0 : 0.18} floatIntensity={still ? 0 : 0.5}>
        <Phone still={still} scroll={scroll} />
      </Float>
    </Canvas>
  );
}
