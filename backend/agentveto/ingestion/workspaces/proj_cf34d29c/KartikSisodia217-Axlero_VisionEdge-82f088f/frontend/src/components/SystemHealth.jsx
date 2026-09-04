import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from "@mui/material";

function HealthRow({ label, value }) {
  const getColor = () => {
    if (value >= 85) return "#EF4444";
    if (value >= 70) return "#F59E0B";
    return "#10B981";
  };

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.8,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ color: "#475569" }}
        >
          {label}
        </Typography>

        <Typography
          variant="body2"
          fontWeight={800}
          sx={{ color: getColor() }}
        >
          {Number(value || 0).toFixed(1)}%
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={Math.min(Number(value || 0), 100)}
        sx={{
          height: 8,
          borderRadius: 10,
          backgroundColor: "#E2E8F0",

          "& .MuiLinearProgress-bar": {
            borderRadius: 10,
            backgroundColor: getColor(),
          },
        }}
      />
    </Box>
  );
}

function SystemHealth({ system }) {
  const health = system || {};

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        minHeight: 440,
        borderRadius: 4,
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.06)",
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

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              color: "#0F172A",
            }}
          >
            System Health
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              color: "#64748B",
            }}
          >
            Real-time infrastructure utilization
          </Typography>
        </Box>

        {/* Overall Status */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            mb: 3,
            p: 1.5,
            borderRadius: 3,
            backgroundColor: "#ECFDF5",
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#10B981",
              boxShadow:
                "0 0 0 4px rgba(16,185,129,0.12)",
            }}
          />

          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              color: "#047857",
            }}
          >
            Infrastructure Operational
          </Typography>
        </Box>

        {/* Metrics */}

        <HealthRow
          label="CPU Usage"
          value={health.cpu}
        />

        <HealthRow
          label="GPU Usage"
          value={health.gpu}
        />

        <HealthRow
          label="Memory Usage"
          value={health.memory}
        />

        <HealthRow
          label="Storage Usage"
          value={health.storage}
        />

        <HealthRow
          label="Network Usage"
          value={health.network}
        />
      </CardContent>
    </Card>
  );
}

export default SystemHealth;