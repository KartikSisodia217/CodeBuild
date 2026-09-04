import { Card, CardContent, Typography, Box } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { motion } from "framer-motion";

function AnalyticsStatCard({
  title,
  value,
  suffix = "",
  color,
  icon,
  trend,
  positive = true,
}) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      transition={{
        duration: 0.25,
      }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          position: "relative",
          background: "rgba(255,255,255,.80)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,.5)",
          boxShadow: "0 20px 40px rgba(15,23,42,.08)",

          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 0,
            width: 6,
            height: "100%",
            background: color,
          },
        }}
      >
        <CardContent>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {title}
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
                mt={1}
              >
                {value}
{suffix}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 4,
                bgcolor: `${color}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
              }}
            >
              {icon}
            </Box>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            gap={1}
          >
            {positive ? (
              <TrendingUpIcon
                sx={{
                  color: "#10B981",
                }}
              />
            ) : (
              <TrendingDownIcon
                sx={{
                  color: "#EF4444",
                }}
              />
            )}

            <Typography
              fontWeight={700}
              color={
                positive
                  ? "#10B981"
                  : "#EF4444"
              }
            >
              {trend}
            </Typography>

            <Typography
              color="text.secondary"
            >
              vs last week
            </Typography>
          </Box>

        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AnalyticsStatCard;