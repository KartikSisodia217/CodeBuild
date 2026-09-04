import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from "@mui/material";

import VideocamIcon from "@mui/icons-material/Videocam";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const cameras = [
  {
    name: "Main Entrance",
    location: "Block A",
    status: "LIVE",
    fps: "30 FPS",
    resolution: "1920×1080",
    color: "#10B981",
  },
  {
    name: "Parking Area",
    location: "North Gate",
    status: "LIVE",
    fps: "25 FPS",
    resolution: "1280×720",
    color: "#10B981",
  },
  {
    name: "Warehouse",
    location: "Zone C",
    status: "OFFLINE",
    fps: "--",
    resolution: "--",
    color: "#EF4444",
  },
  {
    name: "Lobby",
    location: "Ground Floor",
    status: "LIVE",
    fps: "30 FPS",
    resolution: "1920×1080",
    color: "#10B981",
  },
];

function CameraOverview() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,
        border: "1px solid #E5E7EB",
        backgroundColor: "#FFFFFF",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          mb={3}
          sx={{ color: "#0F172A" }}
        >
          Camera Overview
        </Typography>

        {cameras.map((camera, index) => (
          <Box key={camera.name}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box
                display="flex"
                gap={2}
                alignItems="center"
              >
                <Avatar
                  sx={{
                    bgcolor: "#EFF6FF",
                    color: "#2563EB",
                  }}
                >
                  <VideocamIcon />
                </Avatar>

                <Box>
                  <Typography
                    fontWeight={700}
                    sx={{ color: "#0F172A" }}
                  >
                    {camera.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {camera.location}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {camera.resolution} • {camera.fps}
                  </Typography>
                </Box>
              </Box>

              <Chip
                icon={
                  <FiberManualRecordIcon
                    sx={{
                      fontSize: 12,
                      color: `${camera.color} !important`,
                    }}
                  />
                }
                label={camera.status}
                sx={{
                  bgcolor: `${camera.color}20`,
                  color: camera.color,
                  fontWeight: 700,
                }}
              />
            </Box>

            {index !== cameras.length - 1 && (
              <Divider sx={{ my: 2 }} />
            )}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

export default CameraOverview;