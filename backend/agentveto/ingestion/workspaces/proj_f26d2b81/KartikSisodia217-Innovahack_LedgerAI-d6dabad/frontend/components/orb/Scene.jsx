"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

import Orb from "./Orb";

export default function Scene() {
    return (
        <div
            style={{
                width: "400px",
                height: "400px",
                margin: "0 auto",
                background: "transparent",
            }}
        >
            <Canvas
                gl={{ alpha: true, antialias: true }}
                camera={{ position: [0, 0, 3], fov: 45 }}
                style={{ background: "transparent" }}
                onCreated={({ gl, scene }) => {
                    gl.setClearColor(0x000000, 0);
                    scene.background = null;
                }}
            >
                <Suspense fallback={null}>
                    <Orb />
                </Suspense>

                <EffectComposer>
                    <Bloom
                        intensity={0.6}
                        luminanceThreshold={0.4}
                        luminanceSmoothing={0.9}
                        mipmapBlur
                    />
                </EffectComposer>
            </Canvas>
        </div>
    );
}