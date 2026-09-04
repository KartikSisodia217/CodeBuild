import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
} from "@mui/material";

import SensorsIcon from "@mui/icons-material/Sensors";
import CircleIcon from "@mui/icons-material/Circle";
import SpeedIcon from "@mui/icons-material/Speed";
import MemoryIcon from "@mui/icons-material/Memory";
import VideocamIcon from "@mui/icons-material/Videocam";

function RealTimeMonitoring() {
  const streams = [
    {
      id: "CAM-01",
      location: "Main Entrance",
      fps: 30,
      latency: 24,
      detections: 42,
      status: "Live",
    },
    {
      id: "CAM-02",
      location: "Parking Area",
      fps: 30,
      latency: 31,
      detections: 36,
      status: "Live",
    },
    {
      id: "CAM-04",
      location: "Server Room",
      fps: 25,
      latency: 28,
      detections: 29,
      status: "Live",
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ECFDF5",
                color: "#059669",
              }}
            >
              <SensorsIcon />
            </Box>

            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  color: "#0F172A",
                }}
              >
                Real-Time Monitoring
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.4,
                  color: "#64748B",
                }}
              >
                Live AI inference and stream status
              </Typography>
            </Box>
          </Box>

          <Chip
            icon={
              <CircleIcon
                sx={{
                  fontSize:
                    "10px !important",
                  color:
                    "#10B981 !important",
                }}
              />
            }
            label="SYSTEM LIVE"
            size="small"
            sx={{
              fontWeight: 800,
              color: "#047857",
              backgroundColor: "#ECFDF5",
            }}
          />
        </Box>

        {/* System Metrics */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          <Metric
            icon={<VideocamIcon />}
            title="Active Streams"
            value="3"
            subtitle="of 4 cameras"
            color="#2563EB"
          />

          <Metric
            icon={<SpeedIcon />}
            title="Avg FPS"
            value="28.3"
            subtitle="frames / sec"
            color="#10B981"
          />

          <Metric
            icon={<MemoryIcon />}
            title="GPU Load"
            value="91.8%"
            subtitle="TensorRT inference"
            color="#F59E0B"
          />
        </Box>

        {/* Stream Header */}

        <Typography
          fontWeight={800}
          fontSize="0.9rem"
          sx={{
            color: "#334155",
            mb: 1,
          }}
        >
          Active Video Streams
        </Typography>

        {/* Streams */}

        {streams.map((stream, index) => (
          <Box
            key={stream.id}
            sx={{
              py: 2,
              borderBottom:
                index !== streams.length - 1
                  ? "1px solid #E2E8F0"
                  : "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#EFF6FF",
                  color: "#2563EB",
                }}
              >
                <VideocamIcon
                  sx={{ fontSize: 20 }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  fontWeight={800}
                  fontSize="0.88rem"
                  sx={{
                    color: "#0F172A",
                  }}
                >
                  {stream.id}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748B",
                  }}
                >
                  {stream.location}
                </Typography>
              </Box>

              <Chip
                icon={
                  <CircleIcon
                    sx={{
                      fontSize:
                        "8px !important",
                      color:
                        "#10B981 !important",
                    }}
                  />
                }
                label={stream.status}
                size="small"
                sx={{
                  fontWeight: 700,
                  color: "#047857",
                  backgroundColor: "#ECFDF5",
                }}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr 1fr",
                },
                gap: 2,
              }}
            >
              <StreamMetric
                label="Frame Rate"
                value={`${stream.fps} FPS`}
                progress={(stream.fps / 30) * 100}
              />

              <StreamMetric
                label="Latency"
                value={`${stream.latency} ms`}
                progress={Math.min(
                  (stream.latency / 50) * 100,
                  100
                )}
              />

              <StreamMetric
                label="AI Detections"
                value={stream.detections}
                progress={Math.min(
                  (stream.detections / 50) * 100,
                  100
                )}
              />
            </Box>
          </Box>
        ))}

        {/* Footer */}

        <Box
          sx={{
            mt: 2.5,
            p: 2,
            borderRadius: 3,
            background:
              "linear-gradient(135deg,#EFF6FF,#F8FAFC)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                color: "#64748B",
              }}
            >
              Inference Engine
            </Typography>

            <Typography
              fontWeight={800}
              sx={{
                color: "#0F172A",
              }}
            >
              NVIDIA TensorRT
            </Typography>
          </Box>

          <Chip
            label="Optimized"
            size="small"
            sx={{
              fontWeight: 800,
              color: "#047857",
              backgroundColor: "#ECFDF5",
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

function Metric({
  icon,
  title,
  value,
  subtitle,
  color,
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        backgroundColor: "#F8FAFC",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <Box
          sx={{
            color,
            display: "flex",
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color: "#64748B",
          }}
        >
          {title}
        </Typography>
      </Box>

      <Typography
        variant="h5"
        fontWeight={800}
        sx={{
          color: "#0F172A",
        }}
      >
        {value}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          color: "#94A3B8",
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}

function StreamMetric({
  label,
  value,
  progress,
}) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 0.6,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#64748B",
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="caption"
          fontWeight={800}
          sx={{
            color: "#334155",
          }}
        >
          {value}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 5,
          backgroundColor: "#E2E8F0",
          "& .MuiLinearProgress-bar": {
            borderRadius: 5,
            backgroundColor: "#2563EB",
          },
        }}
      />
    </Box>
  );
}

export default RealTimeMonitoring;