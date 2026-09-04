import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import SensorsRoundedIcon from "@mui/icons-material/SensorsRounded";

import dashboardService from "../services/dashboardService";

/* =========================================================
   EMPTY DASHBOARD
========================================================= */

const EMPTY_DASHBOARD = {
  cameras: [],
  streams: [],
  users: [],
  activities: [],
  alerts: [],

  ai_monitoring: {
    total_detections: 0,
    active_cameras: 0,
    people: 0,
    vehicles: 0,
    objects: 0,
  },

  stats: {
    total_cameras: 0,
    online_cameras: 0,
    offline_cameras: 0,
    active_cameras: 0,
    inactive_cameras: 0,
    camera_availability: 0,

    ai_enabled_cameras: 0,

    total_streams: 0,
    active_streams: 0,
    inactive_streams: 0,

    total_users: 0,
    active_users: 0,
    online_users: 0,

    total_user_detections: 0,

    active_alerts: 0,
    critical_alerts: 0,
    high_alerts: 0,

    total_detections: 0,
    people_detected: 0,
    vehicles_detected: 0,
    objects_detected: 0,
  },
};

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const [dashboardStore, setDashboardStore] =
    useState(EMPTY_DASHBOARD);

  const [settings, setSettings] = useState(() => {
    const defaultSettings = {
      aiDetection: true,
      notifications: true,
      securityAlerts: true,
      autoReconnect: true,
      inferenceMode: "TensorRT",
    };

    try {
      const stored =
        localStorage.getItem("visionEdgeSettings");

      if (!stored) {
        return defaultSettings;
      }

      return {
        ...defaultSettings,
        ...JSON.parse(stored),
      };
    } catch (error) {
      console.error(
        "Failed to load VisionEdge settings:",
        error
      );

      return defaultSettings;
    }
  });

  /* =======================================================
     BACKEND REFRESH
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const refreshDashboard = async () => {
      try {
        const data =
          await dashboardService.getDashboard();

        if (!mounted) {
          return;
        }

        setDashboardStore(
          data || EMPTY_DASHBOARD
        );
      } catch (error) {
        console.error(
          "Failed to refresh dashboard:",
          error
        );
      }

      try {
        const stored =
          localStorage.getItem(
            "visionEdgeSettings"
          );

        if (stored && mounted) {
          setSettings((previous) => ({
            ...previous,
            ...JSON.parse(stored),
          }));
        }
      } catch (error) {
        console.error(
          "Failed to refresh VisionEdge settings:",
          error
        );
      }
    };

    refreshDashboard();

    window.addEventListener(
      "visionedge-dashboard-update",
      refreshDashboard
    );

    window.addEventListener(
      "storage",
      refreshDashboard
    );

    const interval = setInterval(
      refreshDashboard,
      10000
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        "visionedge-dashboard-update",
        refreshDashboard
      );

      window.removeEventListener(
        "storage",
        refreshDashboard
      );

      clearInterval(interval);
    };
  }, []);

  /* =======================================================
     CAMERA DATA
  ======================================================= */

  const cameraStats = useMemo(() => {
    const cameras = Array.isArray(
      dashboardStore?.cameras
    )
      ? dashboardStore.cameras
      : [];

    const total = cameras.length;

    const live = cameras.filter((camera) => {
      if (camera?.isOnline === true) {
        return true;
      }

      if (camera?.status === true) {
        return true;
      }

      const status = String(
        camera?.status || ""
      )
        .toLowerCase()
        .trim();

      return [
        "online",
        "active",
        "running",
        "connected",
      ].includes(status);
    }).length;

    const offline = Math.max(
      total - live,
      0
    );

    return {
      total,
      live,
      offline,
    };
  }, [dashboardStore?.cameras]);

  /* =======================================================
     SECURITY DATA
  ======================================================= */

  const securityStats = useMemo(() => {
    const alerts = Array.isArray(
      dashboardStore?.alerts
    )
      ? dashboardStore.alerts
      : [];

    const activeAlerts = alerts.filter(
      (alert) => {
        return (
          alert?.resolved !== true &&
          alert?.acknowledged !== true &&
          alert?.status !== "resolved" &&
          alert?.status !== "Resolved" &&
          alert?.status !== "RESOLVED"
        );
      }
    ).length;

    const criticalAlerts = alerts.filter(
      (alert) => {
        const severity = String(
          alert?.severity || ""
        ).toLowerCase();

        return (
          alert?.resolved !== true &&
          alert?.acknowledged !== true &&
          severity === "critical"
        );
      }
    ).length;

    return {
      activeAlerts,
      criticalAlerts,
    };
  }, [dashboardStore?.alerts]);

  /* =======================================================
     USERS DATA
  ======================================================= */

  const userStats = useMemo(() => {
    const users = Array.isArray(
      dashboardStore?.users
    )
      ? dashboardStore.users
      : [];

    const total = users.length;

    const active = users.filter((user) => {
      return (
        user?.status === "Active" ||
        user?.status === "active" ||
        user?.status === "ACTIVE" ||
        user?.isActive === true
      );
    }).length;

    return {
      total,
      active,
    };
  }, [dashboardStore?.users]);

  /* =======================================================
     AI DATA
  ======================================================= */

  const aiStats = useMemo(() => {
    const enabled =
      settings?.aiDetection !== false;

    const inferenceEngine =
      settings?.inferenceMode ||
      "TensorRT";

    const detectionRate =
      enabled ? 100 : 0;

    const aiMonitoring =
      dashboardStore?.ai_monitoring ||
      {};

    const detections =
      Number(
        aiMonitoring?.total_detections
      ) ||
      Number(
        dashboardStore?.stats?.total_detections
      ) ||
      0;

    const activeCameras =
      Number(
        aiMonitoring?.active_cameras
      ) ||
      cameraStats.live;

    return {
      enabled,
      inferenceEngine,
      detectionRate,
      detections,
      activeCameras,
    };
  }, [
    settings,
    dashboardStore,
    cameraStats.live,
  ]);

  /* =======================================================
     RECENT USERS
  ======================================================= */

  const recentUsers = useMemo(() => {
    const users = Array.isArray(
      dashboardStore?.users
    )
      ? dashboardStore.users
      : [];

    return users
      .slice()
      .reverse()
      .slice(0, 5)
      .map((user) => ({
        name:
          user?.name ||
          user?.username ||
          user?.email ||
          "Unknown User",

        role:
          user?.role ||
          "Operator",

        time:
          user?.time ||
          user?.updatedAt ||
          user?.updated_at ||
          user?.createdAt ||
          user?.created_at ||
          "Recently",

        status:
          user?.status ||
          (user?.isActive
            ? "Active"
            : "Inactive"),
      }));
  }, [dashboardStore?.users]);

  /* =======================================================
     RECENT ACTIVITY
  ======================================================= */

  const recentActivity = useMemo(() => {
    const activities = Array.isArray(
      dashboardStore?.activities
    )
      ? dashboardStore.activities
      : [];

    return activities
      .slice()
      .sort((a, b) => {
        const timeA = new Date(
          a?.time ||
            a?.timestamp ||
            a?.created_at ||
            a?.createdAt ||
            0
        ).getTime();

        const timeB = new Date(
          b?.time ||
            b?.timestamp ||
            b?.created_at ||
            b?.createdAt ||
            0
        ).getTime();

        return timeB - timeA;
      })
      .slice(0, 6)
      .map((activity) => ({
        title:
          activity?.title ||
          activity?.message ||
          activity?.action ||
          "System activity",

        time: formatActivityTime(
          activity?.time ||
            activity?.timestamp ||
            activity?.created_at ||
            activity?.createdAt
        ),

        type:
          activity?.type ||
          "success",
      }));
  }, [dashboardStore?.activities]);

  /* =======================================================
     CAMERA AVAILABILITY
  ======================================================= */

  const cameraAvailability =
    cameraStats.total > 0
      ? Math.round(
          (cameraStats.live /
            cameraStats.total) *
            100
        )
      : 0;

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
        transition:
          "background-color .25s ease, color .25s ease",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "primary.main",
                color: "#fff",
                boxShadow:
                  "0 10px 28px rgba(37,99,235,.28)",
              }}
            >
              <DashboardRoundedIcon />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: {
                    xs: "1.55rem",
                    sm: "1.85rem",
                    md: "2.2rem",
                  },
                  fontWeight: 900,
                  lineHeight: 1.1,
                }}
              >
                Dashboard
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  color: "text.secondary",
                  fontSize: {
                    xs: ".8rem",
                    sm: ".9rem",
                  },
                }}
              >
                VisionEdge AI video
                intelligence and
                monitoring overview
              </Typography>
            </Box>
          </Box>
        </Box>

        <Chip
          icon={<CheckCircleRoundedIcon />}
          label="System Active"
          sx={{
            fontWeight: 800,
            color: "success.dark",
            bgcolor: "success.light",
            borderRadius: 2.5,
          }}
        />
      </Box>

      {/* =================================================
          AI 3D-STYLE CORE
      ================================================= */}

      <AICorePanel
        activeCameras={aiStats.activeCameras}
        detections={aiStats.detections}
        inferenceEngine={
          aiStats.inferenceEngine
        }
        enabled={aiStats.enabled}
      />

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <Grid
        container
        spacing={2.5}
        sx={{
          mt: 0,
          mb: 3,
        }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            icon={<VideocamRoundedIcon />}
            title="Cameras"
            value={cameraStats.total}
            subtitle={`${cameraStats.live} live • ${cameraStats.offline} offline`}
            iconColor="#2563EB"
            iconBackground="primary.light"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            icon={<SecurityRoundedIcon />}
            title="Security Alerts"
            value={securityStats.activeAlerts}
            subtitle={
              securityStats.criticalAlerts === 0
                ? "No critical alerts"
                : `${securityStats.criticalAlerts} critical`
            }
            iconColor="#DC2626"
            iconBackground="error.light"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            icon={<PeopleRoundedIcon />}
            title="Users"
            value={userStats.total}
            subtitle={`${userStats.active} active users`}
            iconColor="#7C3AED"
            iconBackground="secondary.light"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            icon={<MemoryRoundedIcon />}
            title="AI Detection"
            value={`${aiStats.detectionRate}%`}
            subtitle={
              aiStats.enabled
                ? aiStats.inferenceEngine
                : "Disabled"
            }
            iconColor="#059669"
            iconBackground="success.light"
          />
        </Grid>
      </Grid>

      {/* =================================================
          MONITORING + AI
      ================================================= */}

      <Grid
        container
        spacing={2.5}
        sx={{
          mb: 3,
        }}
      >
        <Grid
          size={{
            xs: 12,
            lg: 7,
          }}
        >
          <DashboardCard
            title="Monitoring Overview"
            subtitle="Current platform monitoring status"
            icon={<VideocamRoundedIcon />}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3,1fr)",
                },
                gap: 2,
                mb: 3,
              }}
            >
              <MonitoringItem
                label="Total Cameras"
                value={cameraStats.total}
              />

              <MonitoringItem
                label="Live Cameras"
                value={cameraStats.live}
                success
              />

              <MonitoringItem
                label="Offline Cameras"
                value={cameraStats.offline}
                warning
              />
            </Box>

            <Divider
              sx={{
                mb: 2.5,
              }}
            />

            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  mb: 1,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Camera Availability
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 900,
                    color: "primary.main",
                  }}
                >
                  {cameraAvailability}%
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={cameraAvailability}
                sx={{
                  height: 10,
                  borderRadius: 10,
                  bgcolor: "action.hover",
                  "& .MuiLinearProgress-bar":
                    {
                      borderRadius: 10,
                    },
                }}
              />
            </Box>

            <Alert
              severity="info"
              icon={<VideocamRoundedIcon />}
              sx={{
                mt: 3,
                borderRadius: 3,
              }}
            >
              Camera controls are
              available from the{" "}
              <strong>
                Camera Monitoring
              </strong>{" "}
              page.
            </Alert>
          </DashboardCard>
        </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 5,
          }}
        >
          <DashboardCard
            title="AI Monitoring"
            subtitle="Current AI inference status"
            icon={<MemoryRoundedIcon />}
          >
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: "action.hover",
                border: 1,
                borderColor: "divider",
                mb: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                }}
              >
                Inference Engine
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 0.5,
                }}
              >
                <AutoAwesomeRoundedIcon
                  sx={{
                    color: "primary.main",
                  }}
                />

                <Typography
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 900,
                  }}
                >
                  {aiStats.inferenceEngine}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: "action.hover",
                border: 1,
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  mb: 1,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Detection Performance
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 900,
                    color: aiStats.enabled
                      ? "success.main"
                      : "text.secondary",
                  }}
                >
                  {aiStats.detectionRate}%
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={
                  aiStats.detectionRate
                }
                sx={{
                  height: 10,
                  borderRadius: 10,
                  bgcolor: "action.hover",
                  "& .MuiLinearProgress-bar":
                    {
                      borderRadius: 10,
                      bgcolor:
                        aiStats.enabled
                          ? "success.main"
                          : "text.disabled",
                    },
                }}
              />

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 1,
                  color: "text.secondary",
                }}
              >
                AI inference pipeline is{" "}
                {aiStats.enabled
                  ? "active"
                  : "disabled"}
                .
              </Typography>
            </Box>
          </DashboardCard>
        </Grid>
      </Grid>

      {/* =================================================
          RECENT USERS + ACTIVITY
      ================================================= */}

      <Grid
        container
        spacing={2.5}
      >
        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <DashboardCard
            title="Recent Users"
            subtitle="Latest user sessions"
            icon={<PeopleRoundedIcon />}
          >
            {recentUsers.length === 0 ? (
              <EmptyState
                icon={<PeopleRoundedIcon />}
                title="No recent users"
                description="Users will appear here when they are added or updated."
              />
            ) : (
              <Box>
                {recentUsers.map(
                  (user, index) => (
                    <Box
                      key={`${user.name}-${index}`}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "space-between",
                          gap: 2,
                          py: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: 1.5,
                            minWidth: 0,
                          }}
                        >
                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              flexShrink: 0,
                              borderRadius:
                                "50%",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              bgcolor:
                                "primary.main",
                              color: "#fff",
                              fontWeight: 900,
                            }}
                          >
                            {getInitials(
                              user.name
                            )}
                          </Box>

                          <Box
                            sx={{
                              minWidth: 0,
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 800,
                                overflow:
                                  "hidden",
                                textOverflow:
                                  "ellipsis",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {user.name}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{
                                color:
                                  "text.secondary",
                              }}
                            >
                              {user.role}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            textAlign:
                              "right",
                            flexShrink: 0,
                          }}
                        >
                          <Chip
                            size="small"
                            label={
                              user.status
                            }
                            sx={{
                              fontWeight: 800,
                              color:
                                user.status ===
                                "Active"
                                  ? "success.dark"
                                  : "text.secondary",
                              bgcolor:
                                user.status ===
                                "Active"
                                  ? "success.light"
                                  : "action.hover",
                            }}
                          />

                          <Typography
                            variant="caption"
                            sx={{
                              display:
                                "block",
                              mt: 0.4,
                              color:
                                "text.secondary",
                            }}
                          >
                            {user.time}
                          </Typography>
                        </Box>
                      </Box>

                      {index <
                        recentUsers.length -
                          1 && <Divider />}
                    </Box>
                  )
                )}
              </Box>
            )}
          </DashboardCard>
        </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <DashboardCard
            title="Recent Activity"
            subtitle="Latest VisionEdge events"
            icon={<AccessTimeRoundedIcon />}
          >
            {recentActivity.length === 0 ? (
              <EmptyState
                icon={
                  <AccessTimeRoundedIcon />
                }
                title="No recent activity"
                description="Stream, camera, security and system events will appear here."
              />
            ) : (
              <Box>
                {recentActivity.map(
                  (
                    activity,
                    index
                  ) => (
                    <Box
                      key={`${activity.title}-${index}`}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          py: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            flexShrink: 0,
                            borderRadius: 2.5,
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            bgcolor:
                              activity.type ===
                              "success"
                                ? "success.light"
                                : "warning.light",
                            color:
                              activity.type ===
                              "success"
                                ? "success.main"
                                : "warning.main",
                          }}
                        >
                          {activity.type ===
                          "success" ? (
                            <CheckCircleRoundedIcon
                              fontSize="small"
                            />
                          ) : (
                            <WarningAmberRoundedIcon
                              fontSize="small"
                            />
                          )}
                        </Box>

                        <Box
                          sx={{
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 800,
                              lineHeight: 1.35,
                            }}
                          >
                            {activity.title}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{
                              display:
                                "block",
                              color:
                                "text.secondary",
                              mt: 0.5,
                            }}
                          >
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>

                      {index <
                        recentActivity.length -
                          1 && <Divider />}
                    </Box>
                  )
                )}
              </Box>
            )}
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
}

