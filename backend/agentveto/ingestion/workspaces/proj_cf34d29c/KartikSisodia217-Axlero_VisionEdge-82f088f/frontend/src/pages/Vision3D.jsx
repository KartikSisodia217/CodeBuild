import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  OrbitControls,
  Sphere,
} from "@react-three/drei";
import * as THREE from "three";
import { Box } from "@mui/material";

/* ============================================================
   PARTICLE
============================================================ */

function Particle({ position, color, size = 0.06, speed = 1.5 }) {
  return (
    <Float
      speed={speed}
      rotationIntensity={1.5}
      floatIntensity={1.5}
    >
      <Sphere position={position} args={[size, 16, 16]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
          toneMapped={false}
        />
      </Sphere>
    </Float>
  );
}

/* ============================================================
   ORBITING RING
============================================================ */

function OrbitRing({
  radius,
  rotation,
  color,
  speed,
  thickness = 0.018,
}) {
  const ref = useRef(null);

  useFrame((_, delta) => {
    if (!ref.current) return;

    ref.current.rotation.x += delta * speed;
    ref.current.rotation.y += delta * speed * 0.55;
    ref.current.rotation.z += delta * speed * 0.25;
  });

  return (
    <mesh ref={ref} rotation={rotation}>
      <torusGeometry
        args={[
          radius,
          thickness,
          16,
          128,
        ]}
      />

      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.5}
        metalness={0.7}
        roughness={0.18}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ============================================================
   VISION CORE
============================================================ */

function VisionCore() {
  const coreRef = useRef(null);
  const innerRef = useRef(null);

  useFrame((_, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.35;
      coreRef.current.rotation.y += delta * 0.55;
      coreRef.current.rotation.z += delta * 0.18;
    }

    if (innerRef.current) {
      innerRef.current.rotation.x -= delta * 0.5;
      innerRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <group>
      {/* OUTER CORE */}

      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.05, 2]} />

        <meshStandardMaterial
          color="#2563EB"
          emissive="#1D4ED8"
          emissiveIntensity={2}
          metalness={0.85}
          roughness={0.15}
          wireframe
          toneMapped={false}
        />
      </mesh>

      {/* INNER CORE */}

      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.62, 2]} />

        <meshStandardMaterial
          color="#38BDF8"
          emissive="#0284C7"
          emissiveIntensity={3}
          metalness={0.55}
          roughness={0.12}
          wireframe
          toneMapped={false}
        />
      </mesh>

      {/* ENERGY SPHERE */}

      <Sphere args={[0.42, 32, 32]}>
        <meshStandardMaterial
          color="#67E8F9"
          emissive="#06B6D4"
          emissiveIntensity={4}
          metalness={0.25}
          roughness={0.08}
          toneMapped={false}
        />
      </Sphere>

      {/* ORBIT RINGS */}

      <OrbitRing
        radius={1.4}
        rotation={[Math.PI / 2, 0, 0]}
        color="#38BDF8"
        speed={0.75}
      />

      <OrbitRing
        radius={1.7}
        rotation={[0, Math.PI / 3, 0]}
        color="#60A5FA"
        speed={-0.55}
      />

      <OrbitRing
        radius={2}
        rotation={[
          Math.PI / 4,
          0,
          Math.PI / 4,
        ]}
        color="#818CF8"
        speed={0.35}
        thickness={0.014}
      />

      {/* PARTICLES */}

      <Particle
        position={[2.15, 0.7, 0]}
        color="#22C55E"
        size={0.09}
        speed={2}
      />

      <Particle
        position={[-2.05, -0.65, 0.5]}
        color="#38BDF8"
        size={0.075}
        speed={1.5}
      />

      <Particle
        position={[0.5, 1.95, 0.2]}
        color="#A78BFA"
        size={0.065}
        speed={1.8}
      />

      <Particle
        position={[-0.7, -1.8, -0.4]}
        color="#22D3EE"
        size={0.055}
        speed={2.2}
      />

      <Particle
        position={[1.7, -1.25, 0.4]}
        color="#60A5FA"
        size={0.06}
        speed={1.7}
      />
    </group>
  );
}

