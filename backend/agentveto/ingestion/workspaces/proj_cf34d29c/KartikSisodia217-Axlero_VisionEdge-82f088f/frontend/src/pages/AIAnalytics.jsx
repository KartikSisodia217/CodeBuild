import { Box, Typography, Grid } from "@mui/material";
import { useEffect, useState } from "react";

import AnalyticsChart from "../components/AnalyticsChart";
import DetectionHeatmap from "../components/DetectionHeatmap";
import TopDetectedObjects from "../components/TopDetectedObjects";
import AIInsights from "../components/AIInsights";
import AIModelPerformance from "../components/AIModelPerformance";
import AIDetectionSummary from "../components/AIDetectionSummary";

import AnalyticsIcon from "@mui/icons-material/Analytics";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SpeedIcon from "@mui/icons-material/Speed";

import { dashboardService } from "../services/dashboardService";

function AIAnalytics() {
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
      console.error("AI Analytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          p: 4,
          minHeight: "100vh",
          bgcolor: "#F8FAFC",
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: "#0F172A" }}
        >
          Loading AI Analytics...
        </Typography>
      </Box>
    );
  }

  const kpis = dashboard?.kpis || [];

  const objectDetection =
    kpis.find(
      (item) => item.title === "Objects Detected"
    )?.value || 0;

  const inferenceSpeed =
    kpis.find(
      (item) => item.title === "Inference Speed"
    )?.value || 0;

  /*
   * Current backend response doesn't contain analytics data.
   * Therefore provide fallback data for the chart.
   * Later this can be replaced by real backend analytics.
   */
  const analyticsData =
    dashboard?.analytics?.length > 0
      ? dashboard.analytics
      : [
          { day: "Mon", detections: 120 },
          { day: "Tue", detections: 180 },
          { day: "Wed", detections: 160 },
          { day: "Thu", detections: 220 },
          { day: "Fri", detections: 200 },
          { day: "Sat", detections: 250 },
          { day: "Sun", detections: 300 },
        ];

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
          AI Analytics
        </Typography>

        <Typography color="text.secondary">
          Real-time AI detection analytics and computer
          vision insights
        </Typography>
      </Box>

      {/* AI SUMMARY */}

      <Grid
        container
        spacing={3}
        sx={{ mb: 3 }}
      >
        <Grid size={{ xs: 12, md: 4 }}>
          <AnalyticsSummary
            icon={<AnalyticsIcon />}
            title="Objects Detected"
            value={objectDetection.toLocaleString()}
            subtitle="Total AI detections"
            color="#2563EB"
            background="#EFF6FF"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AnalyticsSummary
            icon={<PsychologyIcon />}
            title="AI Engine"
            value="Active"
            subtitle="Computer vision pipeline"
            color="#7C3AED"
            background="#F5F3FF"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AnalyticsSummary
            icon={<SpeedIcon />}
            title="Inference Speed"
            value={`${inferenceSpeed} FPS`}
            subtitle="Real-time inference performance"
            color="#10B981"
            background="#ECFDF5"
          />
        </Grid>
      </Grid>

      {/* DETECTION TREND */}

      <Grid
        container
        spacing={3}
        sx={{ mb: 3 }}
      >
        <Grid size={{ xs: 12 }}>
          <AnalyticsChart
            data={analyticsData}
          />
        </Grid>
      </Grid>

      {/* DETECTION HEATMAP */}

      <Grid
        container
        spacing={3}
        sx={{ mb: 3 }}
      >
        <Grid size={{ xs: 12 }}>
          <DetectionHeatmap />
        </Grid>
      </Grid>

      {/* OBJECTS + AI INSIGHTS */}

      <Grid
        container
        spacing={3}
        sx={{ mb: 3 }}
      >
        <Grid size={{ xs: 12, lg: 6 }}>
          <TopDetectedObjects />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <AIInsights />
        </Grid>
      </Grid>

      {/* AI MODEL PERFORMANCE */}

      <Grid
        container
        spacing={3}
      >
        <Grid size={{ xs: 12 }}>
          <AIModelPerformance />
        </Grid>
      </Grid>
    </Box>
  );
}

function AnalyticsSummary({
  icon,
  title,
  value,
  subtitle,
  color,
  background,
}) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 4,
        backgroundColor: "#FFFFFF",
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
            width: 46,
            height: 46,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: background,
            color,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            variant="body2"
            sx={{ color: "#64748B" }}
          >
            {title}
          </Typography>

          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ color: "#0F172A" }}
          >
            {value}
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 1.5,
          color: "#94A3B8",
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}

export default AIAnalytics;