import React, { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  InputBase,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

const activities = [
  {
    id: 1,
    title: "Unauthorized access detected",
    description:
      "Suspicious activity detected near the warehouse entrance.",
    level: "Error",
    type: "Security",
    time: "Just now",
    icon: ErrorRoundedIcon,
  },

  {
    id: 2,
    title: "Camera connection warning",
    description:
      "Camera connection quality has temporarily degraded.",
    level: "Warning",
    type: "Camera",
    time: "2 min ago",
    icon: WarningAmberRoundedIcon,
  },

  {
    id: 3,
    title: "Real-time monitoring started",
    description:
      "Real-time monitoring session was started successfully.",
    level: "Information",
    type: "Monitoring",
    time: "5 min ago",
    icon: InfoRoundedIcon,
  },

  {
    id: 4,
    title: "Camera stream connected",
    description:
      "CAM-02 has successfully connected to the VisionEdge pipeline.",
    level: "Information",
    type: "Camera",
    time: "8 min ago",
    icon: CheckCircleRoundedIcon,
  },

  {
    id: 5,
    title: "Multiple person detection",
    description:
      "Multiple people detected in the restricted monitoring zone.",
    level: "Warning",
    type: "Security",
    time: "12 min ago",
    icon: WarningAmberRoundedIcon,
  },

  {
    id: 6,
    title: "System health check completed",
    description:
      "VisionEdge system health check completed successfully.",
    level: "Information",
    type: "System",
    time: "15 min ago",
    icon: CheckCircleRoundedIcon,
  },
];

const levelStyles = {
  Error: {
    color: "#EF4444",
    background: "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.30)",
  },

  Warning: {
    color: "#F59E0B",
    background: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.30)",
  },

  Information: {
    color: "#22C55E",
    background: "rgba(34,197,94,0.10)",
    border: "rgba(34,197,94,0.30)",
  },
};

