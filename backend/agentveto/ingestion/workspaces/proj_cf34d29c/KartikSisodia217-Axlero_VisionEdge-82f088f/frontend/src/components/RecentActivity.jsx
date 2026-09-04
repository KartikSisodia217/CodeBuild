import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from "@mui/material";

import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const activities = [
  {
    id: 1,
    type: "stream_started",
    title: "Stream Started",
    description: "Camera stream #1 was started successfully.",
    time: "Just now",
    icon: <PlayCircleRoundedIcon />,
    color: "#16A34A",
    background: "#ECFDF5",
    status: "Success",
  },
  {
    id: 2,
    type: "camera",
    title: "Camera Connected",
    description: "Main camera connection is active.",
    time: "5 min ago",
    icon: <VideocamRoundedIcon />,
    color: "#2563EB",
    background: "#EFF6FF",
    status: "Online",
  },
  {
    id: 3,
    type: "stream_stopped",
    title: "Stream Stopped",
    description: "Camera stream #2 was stopped.",
    time: "18 min ago",
    icon: <StopCircleRoundedIcon />,
    color: "#DC2626",
    background: "#FEF2F2",
    status: "Stopped",
  },
  {
    id: 4,
    type: "warning",
    title: "System Warning",
    description: "Camera stream response time increased.",
    time: "32 min ago",
    icon: <WarningAmberRoundedIcon />,
    color: "#D97706",
    background: "#FFFBEB",
    status: "Warning",
  },
  {
    id: 5,
    type: "system",
    title: "System Check",
    description: "VisionEdge system health check completed.",
    time: "1 hour ago",
    icon: <CheckCircleRoundedIcon />,
    color: "#7C3AED",
    background: "#F5F3FF",
    status: "Healthy",
  },
];

function RecentActivity() {
  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        borderRadius: 4,
        border: "1px solid #E2E8F0",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
          "&:last-child": {
            pb: {
              xs: 2,
              md: 3,
            },
          },
        }}
      >
        {/* HEADER */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: "#0F172A",
                fontWeight: 800,
              }}
            >
              Recent Activity
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: "#64748B",
                fontSize: "0.85rem",
              }}
            >
              Latest system and stream activities
            </Typography>
          </Box>

          <Chip
            label={`${activities.length} Events`}
            size="small"
            sx={{
              flexShrink: 0,
              bgcolor: "#EFF6FF",
              color: "#2563EB",
              fontWeight: 800,
            }}
          />
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* ACTIVITY LIST */}

        <Box>
          {activities.map((activity, index) => (
            <Box key={activity.id}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  py: 2,

                  transition: "all 0.2s ease",

                  borderRadius: 3,

                  "&:hover": {
                    bgcolor: "#F8FAFC",
                    px: 1,
                  },
                }}
              >
                {/* ICON */}

                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    minWidth: 44,
                    borderRadius: 3,

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    bgcolor: activity.background,
                    color: activity.color,

                    "& svg": {
                      fontSize: 23,
                    },
                  }}
                >
                  {activity.icon}
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
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#0F172A",
                        fontSize: "0.92rem",
                        fontWeight: 800,
                      }}
                    >
                      {activity.title}
                    </Typography>

                    <Typography
                      sx={{
                        color: "#94A3B8",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {activity.time}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      mt: 0.5,
                      color: "#64748B",
                      fontSize: "0.82rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {activity.description}
                  </Typography>

                  <Chip
                    label={activity.status}
                    size="small"
                    sx={{
                      mt: 1,

                      height: 24,

                      bgcolor: activity.background,
                      color: activity.color,

                      fontSize: "0.68rem",
                      fontWeight: 800,

                      "& .MuiChip-label": {
                        px: 1,
                      },
                    }}
                  />
                </Box>
              </Box>

              {index !== activities.length - 1 && (
                <Divider />
              )}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default RecentActivity;