import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  OrbitControls,
  Sphere,
  Environment,
} from "@react-three/drei";

import { useRef } from "react";
import * as THREE from "three";
import { Box, Typography } from "@mui/material";

/* ============================================================
   VISION CORE
============================================================ */

function VisionCore() {
  const coreRef = useRef(null);
  const innerRef = useRef(null);

  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const ring3Ref = useRef(null);

  const particleRefs = useRef([]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    /* CORE ROTATION */
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.28;
      coreRef.current.rotation.y += delta * 0.55;
      coreRef.current.rotation.z += delta * 0.18;
    }

    /* INNER CORE */
    if (innerRef.current) {
      const scale =
        1 + Math.sin(time * 2.2) * 0.045;

      innerRef.current.scale.set(
        scale,
        scale,
        scale
      );
    }

    /* RINGS */
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x +=
        delta * 0.45;

      ring1Ref.current.rotation.y +=
        delta * 0.18;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.x -=
        delta * 0.28;

      ring2Ref.current.rotation.z +=
        delta * 0.38;
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.y +=
        delta * 0.18;

      ring3Ref.current.rotation.z -=
        delta * 0.32;
    }

    /* PARTICLE PULSE */
    particleRefs.current.forEach(
      (particle, index) => {
        if (!particle) return;

        const pulse =
          1 +
          Math.sin(
            time * (2 + index * 0.4)
          ) *
            0.25;

        particle.scale.set(
          pulse,
          pulse,
          pulse
        );
      }
    );
  });

  return (
    <group>
      {/* ======================================================
          OUTER GLOW SPHERE
      ====================================================== */}

      <mesh>
        <sphereGeometry
          args={[1.12, 32, 32]}
        />

        <meshBasicMaterial
          color="#0EA5E9"
          transparent
          opacity={0.055}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ======================================================
          MAIN WIREFRAME CORE
      ====================================================== */}

      <mesh ref={coreRef}>
        <icosahedronGeometry
          args={[1.0, 2]}
        />

        <meshStandardMaterial
          color="#2563EB"
          emissive="#1D4ED8"
          emissiveIntensity={2}
          metalness={0.85}
          roughness={0.18}
          wireframe
        />
      </mesh>

      {/* ======================================================
          INNER CORE
      ====================================================== */}

      <mesh ref={innerRef}>
        <sphereGeometry
          args={[0.5, 32, 32]}
        />

        <meshStandardMaterial
          color="#38BDF8"
          emissive="#0284C7"
          emissiveIntensity={3}
          metalness={0.55}
          roughness={0.12}
        />
      </mesh>

      {/* ======================================================
          CORE CENTER
      ====================================================== */}

      <mesh>
        <sphereGeometry
          args={[0.18, 24, 24]}
        />

        <meshBasicMaterial
          color="#E0F2FE"
        />
      </mesh>

      {/* ======================================================
          RING 1
      ====================================================== */}

      <mesh
        ref={ring1Ref}
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      >
        <torusGeometry
          args={[
            1.38,
            0.025,
            16,
            120,
          ]}
        />

        <meshStandardMaterial
          color="#38BDF8"
          emissive="#0EA5E9"
          emissiveIntensity={3}
        />
      </mesh>

      {/* ======================================================
          RING 2
      ====================================================== */}

      <mesh
        ref={ring2Ref}
        rotation={[
          0,
          Math.PI / 3,
          0,
        ]}
      >
        <torusGeometry
          args={[
            1.68,
            0.018,
            16,
            120,
          ]}
        />

        <meshStandardMaterial
          color="#60A5FA"
          emissive="#2563EB"
          emissiveIntensity={2.5}
        />
      </mesh>

      {/* ======================================================
          RING 3
      ====================================================== */}

      <mesh
        ref={ring3Ref}
        rotation={[
          Math.PI / 4,
          0,
          Math.PI / 4,
        ]}
      >
        <torusGeometry
          args={[
            1.95,
            0.014,
            16,
            120,
          ]}
        />

        <meshStandardMaterial
          color="#93C5FD"
          emissive="#3B82F6"
          emissiveIntensity={2}
        />
      </mesh>

      {/* ======================================================
          CAMERA / DETECTION NODES
      ====================================================== */}

      <Float
        speed={2}
        rotationIntensity={1}
        floatIntensity={1}
      >
        <mesh
          ref={(el) =>
            (particleRefs.current[0] = el)
          }
          position={[2.0, 0.65, 0]}
        >
          <sphereGeometry
            args={[0.085, 16, 16]}
          />

          <meshStandardMaterial
            color="#22C55E"
            emissive="#16A34A"
            emissiveIntensity={4}
          />
        </mesh>
      </Float>

      <Float
        speed={1.5}
        rotationIntensity={1}
        floatIntensity={1}
      >
        <mesh
          ref={(el) =>
            (particleRefs.current[1] = el)
          }
          position={[
            -1.9,
            -0.5,
            0.5,
          ]}
        >
          <sphereGeometry
            args={[0.075, 16, 16]}
          />

          <meshStandardMaterial
            color="#38BDF8"
            emissive="#0284C7"
            emissiveIntensity={4}
          />
        </mesh>
      </Float>

      <Float
        speed={1.8}
        rotationIntensity={1}
        floatIntensity={1}
      >
        <mesh
          ref={(el) =>
            (particleRefs.current[2] = el)
          }
          position={[
            0.35,
            1.9,
            0.2,
          ]}
        >
          <sphereGeometry
            args={[0.065, 16, 16]}
          />

          <meshStandardMaterial
            color="#A78BFA"
            emissive="#7C3AED"
            emissiveIntensity={4}
          />
        </mesh>
      </Float>

      <Float
        speed={1.3}
        rotationIntensity={1}
        floatIntensity={1}
      >
        <mesh
          ref={(el) =>
            (particleRefs.current[3] = el)
          }
          position={[
            -0.9,
            1.35,
            -0.7,
          ]}
        >
          <sphereGeometry
            args={[0.055, 16, 16]}
          />

          <meshStandardMaterial
            color="#F59E0B"
            emissive="#D97706"
            emissiveIntensity={4}
          />
        </mesh>
      </Float>

      <Float
        speed={1.7}
        rotationIntensity={1}
        floatIntensity={1}
      >
        <mesh
          ref={(el) =>
            (particleRefs.current[4] = el)
          }
          position={[
            1.45,
            -1.1,
            -0.4,
          ]}
        >
          <sphereGeometry
            args={[0.06, 16, 16]}
          />

          <meshStandardMaterial
            color="#EC4899"
            emissive="#DB2777"
            emissiveIntensity={3}
          />
        </mesh>
      </Float>
    </group>
  );
}

