import { useEffect, useMemo, useState } from "react";

import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import SensorsRoundedIcon from "@mui/icons-material/SensorsRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const initialCameras = [
  {
    id: "CAM-01",
    name: "Main Entrance",
    location: "North Gate",
    status: "Online",
    fps: 30,
    latency: 24,
    people: 8,
    vehicles: 3,
    gpu: 42,
  },
  {
    id: "CAM-02",
    name: "Parking Area",
    location: "East Parking",
    status: "Online",
    fps: 29,
    latency: 31,
    people: 5,
    vehicles: 12,
    gpu: 48,
  },
  {
    id: "CAM-03",
    name: "Warehouse",
    location: "Warehouse Zone",
    status: "Online",
    fps: 30,
    latency: 27,
    people: 4,
    vehicles: 2,
    gpu: 51,
  },
  {
    id: "CAM-04",
    name: "Main Lobby",
    location: "Reception",
    status: "Online",
    fps: 28,
    latency: 35,
    people: 11,
    vehicles: 0,
    gpu: 39,
  },
  {
    id: "CAM-05",
    name: "Loading Dock",
    location: "South Gate",
    status: "Offline",
    fps: 0,
    latency: 0,
    people: 0,
    vehicles: 0,
    gpu: 0,
  },
  {
    id: "CAM-06",
    name: "Restricted Zone",
    location: "Security Area",
    status: "Online",
    fps: 30,
    latency: 22,
    people: 2,
    vehicles: 1,
    gpu: 45,
  },
];

