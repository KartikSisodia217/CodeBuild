import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
} from "@mui/material";

import VideocamIcon from "@mui/icons-material/Videocam";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

function CameraPerformance() {
  const cameras = [
    {
      id: "CAM-01",
      location: "Main Entrance",
      fps: 30,
      uptime: 98,
      status: "Online",
    },
    {
      id: "CAM-02",
      location: "Parking Area",
      fps: 30,
      uptime: 96,
      status: "Online",
    },
    {
      id: "CAM-03",
      location: "Warehouse",
      fps: 0,
      uptime: 42,
      status: "Offline",
    },
    {
      id: "CAM-04",
      location: "Server Room",
      fps: 25,
      uptime: 94,
      status: "Online",
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow:
          "0 8px 24px rgba(15,23,42,0.06)",
      }}
    >
      <CardContent
        sx={{
          p: 3,
          "&:last-child": {
            pb: 3,
          },
        }}
      >
        {/* Header */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ color: "#0F172A" }}
            >
              Camera Performance
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: "#64748B",
              }}
            >
              Live camera performance and uptime
            </Typography>
          </Box>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#EFF6FF",
              color: "#2563EB",
            }}
          >
            <VideocamIcon />
          </Box>
        </Box>

        {/* Cameras */}

        {cameras.map((camera, index) => {
          const online =
            camera.status === "Online";

          return (
            <Box
              key={camera.id}
              sx={{
                py: 1.7,
                borderBottom:
                  index !== cameras.length - 1
                    ? "1px solid #E2E8F0"
                    : "none",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: online
                      ? "#ECFDF5"
                      : "#FEF2F2",
                    color: online
                      ? "#10B981"
                      : "#EF4444",
                  }}
                >
                  {online ? (
                    <CheckCircleIcon
                      sx={{ fontSize: 19 }}
                    />
                  ) : (
                    <ErrorIcon
                      sx={{ fontSize: 19 }}
                    />
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    fontWeight={800}
                    fontSize="0.88rem"
                    sx={{ color: "#0F172A" }}
                  >
                    {camera.id}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ color: "#64748B" }}
                  >
                    {camera.location}
                  </Typography>
                </Box>

                <Chip
                  label={camera.status}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    color: online
                      ? "#047857"
                      : "#DC2626",
                    backgroundColor: online
                      ? "#ECFDF5"
                      : "#FEF2F2",
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748B" }}
                    >
                      Uptime
                    </Typography>

                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{ color: "#334155" }}
                    >
                      {camera.uptime}%
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={camera.uptime}
                    sx={{
                      height: 6,
                      borderRadius: 5,
                      backgroundColor: "#E2E8F0",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 5,
                        backgroundColor:
                          online
                            ? "#10B981"
                            : "#EF4444",
                      },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    minWidth: 55,
                    textAlign: "right",
                  }}
                >
                  <Typography
                    fontWeight={800}
                    fontSize="0.9rem"
                    sx={{ color: "#2563EB" }}
                  >
                    {camera.fps}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ color: "#94A3B8" }}
                  >
                    FPS
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default CameraPerformance;