/* =========================================================
   AI CORE PANEL
========================================================= */

function AICorePanel({
  activeCameras,
  detections,
  inferenceEngine,
  enabled,
}) {
  return (
    <Box
      sx={{
        position: "relative",
        height: {
          xs: 320,
          sm: 350,
          md: 390,
        },
        mb: 3,
        overflow: "hidden",
        borderRadius: 5,
        background:
          "radial-gradient(circle at 50% 45%, rgba(37,99,235,.32) 0%, rgba(15,23,42,.92) 35%, #020617 75%)",
        border:
          "1px solid rgba(59,130,246,.28)",
        boxShadow:
          "0 24px 70px rgba(15,23,42,.28)",
      }}
    >
      {/* GRID */}

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.15,
          backgroundImage:
            "linear-gradient(rgba(96,165,250,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,.25) 1px, transparent 1px)",
          backgroundSize:
            "32px 32px",
          maskImage:
            "radial-gradient(circle at center, black, transparent 75%)",
        }}
      />

      {/* GLOW */}

      <Box
        sx={{
          position: "absolute",
          width: {
            xs: 180,
            md: 260,
          },
          height: {
            xs: 180,
            md: 260,
          },
          borderRadius: "50%",
          top: "50%",
          left: "50%",
          transform:
            "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(56,189,248,.22), transparent 68%)",
          filter: "blur(8px)",
        }}
      />

      {/* CORE */}

      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: {
            xs: 120,
            md: 165,
          },
          height: {
            xs: 120,
            md: 165,
          },
          transform:
            "translate(-50%, -50%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 35% 30%, #67E8F9, #2563EB 42%, #172554 72%)",
          boxShadow:
            "0 0 35px rgba(56,189,248,.8), 0 0 90px rgba(37,99,235,.45), inset 0 0 35px rgba(255,255,255,.22)",
          animation:
            "visionCorePulse 3s ease-in-out infinite",
          "@keyframes visionCorePulse": {
            "0%,100%": {
              transform:
                "translate(-50%, -50%) scale(1)",
            },
            "50%": {
              transform:
                "translate(-50%, -50%) scale(1.06)",
            },
          },
        }}
      >
        <Box
          sx={{
            width: "72%",
            height: "72%",
            borderRadius: "50%",
            border:
              "1px solid rgba(255,255,255,.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "inset 0 0 30px rgba(255,255,255,.18)",
          }}
        >
          <MemoryRoundedIcon
            sx={{
              fontSize: {
                xs: 42,
                md: 58,
              },
              color: "#E0F2FE",
              filter:
                "drop-shadow(0 0 12px rgba(125,211,252,.9))",
            }}
          />
        </Box>
      </Box>

      {/* RINGS */}

      <CoreRing
        size={190}
        duration="12s"
        borderColor="rgba(56,189,248,.65)"
      />

      <CoreRing
        size={245}
        duration="18s"
        reverse
        borderColor="rgba(96,165,250,.4)"
      />

      <CoreRing
        size={300}
        duration="25s"
        borderColor="rgba(147,197,253,.2)"
      />

      {/* PARTICLES */}

      <CoreParticle
        top="27%"
        left="35%"
        color="#22C55E"
      />

      <CoreParticle
        top="68%"
        left="63%"
        color="#38BDF8"
      />

      <CoreParticle
        top="35%"
        left="68%"
        color="#A78BFA"
      />

      <CoreParticle
        top="73%"
        left="34%"
        color="#F59E0B"
      />

      {/* TOP LABEL */}

      <Box
        sx={{
          position: "absolute",
          top: {
            xs: 16,
            md: 22,
          },
          left: {
            xs: 18,
            md: 26,
          },
          zIndex: 3,
        }}
      >
        <Typography
          sx={{
            color: "#F8FAFC",
            fontWeight: 900,
            letterSpacing: ".14em",
            fontSize: {
              xs: ".65rem",
              md: ".78rem",
            },
          }}
        >
          VISIONEDGE AI CORE
        </Typography>

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
              bgcolor: enabled
                ? "#22C55E"
                : "#64748B",
              boxShadow: enabled
                ? "0 0 14px #22C55E"
                : "none",
            }}
          />

          <Typography
            sx={{
              color: "#94A3B8",
              fontWeight: 800,
              fontSize: ".65rem",
            }}
          >
            {enabled
              ? "SYSTEM ONLINE"
              : "AI DISABLED"}
          </Typography>
        </Box>
      </Box>

      {/* ENGINE */}

      <Box
        sx={{
          position: "absolute",
          top: {
            xs: 16,
            md: 22,
          },
          right: {
            xs: 16,
            md: 26,
          },
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          gap: 0.8,
          px: 1.4,
          py: 0.8,
          borderRadius: 2,
          bgcolor:
            "rgba(15,23,42,.65)",
          border:
            "1px solid rgba(148,163,184,.18)",
          backdropFilter:
            "blur(10px)",
        }}
      >
        <SpeedRoundedIcon
          sx={{
            fontSize: 16,
            color: "#38BDF8",
          }}
        />

        <Typography
          sx={{
            color: "#E2E8F0",
            fontWeight: 800,
            fontSize: ".65rem",
          }}
        >
          {inferenceEngine}
        </Typography>
      </Box>

      {/* CENTER TITLE */}

      <Box
        sx={{
          position: "absolute",
          left: "50%",
          bottom: {
            xs: 74,
            md: 82,
          },
          transform:
            "translateX(-50%)",
          textAlign: "center",
          zIndex: 3,
          width: "100%",
          pointerEvents: "none",
        }}
      >
        <Typography
          sx={{
            color: "#F8FAFC",
            fontWeight: 900,
            letterSpacing: ".16em",
            fontSize: {
              xs: ".7rem",
              md: ".9rem",
            },
            textShadow:
              "0 0 22px rgba(56,189,248,.65)",
          }}
        >
          AI VIDEO INTELLIGENCE
        </Typography>

        <Typography
          sx={{
            color: "#64748B",
            mt: 0.5,
            fontSize: ".58rem",
            letterSpacing: ".1em",
            fontWeight: 700,
          }}
        >
          HARDWARE ACCELERATED
        </Typography>
      </Box>

      {/* METRICS */}

      <Box
        sx={{
          position: "absolute",
          bottom: {
            xs: 15,
            md: 20,
          },
          left: {
            xs: 12,
            md: 20,
          },
          right: {
            xs: 12,
            md: 20,
          },
          display: "flex",
          justifyContent: "center",
          gap: {
            xs: 0.8,
            md: 1.5,
          },
          flexWrap: "wrap",
          zIndex: 4,
        }}
      >
        <DarkMetric
          icon={<SensorsRoundedIcon />}
          label="ACTIVE CAMERAS"
          value={activeCameras}
        />

        <DarkMetric
          icon={<AutoAwesomeRoundedIcon />}
          label="DETECTIONS"
          value={detections}
        />

        <DarkMetric
          icon={<SpeedRoundedIcon />}
          label="ENGINE"
          value={inferenceEngine}
        />
      </Box>
    </Box>
  );
}