function ActivityLogs() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All Levels");
  const [type, setType] = useState("All Types");
  const [refreshing, setRefreshing] = useState(false);

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activities.filter((activity) => {
      const matchesSearch =
        !query ||
        activity.title.toLowerCase().includes(query) ||
        activity.description.toLowerCase().includes(query) ||
        activity.type.toLowerCase().includes(query);

      const matchesLevel =
        level === "All Levels" ||
        activity.level === level;

      const matchesType =
        type === "All Types" ||
        activity.type === type;

      return matchesSearch && matchesLevel && matchesType;
    });
  }, [search, level, type]);

  const errorCount = activities.filter(
    (item) => item.level === "Error"
  ).length;

  const warningCount = activities.filter(
    (item) => item.level === "Warning"
  ).length;

  const informationCount = activities.filter(
    (item) => item.level === "Information"
  ).length;

  const handleRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        px: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        py: {
          xs: 3,
          md: 4,
        },
        bgcolor: "background.default",
        color: "text.primary",
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
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          gap: 2,
          mb: 4,
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(37,99,235,0.10)",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <HistoryRoundedIcon />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: "1.8rem",
                  sm: "2.2rem",
                  md: "2.5rem",
                },
                lineHeight: 1.1,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Activity & Logs
            </Typography>

            <Typography
              sx={{
                mt: 0.7,
                fontSize: "1rem",
                color: "text.secondary",
              }}
            >
              Monitor system activity, events and operational logs
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            <RefreshRoundedIcon
              sx={{
                animation: refreshing
                  ? "spin 0.7s linear infinite"
                  : "none",
                "@keyframes spin": {
                  from: {
                    transform: "rotate(0deg)",
                  },
                  to: {
                    transform: "rotate(360deg)",
                  },
                },
              }}
            />
          }
          onClick={handleRefresh}
          sx={{
            minWidth: 130,
            height: 46,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
            color: "text.primary",
            borderColor: "divider",

            "&:hover": {
              borderColor: "primary.main",
              color: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2.5,
          mb: 4,
        }}
      >
        <SummaryCard
          icon={<HistoryRoundedIcon />}
          title="Total Events"
          value={activities.length}
          subtitle="Recent system events"
          iconColor="#2563EB"
          iconBackground="rgba(37,99,235,0.10)"
        />

        <SummaryCard
          icon={<ErrorRoundedIcon />}
          title="Errors"
          value={errorCount}
          subtitle="Events requiring attention"
          iconColor="#EF4444"
          iconBackground="rgba(239,68,68,0.10)"
        />

        <SummaryCard
          icon={<WarningAmberRoundedIcon />}
          title="Warnings"
          value={warningCount}
          subtitle="System warnings"
          iconColor="#F59E0B"
          iconBackground="rgba(245,158,11,0.10)"
        />

        <SummaryCard
          icon={<CheckCircleRoundedIcon />}
          title="Information"
          value={informationCount}
          subtitle="Normal system activity"
          iconColor="#22C55E"
          iconBackground="rgba(34,197,94,0.10)"
        />
      </Box>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <Card
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 4,
          bgcolor: "background.paper",
          p: {
            xs: 2,
            md: 3,
          },
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2.5,
          }}
        >
          <FilterListRoundedIcon
            sx={{
              color: "text.secondary",
            }}
          />

          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Activity Filters
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.5fr 1fr 1fr auto",
            },
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* SEARCH */}

          <InputBase
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search activity"
            sx={{
              height: 48,
              px: 2,
              borderRadius: 3,
              border: 1,
              borderColor: "divider",
              bgcolor: "background.default",
              color: "text.primary",

              "& input": {
                color: "text.primary",
              },

              "& input::placeholder": {
                color: "text.secondary",
                opacity: 1,
              },

              "&:focus-within": {
                borderColor: "primary.main",
              },
            }}
          />

          {/* LEVEL */}

          <FormControl fullWidth size="small">
            <Select
              value={level}
              onChange={(event) =>
                setLevel(event.target.value)
              }
              sx={{
                height: 48,
                borderRadius: 3,
                color: "text.primary",

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "divider",
                },

                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "text.secondary",
                },

                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              }}
            >
              <MenuItem value="All Levels">
                All Levels
              </MenuItem>
              <MenuItem value="Error">Errors</MenuItem>
              <MenuItem value="Warning">Warnings</MenuItem>
              <MenuItem value="Information">
                Information
              </MenuItem>
            </Select>
          </FormControl>

          {/* TYPE */}

          <FormControl fullWidth size="small">
            <Select
              value={type}
              onChange={(event) =>
                setType(event.target.value)
              }
              sx={{
                height: 48,
                borderRadius: 3,
                color: "text.primary",

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "divider",
                },

                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "text.secondary",
                },

                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              }}
            >
              <MenuItem value="All Types">
                All Types
              </MenuItem>
              <MenuItem value="Security">
                Security
              </MenuItem>
              <MenuItem value="Camera">
                Camera
              </MenuItem>
              <MenuItem value="Monitoring">
                Monitoring
              </MenuItem>
              <MenuItem value="System">
                System
              </MenuItem>
            </Select>
          </FormControl>

          <Typography
            sx={{
              fontWeight: 800,
              color: "text.secondary",
              textAlign: {
                xs: "left",
                md: "right",
              },
              whiteSpace: "nowrap",
            }}
          >
            {filteredActivities.length} events
          </Typography>
        </Box>
      </Card>

      {/* =====================================================
          RECENT ACTIVITY
      ===================================================== */}

      <Card
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        {/* SECTION HEADER */}

        <Box
          sx={{
            px: {
              xs: 2.5,
              md: 3.5,
            },
            py: 3,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography
            sx={{
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Recent Activity
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: "0.9rem",
              color: "text.secondary",
            }}
          >
            Latest events recorded by VisionEdge
          </Typography>
        </Box>

        {/* EVENTS */}

        {filteredActivities.length === 0 ? (
          <Box
            sx={{
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 1.5,
              p: 4,
            }}
          >
            <InfoRoundedIcon
              sx={{
                fontSize: 44,
                color: "text.secondary",
              }}
            />

            <Typography
              sx={{
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              No activity found
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.9rem",
              }}
            >
              Try changing the filters.
            </Typography>
          </Box>
        ) : (
          <Stack
            spacing={0}
            divider={
              <Box
                sx={{
                  height: 1,
                  bgcolor: "divider",
                }}
              />
            }
          >
            {filteredActivities.map((activity) => {
              const ActivityIcon = activity.icon;
              const style =
                levelStyles[activity.level];

              return (
                <Box
                  key={activity.id}
                  sx={{
                    px: {
                      xs: 2.5,
                      md: 3.5,
                    },
                    py: {
                      xs: 2.5,
                      md: 3,
                    },

                    display: "flex",
                    gap: 2.5,

                    transition:
                      "background-color 0.2s ease",

                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  {/* ICON */}

                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      minWidth: 42,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: style.color,
                      backgroundColor: style.background,
                      mt: 0.3,
                    }}
                  >
                    <ActivityIcon fontSize="small" />
                  </Box>

                  {/* CONTENT */}

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "1rem",
                          fontWeight: 800,
                          color: "text.primary",
                        }}
                      >
                        {activity.title}
                      </Typography>

                      <Chip
                        label={activity.level}
                        size="small"
                        sx={{
                          height: 26,
                          fontWeight: 800,
                          color: style.color,
                          backgroundColor:
                            style.background,
                          border: 1,
                          borderColor: style.border,

                          "& .MuiChip-label": {
                            px: 1,
                          },
                        }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        mt: 0.8,
                        fontSize: "0.95rem",
                        lineHeight: 1.5,
                        color: "text.secondary",
                      }}
                    >
                      {activity.description}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mt: 1.2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <AccessTimeRoundedIcon
                          sx={{
                            fontSize: 16,
                            color: "text.secondary",
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            color: "text.secondary",
                          }}
                        >
                          {activity.time}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          color: "text.secondary",
                        }}
                      >
                        {activity.type}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Card>
    </Box>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
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
        border: 1,
        borderColor: "divider",
        borderRadius: 4,
        bgcolor: "background.paper",
        p: 2.5,
        minHeight: 145,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 46,
            height: 46,
            minWidth: 46,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
            backgroundColor: iconBackground,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "text.secondary",
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 0.2,
              fontSize: "1.9rem",
              lineHeight: 1.1,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>

      <Typography
        sx={{
          mt: 2,
          fontSize: "0.8rem",
          color: "text.secondary",
        }}
      >
        {subtitle}
      </Typography>
    </Card>
  );
}

export default ActivityLogs;