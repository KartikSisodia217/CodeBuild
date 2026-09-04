import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
} from "@mui/material";

import MemoryIcon from "@mui/icons-material/Memory";

const gpus = [
  {
    name: "NVIDIA RTX 4090",
    usage: 91,
    memory: "18.2 / 24 GB",
    temp: "71°C",
    fps: 118,
  },
  {
    name: "Intel UHD Graphics",
    usage: 24,
    memory: "1.3 / 4 GB",
    temp: "49°C",
    fps: 36,
  },
];

function GPUPerformance() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,
        boxShadow: "0 15px 35px rgba(0,0,0,.08)",
      }}
    >
      <CardContent>

        <Typography
          variant="h6"
          fontWeight={700}
          mb={3}
        >
          GPU Performance
        </Typography>

        {gpus.map((gpu) => (
          <Box
            key={gpu.name}
            mb={4}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box
                display="flex"
                alignItems="center"
                gap={1}
              >
                <MemoryIcon color="primary" />

                <Typography fontWeight={700}>
                  {gpu.name}
                </Typography>
              </Box>

              <Chip
                label={`${gpu.usage}%`}
                color="primary"
              />
            </Box>

            <LinearProgress
              variant="determinate"
              value={gpu.usage}
              sx={{
                mt: 2,
                mb: 2,
                height: 10,
                borderRadius: 10,
              }}
            />

            <Box
              display="flex"
              justifyContent="space-between"
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Memory
              </Typography>

              <Typography
                variant="body2"
                fontWeight={700}
              >
                {gpu.memory}
              </Typography>
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              mt={1}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Temperature
              </Typography>

              <Typography
                variant="body2"
                fontWeight={700}
              >
                {gpu.temp}
              </Typography>
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              mt={1}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                FPS
              </Typography>

              <Typography
                variant="body2"
                fontWeight={700}
              >
                {gpu.fps}
              </Typography>
            </Box>

          </Box>
        ))}

      </CardContent>
    </Card>
  );
}

export default GPUPerformance;