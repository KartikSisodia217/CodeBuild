import React, { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

const initialAlerts = [
  {
    id: 1,
    title: "Unauthorized Access Detected",
    camera: "Warehouse Camera",
    description:
      "Suspicious activity detected near the warehouse entrance.",
    severity: "Critical",
    time: "Just now",
  },
  {
    id: 2,
    title: "Multiple Person Detection",
    camera: "Main Entrance",
    description:
      "Multiple people detected in a restricted monitoring zone.",
    severity: "High",
    time: "2 min ago",
  },
  {
    id: 3,
    title: "Vehicle Entered Restricted Area",
    camera: "Parking Area",
    description:
      "Vehicle movement detected in a restricted parking zone.",
    severity: "Medium",
    time: "8 min ago",
  },
  {
    id: 4,
    title: "Camera Connection Warning",
    camera: "Lobby Camera",
    description:
      "Camera connection quality has temporarily degraded.",
    severity: "Low",
    time: "15 min ago",
  },
];

function SecurityAlerts() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [search, setSearch] = useState("");

  const filteredAlerts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return alerts;
    }

    return alerts.filter((alert) => {
      return (
        alert.title.toLowerCase().includes(query) ||
        alert.camera.toLowerCase().includes(query) ||
        alert.description.toLowerCase().includes(query) ||
        alert.severity.toLowerCase().includes(query)
      );
    });
  }, [alerts, search]);

  const criticalCount = alerts.filter(
    (alert) => alert.severity === "Critical"
  ).length;

  const highCount = alerts.filter(
    (alert) => alert.severity === "High"
  ).length;

  const activeCount = alerts.length;

  const acknowledgeAlert = (id) => {
    setAlerts((current) =>
      current.filter((alert) => alert.id !== id)
    );
  };

  const refreshAlerts = () => {
    setAlerts((current) => [...current]);
  };

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case "Critical":
        return {
          color: "#EF4444",
          background: "rgba(239, 68, 68, 0.10)",
          border: "rgba(239, 68, 68, 0.35)",
          icon: <ErrorRoundedIcon />,
        };

      case "High":
        return {
          color: "#F97316",
          background: "rgba(249, 115, 22, 0.10)",
          border: "rgba(249, 115, 22, 0.35)",
          icon: <WarningRoundedIcon />,
        };

      case "Medium":
        return {
          color: "#F59E0B",
          background: "rgba(245, 158, 11, 0.10)",
          border: "rgba(245, 158, 11, 0.35)",
          icon: <WarningRoundedIcon />,
        };

      default:
        return {
          color: "#10B981",
          background: "rgba(16, 185, 129, 0.10)",
          border: "rgba(16, 185, 129, 0.35)",
          icon: <CheckCircleRoundedIcon />,
        };
    }
  };

  const StatCard = ({
    icon,
    title,
    value,
    subtitle,
    iconColor,
    iconBackground,
  }) => {
    return (
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minWidth: 0,
          p: 2.5,
          borderRadius: 4,
          border: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          color: "text.primary",
          transition:
            "background-color 0.25s ease, border-color 0.25s ease",
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="flex-start"
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: iconColor,
              backgroundColor: iconBackground,
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "text.secondary",
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 0.3,
                fontSize: "1.8rem",
                lineHeight: 1.1,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              {value}
            </Typography>
          </Box>
        </Stack>

        <Typography
          sx={{
            mt: 2,
            fontSize: "0.78rem",
            color: "text.secondary",
          }}
        >
          {subtitle}
        </Typography>
      </Paper>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        width: "100%",
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        backgroundColor: "background.default",
        color: "text.primary",
        transition:
          "background-color 0.25s ease, color 0.25s ease",
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          justifyContent: "space-between",
          gap: 2,
          mb: 4,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: "1.8rem",
                sm: "2.2rem",
                md: "2.5rem",
              },
              lineHeight: 1.15,
              fontWeight: 800,
              color: "text.primary",
              letterSpacing: "-0.02em",
            }}
          >
            Security Alerts
          </Typography>

          <Typography
            sx={{
              mt: 0.8,
              fontSize: "0.98rem",
              color: "text.secondary",
            }}
          >
            Monitor and respond to security events detected by
            VisionEdge.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<NotificationsActiveRoundedIcon />}
          sx={{
            minHeight: 44,
            px: 2,
            borderRadius: 3,
            fontWeight: 700,
            color:
              activeCount > 0
                ? "#EF4444"
                : "text.secondary",
            borderColor:
              activeCount > 0
                ? "rgba(239, 68, 68, 0.25)"
                : "divider",
            backgroundColor:
              activeCount > 0
                ? "rgba(239, 68, 68, 0.06)"
                : "transparent",
            "&:hover": {
              borderColor:
                activeCount > 0
                  ? "#EF4444"
                  : "text.secondary",
              backgroundColor:
                activeCount > 0
                  ? "rgba(239, 68, 68, 0.10)"
                  : "action.hover",
            },
          }}
        >
          {activeCount} Active Alerts
        </Button>
      </Box>

      {/* =====================================================
          STAT CARDS
      ====================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard
          icon={<ErrorRoundedIcon />}
          title="Critical Alerts"
          value={criticalCount}
          subtitle="Immediate attention required"
          iconColor="#EF4444"
          iconBackground="rgba(239, 68, 68, 0.10)"
        />

        <StatCard
          icon={<WarningRoundedIcon />}
          title="High Priority"
          value={highCount}
          subtitle="Requires investigation"
          iconColor="#F97316"
          iconBackground="rgba(249, 115, 22, 0.10)"
        />

        <StatCard
          icon={<NotificationsActiveRoundedIcon />}
          title="Active Alerts"
          value={activeCount}
          subtitle="Currently unresolved"
          iconColor="#2563EB"
          iconBackground="rgba(37, 99, 235, 0.10)"
        />
      </Box>

      {/* =====================================================
          SEARCH / FILTER BAR
      ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          borderRadius: 4,
          border: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          transition:
            "background-color 0.25s ease, border-color 0.25s ease",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          alignItems={{
            xs: "stretch",
            sm: "center",
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search security alerts..."
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
                color: "text.primary",
                backgroundColor: "background.default",

                "& fieldset": {
                  borderColor: "divider",
                },

                "&:hover fieldset": {
                  borderColor: "text.secondary",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },

              "& input::placeholder": {
                color: "text.secondary",
                opacity: 1,
              },
            }}
          />

          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={refreshAlerts}
            sx={{
              minWidth: 120,
              minHeight: 40,
              borderRadius: 3,
              fontWeight: 700,
              color: "text.primary",
              borderColor: "divider",
              "&:hover": {
                borderColor: "text.secondary",
                backgroundColor: "action.hover",
              },
            }}
          >
            Refresh
          </Button>
        </Stack>
      </Paper>

      {/* =====================================================
          SECURITY EVENTS
      ====================================================== */}

      <Box>
        <Typography
          component="h2"
          sx={{
            mb: 2,
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Live Security Events
        </Typography>

        {filteredAlerts.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 4,
              border: 1,
              borderColor: "divider",
              backgroundColor: "background.paper",
            }}
          >
            <CheckCircleRoundedIcon
              sx={{
                fontSize: 48,
                color: "#10B981",
                mb: 1,
              }}
            />

            <Typography
              sx={{
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              No security alerts found
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: "text.secondary",
              }}
            >
              Try changing your search.
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "repeat(2, 1fr)",
              },
              gap: 2,
            }}
          >
            {filteredAlerts.map((alert) => {
              const severity =
                getSeverityConfig(alert.severity);

              return (
                <Paper
                  key={alert.id}
                  elevation={0}
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 4,
                    border: 1,
                    borderColor: severity.border,
                    backgroundColor: "background.paper",
                    color: "text.primary",
                    transition:
                      "background-color 0.25s ease, border-color 0.25s ease",
                  }}
                >
                  {/* Severity indicator */}

                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      backgroundColor: severity.color,
                    }}
                  />

                  <Box
                    sx={{
                      p: {
                        xs: 2,
                        sm: 2.5,
                      },
                    }}
                  >
                    {/* TOP */}

                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: severity.color,
                          backgroundColor:
                            severity.background,
                        }}
                      >
                        {severity.icon}
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Typography
                            sx={{
                              fontSize: "1rem",
                              fontWeight: 800,
                              color: "text.primary",
                            }}
                          >
                            {alert.title}
                          </Typography>

                          <Chip
                            label={alert.severity}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              color: severity.color,
                              backgroundColor:
                                severity.background,
                              border: 1,
                              borderColor:
                                severity.border,
                            }}
                          />
                        </Stack>

                        <Typography
                          sx={{
                            mt: 0.4,
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            color: "text.secondary",
                          }}
                        >
                          {alert.camera}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* DESCRIPTION */}

                    <Typography
                      sx={{
                        mt: 2,
                        fontSize: "0.9rem",
                        lineHeight: 1.6,
                        color: "text.secondary",
                      }}
                    >
                      {alert.description}
                    </Typography>

                    <Divider
                      sx={{
                        my: 2,
                        borderColor: "divider",
                      }}
                    />

                    {/* BOTTOM */}

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      alignItems={{
                        xs: "stretch",
                        sm: "center",
                      }}
                      justifyContent="space-between"
                      spacing={1.5}
                    >
                      <Stack
                        direction="row"
                        spacing={0.7}
                        alignItems="center"
                      >
                        <AccessTimeRoundedIcon
                          sx={{
                            fontSize: 17,
                            color: "text.secondary",
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "text.secondary",
                          }}
                        >
                          {alert.time}
                        </Typography>
                      </Stack>

                      <Button
                        variant="contained"
                        onClick={() =>
                          acknowledgeAlert(alert.id)
                        }
                        sx={{
                          minHeight: 40,
                          px: 2,
                          borderRadius: 2.5,
                          fontWeight: 800,
                          backgroundColor: severity.color,
                          color: "#fff",

                          "&:hover": {
                            backgroundColor:
                              severity.color,
                            filter: "brightness(0.92)",
                          },
                        }}
                      >
                        Acknowledge
                      </Button>
                    </Stack>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default SecurityAlerts;