/* ============================================================
   3D SCENE
============================================================ */

function Scene() {
  return (
    <>
      <ambientLight intensity={0.45} />

      <pointLight
        position={[4, 4, 5]}
        intensity={5}
        color="#38BDF8"
      />

      <pointLight
        position={[-4, -3, 2]}
        intensity={3}
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
        maxPolarAngle={
          (Math.PI * 2) / 3
        }
      />
    </>
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
          sm: 380,
          md: 420,
        },

        position: "relative",

        overflow: "hidden",

        borderRadius: 5,

        background:
          "radial-gradient(circle at 50% 45%, rgba(30,64,175,0.55) 0%, rgba(15,23,42,0.95) 42%, #020617 75%, #01030A 100%)",

        border:
          "1px solid rgba(59,130,246,0.28)",

        boxShadow:
          "0 25px 80px rgba(15,23,42,0.35)",

        isolation: "isolate",
      }}
    >
      {/* ======================================================
          BACKGROUND GRID
      ====================================================== */}

      <Box
        sx={{
          position: "absolute",
          inset: 0,

          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)",

          backgroundSize:
            "32px 32px",

          maskImage:
            "radial-gradient(circle at center, black 15%, transparent 78%)",

          pointerEvents: "none",
        }}
      />

      {/* ======================================================
          SCAN LINE
      ====================================================== */}

      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,

          height: 2,

          background:
            "linear-gradient(90deg, transparent, rgba(56,189,248,0.8), transparent)",

          boxShadow:
            "0 0 18px rgba(56,189,248,0.75)",

          zIndex: 3,

          pointerEvents: "none",

          animation:
            "visionScan 5s linear infinite",

          "@keyframes visionScan": {
            "0%": {
              top: "8%",
              opacity: 0,
            },

            "10%": {
              opacity: 1,
            },

            "90%": {
              opacity: 1,
            },

            "100%": {
              top: "92%",
              opacity: 0,
            },
          },
        }}
      />

      {/* ======================================================
          TOP LEFT HUD
      ====================================================== */}

      <Box
        sx={{
          position: "absolute",
          top: 20,
          left: 22,
          zIndex: 5,
        }}
      >
        <Typography3DLabel>
          VISIONEDGE AI CORE
        </Typography3DLabel>

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
                "0 0 6px #22C55E, 0 0 14px #22C55E",

              animation:
                "onlinePulse 1.7s ease-in-out infinite",

              "@keyframes onlinePulse": {
                "0%, 100%": {
                  opacity: 1,
                  transform:
                    "scale(1)",
                },

                "50%": {
                  opacity: 0.55,
                  transform:
                    "scale(0.72)",
                },
              },
            }}
          />

          <Typography
            sx={{
              color: "#CBD5E1",
              fontSize:
                "0.68rem",
              fontWeight: 800,
              letterSpacing:
                "0.08em",
            }}
          >
            SYSTEM ONLINE
          </Typography>
        </Box>
      </Box>

      {/* ======================================================
          TOP RIGHT STATUS
      ====================================================== */}

      <Box
        sx={{
          position: "absolute",
          top: 18,
          right: 18,
          zIndex: 5,

          px: 1.4,
          py: 0.8,

          borderRadius: 2,

          background:
            "rgba(2,6,23,0.58)",

          border:
            "1px solid rgba(56,189,248,0.18)",

          backdropFilter:
            "blur(10px)",
        }}
      >
        <Typography
          sx={{
            color: "#38BDF8",
            fontSize:
              "0.58rem",
            fontWeight: 900,
            letterSpacing:
              "0.1em",
          }}
        >
          HARDWARE ACCELERATED
        </Typography>
      </Box>

      {/* ======================================================
          3D CANVAS
      ====================================================== */}

      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 45,
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
          CENTER HUD
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
        <Typography
          sx={{
            color: "#F8FAFC",

            fontSize: {
              xs: "0.78rem",
              sm: "0.9rem",
              md: "1rem",
            },

            fontWeight: 900,

            letterSpacing:
              "0.16em",

            textShadow:
              "0 0 20px rgba(56,189,248,0.85)",
          }}
        >
          AI VIDEO INTELLIGENCE
        </Typography>

        <Typography
          sx={{
            color: "#64748B",

            fontSize:
              "0.62rem",

            mt: 0.6,

            letterSpacing:
              "0.1em",

            fontWeight: 700,
          }}
        >
          REAL-TIME INFERENCE ENGINE
        </Typography>
      </Box>

      {/* ======================================================
          SIDE HUD MARKERS
      ====================================================== */}

      <Box
        sx={{
          position: "absolute",
          left: {
            xs: 12,
            md: 24,
          },

          top: "50%",

          transform:
            "translateY(-50%)",

          zIndex: 4,

          display: {
            xs: "none",
            sm: "block",
          },
        }}
      >
        <HudMarker
          label="STREAM"
          value="RTSP"
        />

        <HudMarker
          label="ENGINE"
          value="TRT"
        />
      </Box>

      <Box
        sx={{
          position: "absolute",
          right: {
            xs: 12,
            md: 24,
          },

          top: "50%",

          transform:
            "translateY(-50%)",

          zIndex: 4,

          display: {
            xs: "none",
            sm: "block",
          },
        }}
      >
        <HudMarker
          label="MODE"
          value="LIVE"
        />

        <HudMarker
          label="STATUS"
          value="READY"
        />
      </Box>

      {/* ======================================================
          BOTTOM METRICS
      ====================================================== */}

      <Box
        sx={{
          position: "absolute",

          bottom: 18,

          left: {
            xs: 12,
            sm: 20,
          },

          right: {
            xs: 12,
            sm: 20,
          },

          display: "flex",

          justifyContent:
            "center",

          gap: {
            xs: 0.8,
            sm: 1.2,
            md: 2,
          },

          zIndex: 6,

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
          accent="#22C55E"
        />

        <Metric
          label="INFERENCE"
          value={
            inferenceSpeed
              ? `${inferenceSpeed} FPS`
              : "0 FPS"
          }
          accent="#A78BFA"
        />
      </Box>

      {/* ======================================================
          CORNER DECORATIONS
      ====================================================== */}

      <Corner
        position={{
          top: 12,
          left: 12,
        }}
      />

      <Corner
        position={{
          top: 12,
          right: 12,
          rotate: "90deg",
        }}
      />

      <Corner
        position={{
          bottom: 12,
          left: 12,
          rotate: "-90deg",
        }}
      />

      <Corner
        position={{
          bottom: 12,
          right: 12,
          rotate: "180deg",
        }}
      />
    </Box>
  );
}

