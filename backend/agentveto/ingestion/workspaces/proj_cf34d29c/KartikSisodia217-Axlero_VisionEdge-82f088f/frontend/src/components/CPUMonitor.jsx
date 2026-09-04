import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Avatar,
} from "@mui/material";

import MemoryIcon from "@mui/icons-material/Memory";

const cores = [
  { core: "Core 1", usage: 84, color: "#2563EB" },
  { core: "Core 2", usage: 67, color: "#10B981" },
  { core: "Core 3", usage: 92, color: "#EF4444" },
  { core: "Core 4", usage: 58, color: "#F59E0B" },
  { core: "Core 5", usage: 76, color: "#8B5CF6" },
  { core: "Core 6", usage: 63, color: "#06B6D4" },
  { core: "Core 7", usage: 88, color: "#EC4899" },
  { core: "Core 8", usage: 51, color: "#22C55E" },
];

function CPUMonitor() {
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
          CPU Core Usage
        </Typography>

        {cores.map((item) => (
          <Box key={item.core} mb={2.5}>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Box display="flex" alignItems="center" gap={2}>

                <Avatar
                  sx={{
                    bgcolor: `${item.color}20`,
                    color: item.color,
                    width: 34,
                    height: 34,
                  }}
                >
                  <MemoryIcon fontSize="small" />
                </Avatar>

                <Typography fontWeight={600}>
                  {item.core}
                </Typography>

              </Box>

              <Typography
                fontWeight={700}
                color={item.color}
              >
                {item.usage}%
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={item.usage}
              sx={{
                height: 10,
                borderRadius: 20,
                bgcolor: "#ECECEC",

                "& .MuiLinearProgress-bar": {
                  backgroundColor: item.color,
                  borderRadius: 20,
                },
              }}
            />

          </Box>
        ))}

      </CardContent>
    </Card>
  );
}

export default CPUMonitor;