/* =========================================================
   CORE RING
========================================================= */

function CoreRing({
  size,
  duration,
  reverse = false,
  borderColor,
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        width: size,
        height: size,
        top: "50%",
        left: "50%",
        transform:
          "translate(-50%, -50%)",
        borderRadius: "50%",
        border:
          `1px solid ${borderColor}`,
        boxShadow:
          "0 0 18px rgba(56,189,248,.08)",
        animation: `coreRing ${
          duration
        } linear infinite ${
          reverse ? "reverse" : "normal"
        }`,
        "@keyframes coreRing": {
          from: {
            transform:
              "translate(-50%, -50%) rotate(0deg)",
          },
          to: {
            transform:
              "translate(-50%, -50%) rotate(360deg)",
          },
        },
      }}
    />
  );
}

/* =========================================================
   CORE PARTICLE
========================================================= */

function CoreParticle({
  top,
  left,
  color,
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        top,
        left,
        width: 7,
        height: 7,
        borderRadius: "50%",
        bgcolor: color,
        boxShadow: `0 0 15px ${color}`,
        animation:
          "particleFloat 3s ease-in-out infinite",
        "@keyframes particleFloat": {
          "0%,100%": {
            transform:
              "translateY(0)",
            opacity: 0.7,
          },
          "50%": {
            transform:
              "translateY(-10px)",
            opacity: 1,
          },
        },
      }}
    />
  );
}