/* ============================================================
   HUD MARKER
============================================================ */

function HudMarker({
  label,
  value,
}) {
  return (
    <Box
      sx={{
        mb: 1.5,

        px: 1.2,
        py: 0.8,

        borderLeft:
          "2px solid rgba(56,189,248,0.55)",

        background:
          "linear-gradient(90deg, rgba(15,23,42,0.55), transparent)",
      }}
    >
      <Typography
        sx={{
          color: "#64748B",
          fontSize:
            "0.52rem",
          fontWeight: 800,
          letterSpacing:
            "0.1em",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          color: "#CBD5E1",
          fontSize:
            "0.65rem",
          fontWeight: 900,
          mt: 0.2,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/* ============================================================
   CORNER
============================================================ */

function Corner({ position }) {
  return (
    <Box
      sx={{
        position: "absolute",
        width: 18,
        height: 18,

        ...position,

        borderTop:
          "1px solid rgba(56,189,248,0.45)",

        borderLeft:
          "1px solid rgba(56,189,248,0.45)",

        transform: `rotate(${
          position.rotate || "0deg"
        })`,

        zIndex: 7,

        pointerEvents: "none",
      }}
    />
  );
}

/* ============================================================
   LABEL
============================================================ */

function Typography3DLabel({
  children,
}) {
  return (
    <Typography
      sx={{
        color: "#FFFFFF",

        fontSize:
          "0.78rem",

        fontWeight: 900,

        letterSpacing:
          "0.12em",

        textShadow:
          "0 0 16px rgba(56,189,248,0.55)",
      }}
    >
      {children}
    </Typography>
  );
}

/* ============================================================
   METRIC
============================================================ */

function Metric({
  label,
  value,
  accent = "#38BDF8",
}) {
  return (
    <Box
      sx={{
        minWidth: {
          xs: 86,
          sm: 105,
          md: 125,
        },

        px: {
          xs: 1.2,
          sm: 1.5,
          md: 2,
        },

        py: {
          xs: 0.8,
          sm: 1,
        },

        borderRadius: 2.5,

        background:
          "rgba(2,6,23,0.74)",

        border:
          "1px solid rgba(148,163,184,0.14)",

        backdropFilter:
          "blur(12px)",

        boxShadow:
          `0 0 20px ${accent}12`,

        textAlign: "center",
      }}
    >
      <Box
        sx={{
          color: "#64748B",

          fontSize: {
            xs: "0.48rem",
            sm: "0.54rem",
          },

          fontWeight: 900,

          letterSpacing:
            "0.07em",
        }}
      >
        {label}
      </Box>

      <Box
        sx={{
          color: "#F8FAFC",

          fontSize: {
            xs: "0.9rem",
            sm: "1rem",
            md: "1.08rem",
          },

          fontWeight: 900,

          mt: 0.3,

          textShadow:
            `0 0 12px ${accent}55`,
        }}
      >
        {value}
      </Box>
    </Box>
  );
}

export default Vision3D;