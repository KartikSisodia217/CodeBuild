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
} from "recharts";

import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import NetworkCheckRoundedIcon from "@mui/icons-material/NetworkCheckRounded";

import { dashboardService } from "../services/dashboardService";

function SystemPerformance() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformance();
  }, []);

  const loadPerformance = async () => {
    try {
      const data = await dashboardService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error("System performance error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={4}>
        <Typography variant="h5" fontWeight={700}>
          Loading System Performance...
        </Typography>
      </Box>
    );
  }

  const system = dashboard?.system || {};

  const performanceData = [
    {
      time: "10:00",
      cpu: 52,
      gpu: 74,
      memory: 61,
    },
    {
      time: "10:05",
      cpu: 58,
      gpu: 79,
      memory: 64,
    },
    {
      time: "10:10",
      cpu: 63,
      gpu: 84,
      memory: 68,
    },
    {
      time: "10:15",
      cpu: 60,
      gpu: 87,
      memory: 70,
    },
    {
      time: "10:20",
      cpu: 66,
      gpu: 89,
      memory: 72,
    },
    {
      time: "10:25",
      cpu: 68,
      gpu: 92,
      memory: 74,
    },
    {
      time: "10:30",
      cpu: system.cpu || 68,
      gpu: system.gpu || 92,
      memory: system.memory || 74,
    },
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
      {/* Header */}

      <Box mb={4}>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            color: "#0F172A",
            mb: 1,
          }}
        >
          System Performance
        </Typography>

        <Typography color="text.secondary">
          Real-time hardware and infrastructure monitoring
        </Typography>
      </Box>

      {/* Status */}

      <Box mb={3}>
        <Chip
          label="System Operational"
          sx={{
            bgcolor: "#DCFCE7",
            color: "#15803D",
            fontWeight: 800,
            px: 1,
          }}
        />
      </Box>

      {/* Hardware KPI */}

      <Grid
        container
        spacing={3}
        sx={{ mb: 4 }}
      >
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <PerformanceStat
            title="CPU Usage"
            value={`${system.cpu || 0}%`}
            icon={<MemoryRoundedIcon />}
            color="#2563EB"
            background="#EFF6FF"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <PerformanceStat
            title="GPU Usage"
            value={`${system.gpu || 0}%`}
            icon={<SpeedRoundedIcon />}
            color="#7C3AED"
            background="#F5F3FF"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <PerformanceStat
            title="Memory Usage"
            value={`${system.memory || 0}%`}
            icon={<MemoryRoundedIcon />}
            color="#F59E0B"
            background="#FFFBEB"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <PerformanceStat
            title="Storage"
            value={`${system.storage || 0}%`}
            icon={<StorageRoundedIcon />}
            color="#10B981"
            background="#ECFDF5"
          />
        </Grid>
      </Grid>

      {/* Main Trend */}

      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          boxShadow:
            "0 8px 24px rgba(15,23,42,0.05)",
          mb: 3,
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
              Hardware Utilization Trend
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              CPU, GPU and memory utilization
            </Typography>
          </Box>

          <Chip
            label="LIVE"
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
            height: 360,
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={performanceData}
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
                dataKey="time"
                tick={{
                  fill: "#64748B",
                  fontSize: 12,
                }}
              />

              <YAxis
                domain={[0, 100]}
                tick={{
                  fill: "#64748B",
                  fontSize: 12,
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
                dataKey="cpu"
                name="CPU"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="gpu"
                name="GPU"
                stroke="#7C3AED"
                strokeWidth={3}
                dot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="memory"
                name="Memory"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Lower Cards */}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ResourceCard
            title="CPU"
            value={system.cpu || 0}
            description="Processor utilization"
            icon={<MemoryRoundedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ResourceCard
            title="GPU"
            value={system.gpu || 0}
            description="TensorRT GPU utilization"
            icon={<SpeedRoundedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ResourceCard
            title="Network"
            value={system.network || 0}
            description="Network utilization"
            icon={<NetworkCheckRoundedIcon />}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function PerformanceStat({
  title,
  value,
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
            sx={{ color: "#0F172A" }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function ResourceCard({
  title,
  value,
  description,
  icon,
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            bgcolor: "#EFF6FF",
            color: "#2563EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            fontWeight={800}
            sx={{ color: "#0F172A" }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {description}
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="h4"
        fontWeight={800}
        sx={{ color: "#2563EB" }}
      >
        {value}%
      </Typography>

      <Box
        sx={{
          mt: 2,
          height: 8,
          borderRadius: 10,
          bgcolor: "#E2E8F0",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${Math.min(value, 100)}%`,
            height: "100%",
            bgcolor: "#2563EB",
            borderRadius: 10,
          }}
        />
      </Box>
    </Paper>
  );
}

export default SystemPerformance;