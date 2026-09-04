import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SpeedIcon from "@mui/icons-material/Speed";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

function AIInsights() {
  const insights = [
    {
      title: "Detection activity increased",
      description:
        "Object detection volume is 18.2% higher than the previous period.",
      icon: <TrendingUpIcon />,
      color: "#2563EB",
      bg: "#EFF6FF",
      tag: "TREND",
    },
    {
      title: "GPU utilization is high",
      description:
        "GPU usage reached 91.8%. Consider workload balancing.",
      icon: <SpeedIcon />,
      color: "#F59E0B",
      bg: "#FFFBEB",
      tag: "PERFORMANCE",
    },
    {
      title: "Security event detected",
      description:
        "An unauthorized person was detected by the AI pipeline.",
      icon: <WarningAmberIcon />,
      color: "#EF4444",
      bg: "#FEF2F2",
      tag: "SECURITY",
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
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
                backgroundColor: "#F5F3FF",
                color: "#7C3AED",
              }}
            >
              <AutoAwesomeIcon />
            </Box>

            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ color: "#0F172A" }}
              >
                AI Insights
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.3,
                  color: "#64748B",
                }}
              >
                Intelligent platform analysis
              </Typography>
            </Box>
          </Box>

          <Chip
            label="AI ACTIVE"
            size="small"
            sx={{
              fontWeight: 800,
              color: "#047857",
              backgroundColor: "#ECFDF5",
            }}
          />
        </Box>

        {insights.map((item, index) => (
          <Box
            key={item.title}
            sx={{
              display: "flex",
              gap: 1.5,
              py: 1.7,
              borderBottom:
                index !== insights.length - 1
                  ? "1px solid #E2E8F0"
                  : "none",
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                minWidth: 38,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: item.bg,
                color: item.color,
              }}
            >
              {item.icon}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 0.5,
                }}
              >
                <Typography
                  fontWeight={800}
                  fontSize="0.88rem"
                  sx={{ color: "#0F172A" }}
                >
                  {item.title}
                </Typography>

                <Chip
                  label={item.tag}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.58rem",
                    fontWeight: 800,
                    color: item.color,
                    backgroundColor: item.bg,
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748B",
                  lineHeight: 1.5,
                }}
              >
                {item.description}
              </Typography>
            </Box>
          </Box>
        ))}

        <Box
          sx={{
            mt: 2.5,
            p: 1.5,
            borderRadius: 2.5,
            background:
              "linear-gradient(135deg,#EFF6FF,#F5F3FF)",
          }}
        >
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ color: "#475569" }}
          >
            AI Recommendation
          </Typography>

          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              mt: 0.5,
              color: "#1E293B",
            }}
          >
            Monitor GPU workload and review the
            recent security event.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default AIInsights;