/* =========================================================
   DARK METRIC
========================================================= */

function DarkMetric({
  icon,
  label,
  value,
}) {
  return (
    <Box
      sx={{
        minWidth: {
          xs: 92,
          sm: 125,
          md: 145,
        },
        px: {
          xs: 1.2,
          md: 1.8,
        },
        py: {
          xs: 0.8,
          md: 1,
        },
        borderRadius: 2.5,
        bgcolor:
          "rgba(15,23,42,.72)",
        border:
          "1px solid rgba(148,163,184,.16)",
        backdropFilter:
          "blur(12px)",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
          color: "#64748B",
          fontSize: ".52rem",
          fontWeight: 900,
          letterSpacing: ".05em",
        }}
      >
        {icon}

        <span>{label}</span>
      </Box>

      <Typography
        sx={{
          color: "#F8FAFC",
          fontSize: {
            xs: ".85rem",
            md: "1rem",
          },
          fontWeight: 900,
          mt: 0.3,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
  subtitle,
  iconColor,
  iconBackground,
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
            "0 16px 34px rgba(15,23,42,.10)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "flex-start",
          }}
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
                mt: 0.5,
                fontSize: "1.9rem",
                fontWeight: 900,
              }}
            >
              {value}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 0.4,
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
              borderRadius: 3,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              color: iconColor,
              bgcolor:
                iconBackground,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   DASHBOARD CARD