function RealTimeMonitoringPage() {
  const [cameras, setCameras] = useState(initialCameras);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  /*
   * Simulated real-time monitoring.
   * Existing functionality is preserved.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCameras((current) =>
        current.map((camera) => {
          if (camera.status === "Offline") {
            return camera;
          }

          const fpsVariation =
            Math.floor(Math.random() * 3) - 1;

          const latencyVariation =
            Math.floor(Math.random() * 7) - 3;

          const gpuVariation =
            Math.floor(Math.random() * 5) - 2;

          return {
            ...camera,

            fps: Math.max(
              24,
              Math.min(
                30,
                camera.fps + fpsVariation
              )
            ),

            latency: Math.max(
              15,
              camera.latency + latencyVariation
            ),

            gpu: Math.max(
              25,
              Math.min(
                80,
                camera.gpu + gpuVariation
              )
            ),
          };
        })
      );

      setLastUpdated(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const refreshMonitoring = () => {
    setLastUpdated(new Date());

    setCameras((current) =>
      current.map((camera) => {
        if (camera.status === "Offline") {
          return camera;
        }

        return {
          ...camera,
          fps: 30,
          latency:
            20 + Math.floor(Math.random() * 15),
        };
      })
    );
  };

  const onlineCameras = cameras.filter(
    (camera) => camera.status === "Online"
  ).length;

  const offlineCameras = cameras.filter(
    (camera) => camera.status === "Offline"
  ).length;

  const totalFPS = cameras.reduce(
    (total, camera) => total + camera.fps,
    0
  );

  const totalPeople = cameras.reduce(
    (total, camera) => total + camera.people,
    0
  );

  const totalVehicles = cameras.reduce(
    (total, camera) => total + camera.vehicles,
    0
  );

  const filteredCameras = useMemo(() => {
    return cameras.filter((camera) => {
      const normalizedSearch =
        search.trim().toLowerCase();

      const matchesSearch =
        normalizedSearch === "" ||
        `${camera.name} ${camera.location} ${camera.id}`
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        camera.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cameras, search, statusFilter]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 80px)",
        width: "100%",
        bgcolor: "background.default",
        color: "text.primary",
        p: {
          xs: 2,
          md: 4,
        },
        transition:
          "background-color 0.25s ease, color 0.25s ease",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          flexDirection: {
            xs: "column",
            md: "row",
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Avatar
              sx={{
                width: 50,
                height: 50,
                bgcolor: "rgba(5,150,105,0.12)",
                color: "#10B981",
              }}
            >
              <VideocamRoundedIcon />
            </Avatar>

            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  sx={{
                    fontSize: {
                      xs: "1.7rem",
                      md: "2.2rem",
                    },
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1.15,
                  }}
                >
                  Real-Time Monitoring
                </Typography>

                <Chip
                  icon={
                    <Box
                      component="span"
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#22C55E",
                        animation:
                          "livePulse 1.4s infinite",

                        "@keyframes livePulse": {
                          "0%": {
                            opacity: 1,
                            transform: "scale(1)",
                          },
                          "50%": {
                            opacity: 0.35,
                            transform: "scale(0.75)",
                          },
                          "100%": {
                            opacity: 1,
                            transform: "scale(1)",
                          },
                        },
                      }}
                    />
                  }
                  label="LIVE"
                  size="small"
                  sx={{
                    fontWeight: 800,
                    color: "#22C55E",
                    bgcolor:
                      "rgba(34,197,94,0.12)",
                    border:
                      "1px solid rgba(34,197,94,0.20)",
                  }}
                />
              </Box>

              <Typography
                sx={{
                  color: "text.secondary",
                  mt: 0.5,
                }}
              >
                Live camera feeds and real-time AI
                processing
              </Typography>
            </Box>
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={refreshMonitoring}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* =====================================================
          LIVE STATUS BAR
      ===================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 4,
          p: 2,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          backgroundImage:
            "linear-gradient(90deg, rgba(34,197,94,0.08), transparent)",
          transition:
            "background-color 0.25s ease, border-color 0.25s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "#22C55E",
              boxShadow:
                "0 0 0 6px rgba(34,197,94,.12)",
              animation:
                "liveDot 1.5s infinite",

              "@keyframes liveDot": {
                "0%": {
                  boxShadow:
                    "0 0 0 4px rgba(34,197,94,.18)",
                },
                "50%": {
                  boxShadow:
                    "0 0 0 10px rgba(34,197,94,.04)",
                },
                "100%": {
                  boxShadow:
                    "0 0 0 4px rgba(34,197,94,.18)",
                },
              },
            }}
          />

          <Typography
            fontWeight={800}
            sx={{
              color: "#22C55E",
            }}
          >
            Live monitoring active
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.85rem",
            }}
          >
            Last updated {formatTime(lastUpdated)}
          </Typography>
        </Box>
      </Card>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <Grid
        container
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <MonitoringSummary
            icon={<VideocamRoundedIcon />}
            title="Live Cameras"
            value={`${onlineCameras}/${cameras.length}`}
            subtitle={
              offlineCameras > 0
                ? `${offlineCameras} offline`
                : "All cameras online"
            }
            color="#10B981"
            background="rgba(16,185,129,0.12)"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <MonitoringSummary
            icon={<SensorsRoundedIcon />}
            title="AI Monitoring"
            value="ACTIVE"
            subtitle="Real-time detection enabled"
            color="#60A5FA"
            background="rgba(37,99,235,0.12)"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <MonitoringSummary
            icon={<SpeedRoundedIcon />}
            title="Stream FPS"
            value={totalFPS}
            subtitle="Combined camera FPS"
            color="#A78BFA"
            background="rgba(124,58,237,0.12)"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <MonitoringSummary
            icon={<PeopleRoundedIcon />}
            title="Objects Detected"
            value={totalPeople + totalVehicles}
            subtitle={`${totalPeople} people • ${totalVehicles} vehicles`}
            color="#FB923C"
            background="rgba(234,88,12,0.12)"
          />
        </Grid>
      </Grid>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 4,
          p: 2.5,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
        >
          <Grid
            size={{
              xs: 12,
              md: 5,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search cameras..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              InputProps={{
                startAdornment: (
                  <SearchRoundedIcon
                    sx={{
                      mr: 1,
                      color: "text.secondary",
                    }}
                  />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: "background.default",
                },
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <TextField
              fullWidth
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
              }}
            >
              <MenuItem value="all">
                All Cameras
              </MenuItem>

              <MenuItem value="online">
                Online
              </MenuItem>

              <MenuItem value="offline">
                Offline
              </MenuItem>
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              Showing{" "}
              <Box
                component="span"
                sx={{
                  color: "text.primary",
                  fontWeight: 800,
                }}
              >
                {filteredCameras.length}
              </Box>{" "}
              cameras
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* =====================================================
          CAMERA GRID
      ===================================================== */}

      <Grid
        container
        spacing={3}
      >
        {filteredCameras.map((camera) => {
          const isOnline =
            camera.status === "Online";

          return (
            <Grid
              key={camera.id}
              size={{
                xs: 12,
                md: 6,
                xl: 4,
              }}
            >
              <CameraCard
                camera={camera}
                isOnline={isOnline}
              />
            </Grid>
          );
        })}
      </Grid>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {filteredCameras.length === 0 && (
        <Card
          elevation={0}
          sx={{
            mt: 3,
            py: 8,
            textAlign: "center",
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <VideocamRoundedIcon
            sx={{
              fontSize: 55,
              color: "text.secondary",
              opacity: 0.45,
              mb: 1,
            }}
          />

          <Typography
            fontWeight={800}
            color="text.primary"
          >
            No cameras found
          </Typography>

          <Typography
            color="text.secondary"
            fontSize="0.9rem"
          >
            Try changing your search or status
            filter.
          </Typography>
        </Card>
      )}
    </Box>
  );
}

