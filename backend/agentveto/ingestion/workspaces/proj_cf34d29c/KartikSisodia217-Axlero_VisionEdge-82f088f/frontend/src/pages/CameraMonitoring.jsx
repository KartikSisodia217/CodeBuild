import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import VideocamOffRoundedIcon from "@mui/icons-material/VideocamOffRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import SettingsInputAntennaRoundedIcon from "@mui/icons-material/SettingsInputAntennaRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import SensorsRoundedIcon from "@mui/icons-material/SensorsRounded";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import SignalCellularAltRoundedIcon from "@mui/icons-material/SignalCellularAltRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

import dashboardService from "../services/dashboardService";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_CAMERAS = [];

const DEFAULT_RESOLUTION = "1920×1080";

const ACCENT_BLUE = "#38BDF8";
const ACCENT_BLUE_DARK = "#2563EB";
const ACCENT_GREEN = "#22C55E";
const ACCENT_RED = "#EF4444";
const ACCENT_PURPLE = "#A78BFA";

/* =========================================================
   MAIN COMPONENT
========================================================= */

function CameraMonitoring() {
  const [cameras, setCameras] = useState(EMPTY_CAMERAS);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [actionLoading, setActionLoading] = useState({});

  const [lastUpdated, setLastUpdated] = useState(null);

  const loadCameras = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data = await dashboardService.getDashboard();

        const backendCameras = Array.isArray(data?.cameras)
          ? data.cameras
          : [];

        const normalized = backendCameras.map(
          (camera, index) => normalizeCamera(camera, index)
        );

        setCameras(normalized);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Failed to load cameras:", err);

        setError(
          err?.message ||
            "Unable to load camera monitoring data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* =======================================================
     INITIAL LOAD + AUTO REFRESH
  ======================================================= */

  useEffect(() => {
    loadCameras();

    const handleDashboardUpdate = () => {
      loadCameras({ silent: true });
    };

    window.addEventListener(
      "visionedge-dashboard-update",
      handleDashboardUpdate
    );

    const interval = setInterval(() => {
      loadCameras({ silent: true });
    }, 10000);

    return () => {
      window.removeEventListener(
        "visionedge-dashboard-update",
        handleDashboardUpdate
      );

      clearInterval(interval);
    };
  }, [loadCameras]);

  /* =======================================================
     CAMERA STATISTICS
  ======================================================= */

  const cameraStats = useMemo(() => {
    const total = cameras.length;

    const online = cameras.filter(
      (camera) => camera.isOnline
    ).length;

    const offline = total - online;

    const streaming = cameras.filter(
      (camera) => camera.isStreaming
    ).length;

    const aiEnabled = cameras.filter(
      (camera) => camera.aiEnabled
    ).length;

    const availability =
      total > 0
        ? Math.round((online / total) * 100)
        : 0;

    const avgFps =
      cameras.length > 0
        ? Math.round(
            cameras.reduce(
              (sum, camera) => sum + camera.fps,
              0
            ) / cameras.length
          )
        : 0;

    return {
      total,
      online,
      offline,
      streaming,
      aiEnabled,
      availability,
      avgFps,
    };
  }, [cameras]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredCameras = useMemo(() => {
    const query = search.trim().toLowerCase();

    return cameras.filter((camera) => {
      const matchesSearch =
        !query ||
        camera.name.toLowerCase().includes(query) ||
        camera.location.toLowerCase().includes(query) ||
        camera.id.toLowerCase().includes(query);

      let matchesStatus = true;

      if (statusFilter === "online") {
        matchesStatus = camera.isOnline;
      }

      if (statusFilter === "offline") {
        matchesStatus = !camera.isOnline;
      }

      if (statusFilter === "ai") {
        matchesStatus = camera.aiEnabled;
      }

      if (statusFilter === "streaming") {
        matchesStatus = camera.isStreaming;
      }

      return matchesSearch && matchesStatus;
    });
  }, [cameras, search, statusFilter]);

  /* =======================================================
     CAMERA ACTIONS
  ======================================================= */

  const handleCameraAction = async (camera, action) => {
    const key = `${camera.id}-${action}`;

    try {
      setActionLoading((previous) => ({
        ...previous,
        [key]: true,
      }));

      setError("");

      /*
       * Temporary UI-compatible action.
       *
       * Replace this delay later with your cameraService:
       *
       * await cameraService.startCamera(camera.id)
       * await cameraService.stopCamera(camera.id)
       * await cameraService.reconnectCamera(camera.id)
       */

      await new Promise((resolve) => {
        setTimeout(resolve, 600);
      });

      setCameras((previous) =>
        previous.map((item) => {
          if (item.id !== camera.id) {
            return item;
          }

          if (action === "start") {
            return {
              ...item,
              isOnline: true,
              isStreaming: true,
              status: "Online",
              lastSeen: new Date(),
            };
          }

          if (action === "stop") {
            return {
              ...item,
              isStreaming: false,
              status: item.isOnline
                ? "Online"
                : "Offline",
              lastSeen: new Date(),
            };
          }

          if (action === "reconnect") {
            return {
              ...item,
              isOnline: true,
              isStreaming: true,
              status: "Online",
              lastSeen: new Date(),
            };
          }

          return item;
        })
      );

      window.dispatchEvent(
        new Event("visionedge-dashboard-update")
      );
    } catch (err) {
      console.error(
        `Camera ${action} failed:`,
        err
      );

      setError(
        `Failed to ${action} camera.`
      );
    } finally {
      setActionLoading((previous) => {
        const next = {
          ...previous,
        };

        delete next[key];

        return next;
      });
    }
  };

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = () => {
    loadCameras({
      silent: true,
    });
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        p: {
          xs: 1.5,
          sm: 2.5,
          md: 4,
        },
        bgcolor: "background.default",
        color: "text.primary",
        overflowX: "hidden",
      }}
    >
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

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
          mb: 3,
        }}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                background:
                  "linear-gradient(135deg,#2563EB,#38BDF8)",
                boxShadow:
                  "0 12px 35px rgba(37,99,235,.28)",
              }}
            >
              <VideocamRoundedIcon
                sx={{
                  fontSize: 28,
                }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: {
                    xs: "1.45rem",
                    md: "2rem",
                  },
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                }}
              >
                Camera Monitoring
              </Typography>

              <Typography
                sx={{
                  mt: 0.6,
                  color: "text.secondary",
                  fontSize: "0.9rem",
                }}
              >
                Real-time VisionEdge camera,
                stream and AI monitoring
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <Chip
            icon={
              <CircleRoundedIcon
                sx={{
                  fontSize: "10px !important",
                }}
              />
            }
            label={
              cameraStats.online > 0
                ? "Monitoring Active"
                : "No Cameras Online"
            }
            sx={{
              fontWeight: 800,
              color:
                cameraStats.online > 0
                  ? "#15803D"
                  : "#B45309",
              bgcolor:
                cameraStats.online > 0
                  ? "#DCFCE7"
                  : "#FEF3C7",
              "& .MuiChip-icon": {
                color:
                  cameraStats.online > 0
                    ? ACCENT_GREEN
                    : "#F59E0B",
              },
            }}
          />

          <Tooltip title="Refresh cameras">
            <span>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  width: 42,
                  height: 42,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  boxShadow:
                    "0 5px 15px rgba(15,23,42,.05)",
                }}
              >
                <RefreshRoundedIcon
                  sx={{
                    animation: refreshing
                      ? "cameraSpin 1s linear infinite"
                      : "none",
                    "@keyframes cameraSpin": {
                      from: {
                        transform: "rotate(0deg)",
                      },
                      to: {
                        transform: "rotate(360deg)",
                      },
                    },
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 3,
          }}
          icon={<ErrorOutlineRoundedIcon />}
        >
          {error}
        </Alert>
      )}

      {/* ===================================================
          STAT CARDS
      =================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <SummaryCard
            icon={<VideocamRoundedIcon />}
            title="Total Cameras"
            value={cameraStats.total}
            subtitle="Registered cameras"
            iconColor="#2563EB"
            iconBg="rgba(37,99,235,.10)"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <SummaryCard
            icon={<WifiRoundedIcon />}
            title="Online"
            value={cameraStats.online}
            subtitle={`${cameraStats.streaming} streaming now`}
            iconColor="#16A34A"
            iconBg="rgba(22,163,74,.10)"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <SummaryCard
            icon={<MemoryRoundedIcon />}
            title="AI Enabled"
            value={cameraStats.aiEnabled}
            subtitle="AI detection enabled"
            iconColor="#7C3AED"
            iconBg="rgba(124,58,237,.10)"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <SummaryCard
            icon={<SpeedRoundedIcon />}
            title="Average FPS"
            value={cameraStats.avgFps}
            subtitle="Current camera FPS"
            iconColor="#0891B2"
            iconBg="rgba(8,145,178,.10)"
          />
        </Grid>
      </Grid>

      {/* ===================================================
          SYSTEM OVERVIEW
      =================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          overflow: "hidden",
          boxShadow:
            "0 10px 30px rgba(15,23,42,.05)",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              md: 2.5,
            },
          }}
        >
          <Grid
            container
            spacing={3}
            alignItems="center"
          >
            <Grid
              size={{
                xs: 12,
                md: 7,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  mb: 1.2,
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor:
                      "rgba(37,99,235,.09)",
                    color:
                      "primary.main",
                  }}
                >
                  <HubRoundedIcon />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 900,
                    }}
                  >
                    Camera Infrastructure
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    Live connectivity and
                    stream availability
                  </Typography>
                </Box>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={
                  cameraStats.availability
                }
                sx={{
                  height: 9,
                  borderRadius: 10,
                  bgcolor:
                    "action.hover",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 10,
                  },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
                md: 2,
              }}
            >
              <MiniOverview
                icon={
                  <WifiRoundedIcon />
                }
                label="Availability"
                value={`${cameraStats.availability}%`}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
                md: 2,
              }}
            >
              <MiniOverview
                icon={
                  <SignalCellularAltRoundedIcon />
                }
                label="Streaming"
                value={cameraStats.streaming}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 4,
                md: 1,
              }}
            >
              <MiniOverview
                icon={
                  <ShieldRoundedIcon />
                }
                label="AI"
                value={cameraStats.aiEnabled}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ===================================================
          FILTER BAR
      =================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.7,
              md: 2.2,
            },
            "&:last-child": {
              pb: {
                xs: 1.7,
                md: 2.2,
              },
            },
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
                md: 6,
              }}
            >
              <TextField
                fullWidth
                size="small"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search camera name, location or ID..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon
                        sx={{
                          color:
                            "text.secondary",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
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
              <Select
                fullWidth
                size="small"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListRoundedIcon
                      sx={{
                        ml: 1,
                        color:
                          "text.secondary",
                      }}
                    />
                  </InputAdornment>
                }
                sx={{
                  borderRadius: 2.5,
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

                <MenuItem value="streaming">
                  Streaming
                </MenuItem>

                <MenuItem value="ai">
                  AI Enabled
                </MenuItem>
              </Select>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <Stack
                direction="row"
                justifyContent={{
                  xs: "flex-start",
                  md: "flex-end",
                }}
                alignItems="center"
                spacing={1}
              >
                <TuneRoundedIcon
                  sx={{
                    color:
                      "text.secondary",
                    fontSize: 19,
                  }}
                />

                <Typography
                  variant="body2"
                  sx={{
                    color:
                      "text.secondary",
                  }}
                >
                  Showing{" "}
                  <strong>
                    {
                      filteredCameras.length
                    }
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {cameras.length}
                  </strong>
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ===================================================
          CAMERA GRID
      =================================================== */}

      {loading ? (
        <LoadingState />
      ) : filteredCameras.length === 0 ? (
        <EmptyCameraState
          hasCameras={
            cameras.length > 0
          }
        />
      ) : (
        <Grid
          container
          spacing={2.5}
        >
          {filteredCameras.map(
            (camera) => (
              <Grid
                key={camera.id}
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4,
                  xl: 3,
                }}
              >
                <CameraCard
                  camera={camera}
                  actionLoading={
                    actionLoading
                  }
                  onAction={
                    handleCameraAction
                  }
                />
              </Grid>
            )
          )}
        </Grid>
      )}

      {/* ===================================================
          LAST UPDATED
      =================================================== */}

      {lastUpdated && (
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={0.7}
          sx={{
            mt: 3,
            color: "text.secondary",
          }}
        >
          <AccessTimeRoundedIcon
            sx={{
              fontSize: 15,
            }}
          />

          <Typography variant="caption">
            Last updated{" "}
            {formatDateTime(lastUpdated)}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  title,
  value,
  subtitle,
  iconColor,
  iconBg,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        boxShadow:
          "0 8px 24px rgba(15,23,42,.05)",
        transition:
          "transform .2s ease, box-shadow .2s ease",
        "&:hover": {
          transform:
            "translateY(-4px)",
          boxShadow:
            "0 16px 35px rgba(15,23,42,.11)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.2,
          "&:last-child": {
            pb: 2.2,
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{
                color:
                  "text.secondary",
                fontWeight: 700,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 0.4,
                fontSize: "2rem",
                lineHeight: 1,
                fontWeight: 950,
                letterSpacing:
                  "-0.04em",
              }}
            >
              {value}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 0.7,
                color:
                  "text.secondary",
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: iconColor,
              bgcolor: iconBg,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   MINI OVERVIEW
========================================================= */

function MiniOverview({
  icon,
  label,
  value,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor:
            "action.hover",
          color:
            "primary.main",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          variant="caption"
          sx={{
            color:
              "text.secondary",
            fontWeight: 700,
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontWeight: 900,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

/* =========================================================
   CAMERA CARD
========================================================= */

function CameraCard({
  camera,
  actionLoading,
  onAction,
}) {
  const startKey =
    `${camera.id}-start`;

  const stopKey =
    `${camera.id}-stop`;

  const reconnectKey =
    `${camera.id}-reconnect`;

  const busy = Boolean(
    actionLoading[startKey] ||
      actionLoading[stopKey] ||
      actionLoading[reconnectKey]
  );

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        overflow: "hidden",
        bgcolor:
          "background.paper",
        border: 1,
        borderColor:
          camera.isOnline
            ? "rgba(34,197,94,.28)"
            : "divider",
        boxShadow:
          "0 10px 28px rgba(15,23,42,.07)",
        transition:
          "transform .25s ease, box-shadow .25s ease",
        "&:hover": {
          transform:
            "translateY(-5px)",
          boxShadow:
            "0 22px 45px rgba(15,23,42,.13)",
        },
      }}
    >
      {/* =================================================
          LIVE PREVIEW
      ================================================= */}

      <LiveCameraPreview
        camera={camera}
      />

      {/* =================================================
          CARD CONTENT
      ================================================= */}

      <CardContent
        sx={{
          p: 2,
          "&:last-child": {
            pb: 2,
          },
        }}
      >
        {/* TITLE */}

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1}
        >
          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontWeight: 900,
                fontSize:
                  "0.98rem",
                overflow:
                  "hidden",
                textOverflow:
                  "ellipsis",
                whiteSpace:
                  "nowrap",
              }}
            >
              {camera.name}
            </Typography>

            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{
                mt: 0.4,
              }}
            >
              <LocationOnRoundedIcon
                sx={{
                  fontSize: 14,
                  color:
                    "text.secondary",
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  color:
                    "text.secondary",
                  overflow:
                    "hidden",
                  textOverflow:
                    "ellipsis",
                  whiteSpace:
                    "nowrap",
                }}
              >
                {camera.location}
              </Typography>
            </Stack>
          </Box>

          {camera.isOnline ? (
            <WifiRoundedIcon
              sx={{
                color:
                  "success.main",
              }}
            />
          ) : (
            <WifiOffRoundedIcon
              sx={{
                color:
                  "error.main",
              }}
            />
          )}
        </Stack>

        <Divider
          sx={{
            my: 1.6,
          }}
        />

        {/* DETAILS */}

        <Stack
          spacing={1}
        >
          <InfoRow
            icon={
              <SettingsInputAntennaRoundedIcon />
            }
            label="Stream"
            value={
              camera.streamType
            }
          />

          <InfoRow
            icon={
              <SpeedRoundedIcon />
            }
            label="FPS"
            value={`${camera.fps} FPS`}
            valueColor={
              camera.isOnline
                ? "success.main"
                : "text.secondary"
            }
          />

          <InfoRow
            icon={
              <MemoryRoundedIcon />
            }
            label="AI Detection"
            value={
              camera.aiEnabled
                ? "Enabled"
                : "Disabled"
            }
            valueColor={
              camera.aiEnabled
                ? "secondary.main"
                : "text.secondary"
            }
          />
        </Stack>

        {/* ACTION BUTTONS */}

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 2,
          }}
        >
          {camera.isStreaming ? (
            <Button
              fullWidth
              size="small"
              variant="outlined"
              color="error"
              disabled={busy}
              startIcon={
                actionLoading[
                  stopKey
                ] ? (
                  <CircularProgress
                    size={15}
                  />
                ) : (
                  <StopRoundedIcon />
                )
              }
              onClick={() =>
                onAction(
                  camera,
                  "stop"
                )
              }
              sx={{
                borderRadius: 2.2,
                fontWeight: 800,
              }}
            >
              Stop
            </Button>
          ) : (
            <Button
              fullWidth
              size="small"
              variant="contained"
              disabled={busy}
              startIcon={
                actionLoading[
                  startKey
                ] ? (
                  <CircularProgress
                    size={15}
                    sx={{
                      color:
                        "inherit",
                    }}
                  />
                ) : (
                  <PlayArrowRoundedIcon />
                )
              }
              onClick={() =>
                onAction(
                  camera,
                  "start"
                )
              }
              sx={{
                borderRadius: 2.2,
                fontWeight: 800,
              }}
            >
              Start
            </Button>
          )}

          <Button
            fullWidth
            size="small"
            variant="outlined"
            disabled={busy}
            startIcon={
              actionLoading[
                reconnectKey
              ] ? (
                <CircularProgress
                  size={15}
                />
              ) : (
                <ReplayRoundedIcon />
              )
            }
            onClick={() =>
              onAction(
                camera,
                "reconnect"
              )
            }
            sx={{
              borderRadius: 2.2,
              fontWeight: 800,
            }}
          >
            Reconnect
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   LIVE CAMERA PREVIEW
========================================================= */