========================================================= */

function DashboardCard({
  title,
  subtitle,
  icon,
  children,
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
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2.2,
            sm: 3,
          },

          "&:last-child": {
            pb: {
              xs: 2.2,
              sm: 3,
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: 3,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
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
              sx={{
                fontWeight: 900,
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color:
                  "text.secondary",
                mt: 0.2,
              }}
            >
              {subtitle}
            </Typography>
          </Box>
        </Box>

        {children}
      </CardContent>
    </Card>
  );
}

/* =========================================================
   MONITORING ITEM
========================================================= */

function MonitoringItem({
  label,
  value,
  success = false,
  warning = false,
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor:
          "action.hover",
        border: 1,
        borderColor:
          "divider",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color:
            "text.secondary",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: "1.45rem",
          fontWeight: 900,
          color: success
            ? "success.main"
            : warning
              ? "warning.main"
              : "text.primary",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <Box
      sx={{
        py: 5,
        textAlign: "center",
        color:
          "text.secondary",
      }}
    >
      <Box
        sx={{
          width: 54,
          height: 54,
          mx: "auto",
          mb: 1.5,
          borderRadius: 3,
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          bgcolor:
            "action.hover",
          color:
            "text.disabled",
        }}
      >
        {icon}
      </Box>

      <Typography
        fontWeight={800}
        sx={{
          color:
            "text.primary",
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mt: 0.5,
          color:
            "text.secondary",
          maxWidth: 360,
          mx: "auto",
        }}
      >
        {description}
      </Typography>
    </Box>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {
  if (!name) {
    return "VE";
  }

  return String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/* =========================================================
   ACTIVITY TIME
========================================================= */

function formatActivityTime(timestamp) {
  if (!timestamp) {
    return "Recently";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return String(timestamp);
  }

  const diff = Math.max(
    0,
    Date.now() - date.getTime()
  );

  const seconds = Math.floor(
    diff / 1000
  );

  if (seconds < 10) {
    return "Just now";
  }

  if (seconds < 60) {
    return `${seconds} sec ago`;
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  return `${days} day${
    days > 1 ? "s" : ""
  } ago`;
}

/* =========================================================
   EXPORT
========================================================= */

export default Dashboard;