/* ============================================================
   CAMERA CARD
============================================================ */

function CameraCard({
  camera,
  isOnline,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        overflow: "hidden",
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",

        transition:
          "transform .3s ease, box-shadow .3s ease, background-color .25s ease",

        "&:hover": {
          transform: "translateY(-7px)",
          boxShadow:
            "0 20px 40px rgba(0,0,0,.20)",
        },
      }}
    >
      {/* VIDEO AREA */}

      <Box
        sx={{
          position: "relative",
          height: 230,
          overflow: "hidden",

          background:
            "linear-gradient(135deg,#0F172A,#1E293B 55%,#0F172A)",
        }}
      >
        {isOnline && (
          <>
            {/* GRID */}

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0.12,

                backgroundImage:
                  "linear-gradient(#94A3B8 1px, transparent 1px), linear-gradient(90deg,#94A3B8 1px,transparent 1px)",

                backgroundSize: "35px 35px",
              }}
            />

            {/* SCANNING LINE */}

            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                height: 2,

                background:
                  "linear-gradient(90deg,transparent,#22C55E,transparent)",

                boxShadow:
                  "0 0 14px rgba(34,197,94,.8)",

                animation:
                  "scanLine 3s linear infinite",

                "@keyframes scanLine": {
                  "0%": {
                    top: "5%",
                    opacity: 0,
                  },
                  "15%": {
                    opacity: 1,
                  },
                  "85%": {
                    opacity: 1,
                  },
                  "100%": {
                    top: "95%",
                    opacity: 0,
                  },
                },
              }}
            />

            {/* CENTER CAMERA */}

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <VideocamRoundedIcon
                sx={{
                  fontSize: 65,
                  color:
                    "rgba(255,255,255,.18)",
                }}
              />
            </Box>
          </>
        )}

        {!isOnline && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#94A3B8",
            }}
          >
            <VideocamRoundedIcon
              sx={{
                fontSize: 55,
                mb: 1,
              }}
            />

            <Typography fontWeight={700}>
              Camera Offline
            </Typography>
          </Box>
        )}

        {/* LIVE */}

        <Chip
          label={
            isOnline ? "● LIVE" : "OFFLINE"
          }
          size="small"
          sx={{
            position: "absolute",
            top: 14,
            left: 14,
            fontWeight: 800,

            color: isOnline
              ? "#86EFAC"
              : "#CBD5E1",

            bgcolor: isOnline
              ? "rgba(22,101,52,.8)"
              : "rgba(51,65,85,.85)",

            backdropFilter: "blur(8px)",
          }}
        />

        {/* CAMERA ID */}

        <Chip
          label={camera.id}
          size="small"
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            color: "#E2E8F0",
            bgcolor:
              "rgba(15,23,42,.7)",
            backdropFilter: "blur(8px)",
          }}
        />

        {/* AI BADGE */}

        {isOnline && (
          <Box
            sx={{
              position: "absolute",
              bottom: 14,
              left: 14,
              right: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                color:
                  "rgba(255,255,255,.75)",
                fontSize: "0.72rem",
                fontWeight: 700,
              }}
            >
              AI DETECTION ACTIVE
            </Typography>

            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#22C55E",
                boxShadow:
                  "0 0 12px #22C55E",
              }}
            />
          </Box>
        )}
      </Box>

      {/* CARD CONTENT */}

      <Box sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              fontWeight={800}
              color="text.primary"
              fontSize="1.05rem"
            >
              {camera.name}
            </Typography>

            <Typography
              color="text.secondary"
              fontSize="0.8rem"
              mt={0.3}
            >
              {camera.location}
            </Typography>
          </Box>

          <Chip
            icon={
              isOnline ? (
                <CheckCircleRoundedIcon />
              ) : (
                <WarningAmberRoundedIcon />
              )
            }
            label={camera.status}
            size="small"
            sx={{
              fontWeight: 700,

              color: isOnline
                ? "#10B981"
                : "#F87171",

              bgcolor: isOnline
                ? "rgba(16,185,129,0.12)"
                : "rgba(239,68,68,0.12)",
            }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* METRICS */}

        <Grid
          container
          spacing={1.5}
        >
          <Metric
            icon={<SpeedRoundedIcon />}
            label="FPS"
            value={
              isOnline ? camera.fps : "—"
            }
          />

          <Metric
            icon={<WifiRoundedIcon />}
            label="Latency"
            value={
              isOnline
                ? `${camera.latency} ms`
                : "—"
            }
          />

          <Metric
            icon={<PeopleRoundedIcon />}
            label="People"
            value={
              isOnline
                ? camera.people
                : "—"
            }
          />

          <Metric
            icon={
              <DirectionsCarRoundedIcon />
            }
            label="Vehicles"
            value={
              isOnline
                ? camera.vehicles
                : "—"
            }
          />

          <Metric
            icon={<MemoryRoundedIcon />}
            label="GPU"
            value={
              isOnline
                ? `${camera.gpu}%`
                : "—"
            }
          />

          <Metric
            icon={<SensorsRoundedIcon />}
            label="AI"
            value={
              isOnline ? "ON" : "OFF"
            }
          />
        </Grid>
      </Box>
    </Card>
  );
}

