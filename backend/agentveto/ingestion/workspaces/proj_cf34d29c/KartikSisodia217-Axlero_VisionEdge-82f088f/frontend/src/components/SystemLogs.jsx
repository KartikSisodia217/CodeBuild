import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  TextField,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

const logs = [
  {
    id: 1,
    level: "INFO",
    message: "Camera CAM-01 connected successfully.",
    time: "10:20:14",
  },
  {
    id: 2,
    level: "WARNING",
    message: "High GPU utilization detected (92%).",
    time: "10:20:31",
  },
  {
    id: 3,
    level: "ERROR",
    message: "Camera CAM-03 connection lost.",
    time: "10:21:02",
  },
  {
    id: 4,
    level: "INFO",
    message: "AI inference completed in 18 ms.",
    time: "10:21:15",
  },
  {
    id: 5,
    level: "SECURITY",
    message: "Unauthorized person detected in Server Room.",
    time: "10:21:49",
  },
  {
    id: 6,
    level: "INFO",
    message: "Vehicle detected at Parking Entrance.",
    time: "10:22:04",
  },
  {
    id: 7,
    level: "WARNING",
    message: "Memory utilization crossed 80%.",
    time: "10:22:40",
  },
  {
    id: 8,
    level: "ERROR",
    message: "Analytics API timeout while fetching data.",
    time: "10:23:18",
  },
];

const getChipColor = (level) => {
  switch (level) {
    case "INFO":
      return "primary";
    case "WARNING":
      return "warning";
    case "ERROR":
      return "error";
    case "SECURITY":
      return "secondary";
    default:
      return "default";
  }
};

function SystemLogs() {
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
          System Logs
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Search logs..."
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
          sx={{ mb: 3 }}
        />

        <Box
          sx={{
            maxHeight: 500,
            overflowY: "auto",
          }}
        >
          {logs.map((log) => (
            <Box key={log.id} mb={2}>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Chip
                  label={log.level}
                  color={getChipColor(log.level)}
                  size="small"
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {log.time}
                </Typography>
              </Box>

              <Typography
                mt={1}
                fontSize={14}
              >
                {log.message}
              </Typography>

              <Divider sx={{ mt: 2 }} />

            </Box>
          ))}
        </Box>

      </CardContent>
    </Card>
  );
}

export default SystemLogs;