function LiveCameraPreview({
  camera,
}) {
  const [pulse, setPulse] =
    useState(false);

  useEffect(() => {
    if (!camera.isOnline) {
      return undefined;
    }

    const interval =
      setInterval(() => {
        setPulse(
          (previous) =>
            !previous
        );
      }, 1200);

    return () =>
      clearInterval(interval);
  }, [camera.isOnline]);

  const online =
    camera.isOnline;

  const streaming =
    camera.isStreaming;

  return (
    <Box
      sx={{
        height: 205,
        position:
          "relative",
        overflow: "hidden",
        bgcolor:
          "#020617",
        background: online
          ? "radial-gradient(circle at 50% 45%, rgba(30,64,175,.55), rgba(2,6,23,.98) 72%)"
          : "linear-gradient(145deg,#111827,#020617)",
      }}
    >
      {/* ANIMATED GRID */}

      <Box
        sx={{
          position:
            "absolute",
          inset: 0,
          opacity:
            online
              ? 0.23
              : 0.07,
          backgroundImage:
            "linear-gradient(rgba(56,189,248,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,.22) 1px, transparent 1px)",
          backgroundSize:
            "30px 30px",
          transform:
            online
              ? "scale(1.03)"
              : "none",
          animation:
            online
              ? "gridMove 8s linear infinite"
              : "none",
          "@keyframes gridMove": {
            "0%": {
              transform:
                "translate3d(0,0,0) scale(1.03)",
            },
            "50%": {
              transform:
                "translate3d(-15px,-10px,0) scale(1.03)",
            },
            "100%": {
              transform:
                "translate3d(0,0,0) scale(1.03)",
            },
          },
        }}
      />

      {/* SCAN LINE */}

      {online && (
        <Box
          sx={{
            position:
              "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 2,
            background:
              "linear-gradient(90deg, transparent, #38BDF8, transparent)",
            boxShadow:
              "0 0 18px rgba(56,189,248,.9)",
            animation:
              "cameraScan 3s ease-in-out infinite",
            "@keyframes cameraScan": {
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
      )}

      {/* CORNER BRACKETS */}

      {online && (
        <>
          <PreviewCorner
            top={14}
            left={14}
            borderTop
            borderLeft
          />

          <PreviewCorner
            top={14}
            right={14}
            borderTop
            borderRight
          />

          <PreviewCorner
            bottom={14}
            left={14}
            borderBottom
            borderLeft
          />

          <PreviewCorner
            bottom={14}
            right={14}
            borderBottom
            borderRight
          />
        </>
      )}

      {/* CAMERA CORE */}

      <Box
        sx={{
          position:
            "absolute",
          left: "50%",
          top: "50%",
          transform:
            "translate(-50%, -50%)",
          width: 82,
          height: 82,
          borderRadius:
            "50%",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          color: online
            ? ACCENT_BLUE
            : "#64748B",
          bgcolor:
            "rgba(2,6,23,.72)",
          border:
            "1px solid rgba(148,163,184,.18)",
          boxShadow: online
            ? `0 0 25px rgba(56,189,248,.22), 0 0 ${
                pulse ? 45 : 28
              }px rgba(37,99,235,.15)`
            : "none",
          transition:
            "box-shadow .8s ease",
        }}
      >
        {online ? (
          <VideocamRoundedIcon
            sx={{
              fontSize: 38,
            }}
          />
        ) : (
          <VideocamOffRoundedIcon
            sx={{
              fontSize: 38,
            }}
          />
        )}
      </Box>

      {/* STATUS CHIP */}

      <Chip
        size="small"
        icon={
          online ? (
            <CheckCircleRoundedIcon />
          ) : (
            <WarningAmberRoundedIcon />
          )
        }
        label={
          online
            ? streaming
              ? "LIVE"
              : "ONLINE"
            : "OFFLINE"
        }
        sx={{
          position:
            "absolute",
          top: 12,
          left: 12,
          height: 27,
          fontWeight: 900,
          letterSpacing:
            "0.04em",
          color: online
            ? "#DCFCE7"
            : "#FECACA",
          bgcolor: online
            ? "rgba(20,83,45,.88)"
            : "rgba(127,29,29,.88)",
          backdropFilter:
            "blur(10px)",
          border:
            "1px solid rgba(255,255,255,.08)",
          "& .MuiChip-icon": {
            fontSize: 16,
            color: online
              ? ACCENT_GREEN
              : ACCENT_RED,
          },
        }}
      />

      {/* AI CHIP */}

      {camera.aiEnabled && (
        <Chip
          size="small"
          icon={
            <MemoryRoundedIcon />
          }
          label="AI ACTIVE"
          sx={{
            position:
              "absolute",
            top: 12,
            right: 12,
            height: 27,
            fontWeight: 900,
            letterSpacing:
              "0.03em",
            color:
              "#E9D5FF",
            bgcolor:
              "rgba(76,29,149,.88)",
            backdropFilter:
              "blur(10px)",
            border:
              "1px solid rgba(167,139,250,.18)",
            "& .MuiChip-icon": {
              fontSize: 16,
              color:
                ACCENT_PURPLE,
            },
          }}
        />
      )}

      {/* LIVE LABEL */}

      {streaming && (
        <Box
          sx={{
            position:
              "absolute",
            top: 48,
            right: 14,
            display: "flex",
            alignItems:
              "center",
            gap: 0.6,
            px: 1,
            py: 0.45,
            borderRadius: 2,
            bgcolor:
              "rgba(2,6,23,.7)",
            color:
              "#CBD5E1",
            backdropFilter:
              "blur(8px)",
            fontSize:
              "0.62rem",
            fontWeight: 800,
            letterSpacing:
              "0.05em",
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius:
                "50%",
              bgcolor:
                ACCENT_RED,
              boxShadow:
                "0 0 8px rgba(239,68,68,.8)",
              animation:
                "recordPulse 1.1s infinite",
              "@keyframes recordPulse": {
                "0%,100%": {
                  opacity: 1,
                },
                "50%": {
                  opacity: 0.35,
                },
              },
            }}
          />

          REC
        </Box>
      )}

      {/* BOTTOM METADATA */}

      <Box
        sx={{
          position:
            "absolute",
          left: 12,
          right: 12,
          bottom: 12,
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
        }}
      >
        <Box
          sx={{
            px: 1.1,
            py: 0.55,
            borderRadius: 2,
            bgcolor:
              "rgba(2,6,23,.78)",
            color:
              "#E2E8F0",
            backdropFilter:
              "blur(8px)",
            display: "flex",
            alignItems:
              "center",
            gap: 0.55,
            fontSize:
              "0.68rem",
            fontWeight: 800,
          }}
        >
          <SpeedRoundedIcon
            sx={{
              fontSize: 14,
              color:
                online
                  ? ACCENT_BLUE
                  : "#64748B",
            }}
          />

          {online
            ? `${camera.fps} FPS`
            : "-- FPS"}
        </Box>

        <Box
          sx={{
            px: 1.1,
            py: 0.55,
            borderRadius: 2,
            bgcolor:
              "rgba(2,6,23,.78)",
            color:
              "#E2E8F0",
            backdropFilter:
              "blur(8px)",
            fontSize:
              "0.68rem",
            fontWeight: 800,
          }}
        >
          {camera.resolution}
        </Box>
      </Box>

      {/* OFFLINE OVERLAY */}

      {!online && (
        <Box
          sx={{
            position:
              "absolute",
            inset: 0,
            display: "flex",
            alignItems:
              "flex-end",
            justifyContent:
              "center",
            pb: 3,
            pointerEvents:
              "none",
          }}
        >
          <Typography
            sx={{
              color:
                "rgba(203,213,225,.6)",
              fontSize:
                "0.7rem",
              fontWeight: 800,
              letterSpacing:
                "0.08em",
            }}
          >
            CAMERA SIGNAL UNAVAILABLE
          </Typography>
        </Box>
      )}
    </Box>
  );
}

/* =========================================================
   PREVIEW CORNER
========================================================= */

function PreviewCorner({
  top,
  left,
  right,
  bottom,
  borderTop,
  borderBottom,
  borderLeft,
  borderRight,
}) {
  return (
    <Box
      sx={{
        position:
          "absolute",
        top,
        left,
        right,
        bottom,
        width: 24,
        height: 24,
        borderTop: borderTop
          ? `2px solid ${ACCENT_BLUE}`
          : "none",
        borderBottom:
          borderBottom
            ? `2px solid ${ACCENT_BLUE}`
            : "none",
        borderLeft: borderLeft
          ? `2px solid ${ACCENT_BLUE}`
          : "none",
        borderRight:
          borderRight
            ? `2px solid ${ACCENT_BLUE}`
            : "none",
        opacity: 0.85,
        filter:
          "drop-shadow(0 0 5px rgba(56,189,248,.5))",
      }}
    />
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  icon,
  label,
  value,
  valueColor = "text.primary",
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",
        gap: 1,
      }}
    >
      <Stack
        direction="row"
        spacing={0.8}
        alignItems="center"
        sx={{
          color:
            "text.secondary",
        }}
      >
        {icon}

        <Typography
          variant="caption"
          sx={{
            fontWeight: 650,
          }}
        >
          {label}
        </Typography>
      </Stack>

      <Typography
        variant="caption"
        sx={{
          fontWeight: 900,
          color: valueColor,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: 1,
        borderColor: "divider",
        bgcolor:
          "background.paper",
      }}
    >
      <CardContent
        sx={{
          py: 10,
          textAlign: "center",
        }}
      >
        <CircularProgress />

        <Typography
          sx={{
            mt: 2,
            fontWeight: 800,
          }}
        >
          Loading camera monitoring...
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 0.5,
            color:
              "text.secondary",
          }}
        >
          Connecting to VisionEdge
          camera infrastructure
        </Typography>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyCameraState({
  hasCameras,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: 1,
        borderColor:
          "divider",
        bgcolor:
          "background.paper",
      }}
    >
      <CardContent
        sx={{
          py: 9,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            mx: "auto",
            mb: 2,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor:
              "action.hover",
            color:
              "text.disabled",
          }}
        >
          <VideocamRoundedIcon
            sx={{
              fontSize: 36,
            }}
          />
        </Box>

        <Typography
          sx={{
            fontWeight: 900,
            fontSize:
              "1.05rem",
          }}
        >
          {hasCameras
            ? "No cameras match your filter"
            : "No cameras available"}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 0.7,
            color:
              "text.secondary",
          }}
        >
          {hasCameras
            ? "Try changing your search or status filter."
            : "Add cameras from the camera management section to start monitoring."}
        </Typography>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   NORMALIZE CAMERA