/* ============================================================
   METRIC
============================================================ */

function Metric({
  icon,
  label,
  value,
}) {
  return (
    <Grid
      size={{
        xs: 6,
        sm: 4,
      }}
    >
      <Box
        sx={{
          p: 1.2,
          borderRadius: 2.5,
          bgcolor: "background.default",
          border: "1px solid",
          borderColor: "divider",
          transition:
            "background-color .25s ease, border-color .25s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.6,
            color: "text.secondary",
          }}
        >
          {icon}

          <Typography
            sx={{
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "text.secondary",
            }}
          >
            {label}
          </Typography>
        </Box>

        <Typography
          sx={{
            mt: 0.4,
            fontWeight: 800,
            color: "text.primary",
            fontSize: "0.9rem",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Grid>
  );
}

/* ============================================================
   MONITORING SUMMARY
============================================================ */

function MonitoringSummary({
  icon,
  title,
  value,
  subtitle,
  color,
  background,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        p: 2.5,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",

        transition:
          "transform .25s ease, box-shadow .25s ease, background-color .25s ease",

        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow:
            "0 16px 30px rgba(0,0,0,.16)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: background,
            color,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: "text.primary",
              fontSize: "1.7rem",
              lineHeight: 1.1,
              fontWeight: 800,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>

      <Typography
        sx={{
          display: "block",
          mt: 1.5,
          color: "text.secondary",
          fontSize: "0.75rem",
        }}
      >
        {subtitle}
      </Typography>
    </Card>
  );
}

export default RealTimeMonitoringPage;