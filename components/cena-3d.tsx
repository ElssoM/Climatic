"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, Stars } from "@react-three/drei";
import type { Mesh } from "three";

function Planeta() {
    const malha = useRef<Mesh>(null);

    useFrame((_, delta) => {
        if (malha.current) malha.current.rotation.y += delta * 0.12;
    });

    return (
        <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.7}>
            <Sphere ref={malha} args={[1.6, 64, 64]}>
                <MeshDistortMaterial
                    color="#1e6fa8"
                    emissive="#0b3350"
                    emissiveIntensity={0.5}
                    roughness={0.35}
                    metalness={0.15}
                    distort={0.28}
                    speed={1.1}
                />
            </Sphere>
        </Float>
    );
}

function Atmosfera() {
    return (
        <Sphere args={[1.85, 48, 48]}>
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.06} />
        </Sphere>
    );
}

export default function Cena3d() {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            dpr={[1, 1.6]}
            gl={{ antialias: true, powerPreference: "high-performance" }}
        >
            <ambientLight intensity={0.5} />
            <directionalLight position={[4, 3, 5]} intensity={2.2} color="#bfe6ff" />
            <pointLight position={[-4, -2, -3]} intensity={1.4} color="#818cf8" />

            <Planeta />
            <Atmosfera />
            <Stars radius={60} depth={40} count={1200} factor={3} saturation={0} fade speed={0.6} />
        </Canvas>
    );
}
