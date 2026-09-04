import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
} from "@mui/material";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";

import { dashboardService } from "../services/dashboardService";

function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await dashboardService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error("Analytics loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={4}>
        <Typography variant="h5" fontWeight={700}>
          Loading Analytics...
        </Typography>
      </Box>
    );
  }

  const weeklyData = [
    { day: "Mon", detections: 120 },
    { day: "Tue", detections: 180 },
    { day: "Wed", detections: 160 },
    { day: "Thu", detections: 220 },
    { day: "Fri", detections: 200 },
    { day: "Sat", detections: 250 },
    { day: "Sun", detections: 300 },
  ];

  const objectData = [
    { object: "Person", count: 540 },
    { object: "Vehicle", count: 390 },
    { object: "Car", count: 210 },
    { object: "Bike", count: 95 },
    { object: "Other", count: 52 },
  ];

  const totalDetections = weeklyData.reduce(
    (sum, item) => sum + item.detections,
    0
  );

  const averageDetections = Math.round(
    totalDetections / weeklyData.length
  );

  const cameras = dashboard?.cameras || [];

  const onlineCameras = cameras.filter(
    (camera) => camera.status === "Online"
  ).length;

  const inferenceSpeed =
    dashboard?.kpis?.find(
      (item) => item.title === "Inference Speed"
    )?.value || 18;

  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#F8FAFC",
      }}
    >
      {/* HEADER */}

      <Box mb={4}>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            color: "#0F172A",
            mb: 1,
          }}
        >
          Analytics
        </Typography>

        <Typography color="text.secondary">
          AI-powered video analytics and detection insights
        </Typography>
      </Box>

      {/* KPI CARDS */}

      <Grid
        container
        spacing={3}
        sx={{ mb: 4 }}
      >
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <AnalyticsStat
            title="Weekly Detections"
            value={totalDetections}
            subtitle="Total detected objects"
            icon={<AnalyticsRoundedIcon />}
            color="#2563EB"
            background="#EFF6FF"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <AnalyticsStat
            title="Daily Average"
            value={averageDetections}
            subtitle="Average detections/day"
            icon={<TrendingUpRoundedIcon />}
            color="#10B981"
            background="#ECFDF5"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <AnalyticsStat
            title="Inference Speed"
            value={`${inferenceSpeed} FPS`}
            subtitle="AI processing speed"
            icon={<SpeedRoundedIcon />}
            color="#7C3AED"
            background="#F5F3FF"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <AnalyticsStat
            title="Active Cameras"
            value={onlineCameras}
            subtitle="Currently online"
            icon={<VideocamRoundedIcon />}
            color="#F59E0B"
            background="#FFFBEB"
          />
        </Grid>
      </Grid>

      {/* CHARTS */}

      <Grid
        container
        spacing={3}
        sx={{ mb: 3 }}
      >
        {/* WEEKLY DETECTION TREND */}

        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid #E2E8F0",
              boxShadow:
                "0 8px 24px rgba(15,23,42,0.05)",
            }}
          >
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
                  Weekly Detection Trend
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Object detections over the last 7 days
                </Typography>
              </Box>

              <Chip
                label="+18.2%"
                size="small"
                sx={{
                  bgcolor: "#DCFCE7",
                  color: "#16A34A",
                  fontWeight: 800,
                }}
              />
            </Box>

            <Box
              sx={{
                width: "100%",
                height: 330,
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={weeklyData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                  />

                  <XAxis
                    dataKey="day"
                    tick={{
                      fill: "#64748B",
                      fontSize: 12,
                    }}
                    axisLine={{
                      stroke: "#CBD5E1",
                    }}
                  />

                  <YAxis
                    tick={{
                      fill: "#64748B",
                      fontSize: 12,
                    }}
                    axisLine={{
                      stroke: "#CBD5E1",
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E2E8F0",
                      boxShadow:
                        "0 8px 24px rgba(15,23,42,.10)",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="detections"
                    stroke="#2563EB"
                    strokeWidth={4}
                    dot={{
                      r: 5,
                      fill: "#2563EB",
                    }}
                    activeDot={{
                      r: 8,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* DETECTED OBJECTS */}

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              height: "100%",
              border: "1px solid #E2E8F0",
              boxShadow:
                "0 8px 24px rgba(15,23,42,0.05)",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ color: "#0F172A" }}
            >
              Detected Objects
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Detection distribution
            </Typography>

            <Box
              sx={{
                width: "100%",
                height: 330,
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={objectData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 20,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                  />

                  <XAxis
                    type="number"
                    tick={{
                      fill: "#64748B",
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    dataKey="object"
                    type="category"
                    tick={{
                      fill: "#64748B",
                      fontSize: 12,
                    }}
                    width={65}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    fill="#7C3AED"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* PERFORMANCE CARDS */}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <PerformanceCard
            title="Detection Accuracy"
            value="96.4%"
            description="AI model confidence"
            progress={96.4}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <PerformanceCard
            title="GPU Utilization"
            value={`${dashboard?.system?.gpu || 91.8}%`}
            description="TensorRT GPU workload"
            progress={dashboard?.system?.gpu || 91.8}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <PerformanceCard
            title="Stream Availability"
            value={
              cameras.length
                ? `${Math.round(
                    (onlineCameras / cameras.length) * 100
                  )}%`
                : "0%"
            }
            description="Camera availability"
            progress={
              cameras.length
                ? (onlineCameras / cameras.length) * 100
                : 0
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function AnalyticsStat({
  title,
  value,
  subtitle,
  icon,
  color,
  background,
}) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: "1px solid #E2E8F0",
        boxShadow:
          "0 8px 24px rgba(15,23,42,0.05)",
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
            variant="body2"
            color="text.secondary"
          >
            {title}
          </Typography>

          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              color: "#0F172A",
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="caption"
        color="#94A3B8"
        sx={{
          display: "block",
          mt: 1.5,
        }}
      >
        {subtitle}
      </Typography>
    </Paper>
  );
}

function PerformanceCard({
  title,
  value,
  description,
  progress,
}) {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid #E2E8F0",
        boxShadow:
          "0 8px 24px rgba(15,23,42,0.05)",
      }}
    >
      <Typography
        fontWeight={800}
        sx={{
          color: "#0F172A",
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="h4"
        fontWeight={800}
        sx={{
          color: "#2563EB",
          mt: 1,
        }}
      >
        {value}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 2,
        }}
      >
        {description}
      </Typography>

      <Box
        sx={{
          width: "100%",
          height: 8,
          borderRadius: 10,
          bgcolor: "#E2E8F0",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${Math.min(progress, 100)}%`,
            height: "100%",
            bgcolor: "#2563EB",
            borderRadius: 10,
          }}
        />
      </Box>
    </Paper>
  );
}

export default Analytics;