import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Typography,
} from "@mui/material";

const metrics = [
  {
    title: "GPU Utilization",
    value: "72%",
    progress: 72,
    color: "#2563EB",
  },
  {
    title: "CPU Usage",
    value: "48%",
    progress: 48,
    color: "#10B981",
  },
  {
    title: "Memory Usage",
    value: "64%",
    progress: 64,
    color: "#F59E0B",
  },
  {
    title: "Network Load",
    value: "81%",
    progress: 81,
    color: "#EF4444",
  },
];

function AnalyticsInsights() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,
        border: "1px solid #E5E7EB",
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700}>
          Resource Utilization
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          mb={3}
        >
          Live Hardware Performance
        </Typography>

        {metrics.map((item) => (
          <Box key={item.title} mb={3}>
            <Box
              display="flex"
              justifyContent="space-between"
              mb={1}
            >
              <Typography fontWeight={600}>
                {item.title}
              </Typography>

              <Chip
                label={item.value}
                size="small"
                sx={{
                  bgcolor: `${item.color}20`,
                  color: item.color,
                  fontWeight: 700,
                }}
              />
            </Box>

            <LinearProgress
              variant="determinate"
              value={item.progress}
              sx={{
                height: 10,
                borderRadius: 5,
              }}
            />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

export default AnalyticsInsights;