import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";
import SecurityIcon from "@mui/icons-material/Security";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function AlertSummary() {
  const alerts = [
    {
      title: "Critical Security Alerts",
      value: 2,
      icon: <SecurityIcon />,
      color: "#EF4444",
      bg: "#FEF2F2",
    },
    {
      title: "System Warnings",
      value: 4,
      icon: <WarningAmberIcon />,
      color: "#F59E0B",
      bg: "#FFFBEB",
    },
    {
      title: "Camera Issues",
      value: 1,
      icon: <ErrorIcon />,
      color: "#8B5CF6",
      bg: "#F5F3FF",
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
              Alert Summary
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: "#64748B",
              }}
            >
              Current security and system alerts
            </Typography>
          </Box>

          <Chip
            label="7 Active"
            size="small"
            sx={{
              fontWeight: 800,
              color: "#DC2626",
              backgroundColor: "#FEF2F2",
            }}
          />
        </Box>

        {alerts.map((alert, index) => (
          <Box
            key={alert.title}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              py: 1.8,
              borderBottom:
                index !== alerts.length - 1
                  ? "1px solid #E2E8F0"
                  : "none",
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: alert.bg,
                color: alert.color,
              }}
            >
              {alert.icon}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                fontWeight={700}
                fontSize="0.9rem"
                sx={{ color: "#334155" }}
              >
                {alert.title}
              </Typography>

              <Typography
                variant="caption"
                sx={{ color: "#94A3B8" }}
              >
                Requires monitoring
              </Typography>
            </Box>

            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ color: alert.color }}
            >
              {alert.value}
            </Typography>
          </Box>
        ))}

        <Box
          sx={{
            mt: 2.5,
            p: 1.5,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "#ECFDF5",
          }}
        >
          <CheckCircleIcon
            sx={{
              fontSize: 19,
              color: "#10B981",
            }}
          />

          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ color: "#047857" }}
          >
            Monitoring system is operational
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default AlertSummary;