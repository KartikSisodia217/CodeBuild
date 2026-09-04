import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  color,
}) {
  const isPositive = trend === "up";

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",

        // 3D setup
        transformStyle: "preserve-3d",
        perspective: "1000px",

        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.06)",

        transition:
          "transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",

        "&:hover": {
          transform:
            "translateY(-8px) rotateX(2deg) rotateY(-2deg) scale(1.015)",

          boxShadow:
            "0 20px 45px rgba(15, 23, 42, 0.14)",

          borderColor: `${color}55`,
        },
      }}
    >
      <CardContent
        sx={{
          p: 3,

          // Preserve 3D depth
          transformStyle: "preserve-3d",

          "&:last-child": {
            pb: 3,
          },
        }}
      >
        {/* Top Row */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          {/* Icon */}

          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              background: `${color}14`,
              color: color,

              transform: "translateZ(18px)",

              transition:
                "transform 0.35s ease, box-shadow 0.35s ease",

              "& svg": {
                fontSize: 25,
                transition:
                  "transform 0.35s ease",
              },

              ".MuiCard-root:hover &": {
                transform:
                  "translateZ(30px) scale(1.08)",

                boxShadow:
                  `0 8px 20px ${color}30`,
              },

              ".MuiCard-root:hover & svg": {
                transform:
                  "scale(1.1) rotate(5deg)",
              },
            }}
          >
            {icon}
          </Box>

          {/* Trend */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.5,
              borderRadius: 2,

              backgroundColor: isPositive
                ? "#ECFDF5"
                : "#FEF2F2",

              color: isPositive
                ? "#059669"
                : "#DC2626",

              transform: "translateZ(12px)",

              transition:
                "transform 0.35s ease",

              ".MuiCard-root:hover &": {
                transform:
                  "translateZ(24px)",
              },
            }}
          >
            {isPositive ? (
              <TrendingUpIcon
                sx={{
                  fontSize: 16,
                }}
              />
            ) : (
              <TrendingDownIcon
                sx={{
                  fontSize: 16,
                }}
              />
            )}

            <Typography
              variant="caption"
              fontWeight={700}
            >
              {Math.abs(change)}%
            </Typography>
          </Box>
        </Box>

        {/* Title */}

        <Typography
          sx={{
            color: "#64748B",
            fontSize: "0.85rem",
            fontWeight: 600,
            mb: 0.8,

            transform: "translateZ(8px)",

            transition:
              "transform 0.35s ease",

            ".MuiCard-root:hover &": {
              transform:
                "translateZ(16px)",
            },
          }}
        >
          {title}
        </Typography>

        {/* Value */}

        <Typography
          sx={{
            color: "#0F172A",
            fontSize: "2rem",
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: "-0.8px",

            transform: "translateZ(14px)",

            transition:
              "transform 0.35s ease, color 0.35s ease",

            ".MuiCard-root:hover &": {
              transform:
                "translateZ(24px)",
              color: color,
            },
          }}
        >
          {value}
        </Typography>

        {/* Footer */}

        <Typography
          sx={{
            mt: 1,
            color: "#94A3B8",
            fontSize: "0.75rem",

            transform: "translateZ(6px)",

            transition:
              "transform 0.35s ease",

            ".MuiCard-root:hover &": {
              transform:
                "translateZ(12px)",
            },
          }}
        >
          Compared with previous period
        </Typography>
      </CardContent>
    </Card>
  );
}

export default StatCard;