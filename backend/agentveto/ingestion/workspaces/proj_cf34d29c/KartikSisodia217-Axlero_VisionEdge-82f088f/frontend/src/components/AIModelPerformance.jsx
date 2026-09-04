import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
} from "@mui/material";

import MemoryIcon from "@mui/icons-material/Memory";
import SpeedIcon from "@mui/icons-material/Speed";
import PsychologyIcon from "@mui/icons-material/Psychology";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const metrics = [
  {
    title: "Model Version",
    value: "YOLOv11",
    icon: <PsychologyIcon />,
    color: "#2563EB",
  },
  {
    title: "Precision",
    value: "98.4%",
    progress: 98,
    icon: <CheckCircleIcon />,
    color: "#10B981",
  },
  {
    title: "Recall",
    value: "97.2%",
    progress: 97,
    icon: <MemoryIcon />,
    color: "#8B5CF6",
  },
  {
    title: "Inference Time",
    value: "18 ms",
    progress: 90,
    icon: <SpeedIcon />,
    color: "#F59E0B",
  },
];

function AIModelPerformance() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,
        height: "100%",
        boxShadow: "0 15px 35px rgba(0,0,0,.08)",
      }}
    >
      <CardContent>

        <Typography
          variant="h6"
          fontWeight={700}
          mb={3}
        >
          AI Model Performance
        </Typography>

        <Chip
          label="GPU Accelerated"
          color="success"
          sx={{ mb: 3 }}
        />

        {metrics.map((metric) => (
          <Box key={metric.title} mb={3}>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Box
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Box sx={{ color: metric.color }}>
                  {metric.icon}
                </Box>

                <Typography fontWeight={600}>
                  {metric.title}
                </Typography>
              </Box>

              <Typography
                fontWeight={700}
                color={metric.color}
              >
                {metric.value}
              </Typography>
            </Box>

            {metric.progress && (
              <LinearProgress
                variant="determinate"
                value={metric.progress}
                sx={{
                  height: 8,
                  borderRadius: 5,

                  "& .MuiLinearProgress-bar": {
                    backgroundColor: metric.color,
                  },
                }}
              />
            )}

          </Box>
        ))}

      </CardContent>
    </Card>
  );
}

export default AIModelPerformance;