/* ============================================================
   SCENE
============================================================ */

function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />

      <pointLight
        position={[4, 4, 5]}
        intensity={7}
        color="#38BDF8"
      />

      <pointLight
        position={[-4, -3, 3]}
        intensity={4}
        color="#2563EB"
      />

      <pointLight
        position={[0, 0, 4]}
        intensity={2}
        color="#A78BFA"
      />

      <VisionCore />

      <Environment preset="city" />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.45}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(Math.PI * 2) / 3}
      />
    </>
  );
}

/* ============================================================
   METRIC
============================================================ */

function Metric({ label, value, accent = "#38BDF8" }) {
  return (
    <Box
      sx={{
        minWidth: {
          xs: 92,
          sm: 120,
          md: 135,
        },

        px: {
          xs: 1.3,
          md: 1.8,
        },

        py: 1.15,

        borderRadius: 2.5,

        background:
          "linear-gradient(135deg, rgba(15,23,42,0.86), rgba(2,6,23,0.72))",

        border:
          "1px solid rgba(148,163,184,0.16)",

        boxShadow:
          `0 0 25px ${accent}18`,

        backdropFilter: "blur(14px)",

        textAlign: "center",
      }}
    >
      <Box
        sx={{
          color: "#64748B",
          fontSize: "0.57rem",
          fontWeight: 800,
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </Box>

      <Box
        sx={{
          color: "#F8FAFC",
          fontSize: {
            xs: "0.95rem",
            md: "1.1rem",
          },
          fontWeight: 900,
          mt: 0.35,

          textShadow:
            `0 0 12px ${accent}80`,
        }}
      >
        {value}
      </Box>
    </Box>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

function Vision3D({
  activeCameras = 0,
  detections = 0,
  inferenceSpeed = 0,
}) {
  return (
    <Box
      sx={{
        width: "100%",

        height: {
          xs: 350,
          sm: 390,
          md: 440,
        },

        position: "relative",

        overflow: "hidden",

        borderRadius: {
          xs: 3,
          md: 4,
        },

        background:
          `
          radial-gradient(
            circle at 50% 45%,
            rgba(37,99,235,0.25) 0%,
            rgba(14,165,233,0.12) 20%,
            rgba(15,23,42,0.35) 42%,
            #020617 72%,
            #01030A 100%
          )
          `,

        border:
          "1px solid rgba(59,130,246,0.28)",

        boxShadow:
          "0 25px 80px rgba(15,23,42,0.35)",

        "&::before": {
          content: '""',

          position: "absolute",

          inset: 0,

          pointerEvents: "none",

          background:
            `
            linear-gradient(
              rgba(56,189,248,0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(56,189,248,0.035) 1px,
              transparent 1px
            )
            `,

          backgroundSize: "32px 32px",

          maskImage:
            "radial-gradient(circle at center, black 25%, transparent 80%)",
        },

        "&::after": {
          content: '""',

          position: "absolute",

          inset: 0,

          pointerEvents: "none",

          background:
            "radial-gradient(circle at center, transparent 35%, rgba(2,6,23,0.55) 100%)",
        },
      }}
    >
      {/* ======================================================
          3D CANVAS
      ====================================================== */}

      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 42,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        <Scene />
      </Canvas>

      {/* ======================================================
          TOP LEFT
      ====================================================== */}

      <Box
        sx={{
          position: "absolute",

          top: {
            xs: 16,
            md: 22,
          },

          left: {
            xs: 16,
            md: 24,
          },

          zIndex: 5,
        }}
      >
        <Box
          sx={{
            color: "#F8FAFC",

            fontSize: {
              xs: "0.7rem",
              md: "0.8rem",
            },

            fontWeight: 900,

            letterSpacing: "0.13em",

            textShadow:
              "0 0 18px rgba(56,189,248,0.75)",
          }}
        >
          VISIONEDGE AI CORE
        </Box>

        <Box
          sx={{
            display: "flex",

            alignItems: "center",

            gap: 0.8,

            mt: 0.8,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,

              borderRadius: "50%",

              bgcolor: "#22C55E",

              boxShadow:
                "0 0 6px #22C55E, 0 0 16px #22C55E",

              animation:
                "visionPulse 1.8s ease-in-out infinite",

              "@keyframes visionPulse": {
                "0%, 100%": {
                  opacity: 1,
                  transform: "scale(1)",
                },

                "50%": {
                  opacity: 0.45,
                  transform: "scale(0.75)",
                },
              },
            }}
          />

          <Box
            sx={{
              color: "#CBD5E1",

              fontSize: "0.62rem",

              fontWeight: 800,

              letterSpacing: "0.08em",
            }}
          >
            SYSTEM ONLINE
          </Box>
        </Box>
      </Box>

      {/* ======================================================
          TOP RIGHT
      ====================================================== */}

      <Box
        sx={{
          position: "absolute",

          top: {
            xs: 16,
            md: 22,
          },

          right: {
            xs: 16,
            md: 24,
          },

          zIndex: 5,

          px: 1.5,

          py: 0.8,

          borderRadius: 2,

          bgcolor:
            "rgba(15,23,42,0.55)",

          border:
            "1px solid rgba(56,189,248,0.15)",

          backdropFilter:
            "blur(12px)",
        }}
      >
        <Box
          sx={{
            color: "#38BDF8",

            fontSize: "0.58rem",

            fontWeight: 900,

            letterSpacing: "0.1em",
          }}
        >
          TENSORRT
        </Box>

        <Box
          sx={{
            color: "#64748B",

            fontSize: "0.52rem",

            mt: 0.2,
          }}
        >
          HARDWARE ACCELERATED
        </Box>
      </Box>

      {/* ======================================================
          CENTER TITLE
      ====================================================== */}

      <Box
        sx={{
          position: "absolute",

          top: "50%",

          left: "50%",

          transform:
            "translate(-50%, -50%)",

          textAlign: "center",

          pointerEvents: "none",

          zIndex: 4,

          width: "100%",
        }}
      >
        <Box
          sx={{
            color: "#FFFFFF",

            fontSize: {
              xs: "0.72rem",
              sm: "0.82rem",
              md: "0.95rem",
            },

            fontWeight: 900,

            letterSpacing: {
              xs: "0.08em",
              md: "0.14em",
            },

            textShadow:
              "0 0 25px rgba(56,189,248,0.9)",
          }}
        >
          AI VIDEO INTELLIGENCE
        </Box>

        <Box
          sx={{
            color: "#64748B",

            fontSize: {
              xs: "0.5rem",
              md: "0.6rem",
            },

            mt: 0.5,

            letterSpacing: "0.12em",
          }}
        >
          REAL-TIME EDGE INFERENCE
        </Box>
      </Box>

      {/* ======================================================
          BOTTOM METRICS
      ====================================================== */}

      <Box
        sx={{
          position: "absolute",

          bottom: {
            xs: 14,
            md: 20,
          },

          left: 16,

          right: 16,

          display: "flex",

          justifyContent: "center",

          alignItems: "center",

          gap: {
            xs: 0.8,
            sm: 1.5,
            md: 2,
          },

          zIndex: 5,

          flexWrap: "wrap",
        }}
      >
        <Metric
          label="ACTIVE CAMERAS"
          value={activeCameras}
          accent="#38BDF8"
        />

        <Metric
          label="DETECTIONS"
          value={detections}
          accent="#A78BFA"
        />

        <Metric
          label="INFERENCE"
          value={
            inferenceSpeed
              ? `${inferenceSpeed} FPS`
              : "0 FPS"
          }
          accent="#22C55E"
        />
      </Box>
    </Box>
  );
}

export default Vision3D;