========================================================= */

function normalizeCamera(
  camera,
  index
) {
  const rawStatus = String(
    camera?.status ??
      camera?.state ??
      ""
  )
    .toLowerCase()
    .trim();

  const isOnline =
    camera?.isOnline === true ||
    camera?.online === true ||
    rawStatus === "online" ||
    rawStatus === "active" ||
    rawStatus === "running" ||
    rawStatus === "connected" ||
    rawStatus === "streaming";

  const isStreaming =
    camera?.isStreaming === true ||
    camera?.streaming === true ||
    rawStatus === "streaming" ||
    rawStatus === "running";

  const aiEnabled =
    camera?.aiEnabled !== false &&
    camera?.ai_enabled !== false;

  const fps =
    Number(
      camera?.fps ??
        camera?.frameRate ??
        camera?.frame_rate ??
        0
    ) || 0;

  const resolution =
    camera?.resolution ||
    camera?.videoResolution ||
    camera?.video_resolution ||
    DEFAULT_RESOLUTION;

  return {
    id: String(
      camera?.id ??
        camera?.cameraId ??
        camera?.camera_id ??
        `camera-${index + 1}`
    ),

    name:
      camera?.name ||
      camera?.cameraName ||
      camera?.camera_name ||
      `Camera ${index + 1}`,

    location:
      camera?.location ||
      camera?.site ||
      camera?.address ||
      "Unknown location",

    status: isOnline
      ? "Online"
      : "Offline",

    isOnline,

    isStreaming,

    aiEnabled,

    fps,

    resolution,

    streamType:
      camera?.streamType ||
      camera?.stream_type ||
      camera?.protocol ||
      "RTSP",

    rtspUrl:
      camera?.rtspUrl ||
      camera?.rtsp_url ||
      "",

    lastSeen:
      camera?.lastSeen
        ? new Date(camera.lastSeen)
        : new Date(),
  };
}

/* =========================================================
   DATE FORMATTER
========================================================= */

function formatDateTime(
  date
) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

/* =========================================================
   EXPORT
========================================================= */

export default CameraMonitoring;