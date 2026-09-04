import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Chip,
  Divider,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PetsIcon from "@mui/icons-material/Pets";
import WarningIcon from "@mui/icons-material/Warning";

const detections = [
  {
    id: 1,
    object: "Person",
    camera: "CAM-01",
    confidence: "98%",
    location: "Main Entrance",
    time: "10:31:14",
    color: "#2563EB",
    icon: <PersonIcon />,
  },
  {
    id: 2,
    object: "Vehicle",
    camera: "CAM-02",
    confidence: "96%",
    location: "Parking",
    time: "10:31:42",
    color: "#10B981",
    icon: <DirectionsCarIcon />,
  },
  {
    id: 3,
    object: "Dog",
    camera: "CAM-05",
    confidence: "93%",
    location: "Back Gate",
    time: "10:32:08",
    color: "#F59E0B",
    icon: <PetsIcon />,
  },
  {
    id: 4,
    object: "Intrusion",
    camera: "CAM-04",
    confidence: "99%",
    location: "Restricted Zone",
    time: "10:32:45",
    color: "#EF4444",
    icon: <WarningIcon />,
  },
];

function RecentDetections() {
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
          Recent AI Detections
        </Typography>

        {detections.map((item) => (
          <Box key={item.id} mb={2}>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Avatar
                  sx={{
                    bgcolor: `${item.color}20`,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </Avatar>

                <Box>
                  <Typography fontWeight={700}>
                    {item.object}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {item.location}
                  </Typography>
                </Box>

              </Box>

              <Chip
                label={item.confidence}
                color="primary"
              />

            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              mt={1}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {item.camera}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {item.time}
              </Typography>
            </Box>

            <Divider sx={{ mt: 2 }} />

          </Box>
        ))}

      </CardContent>
    </Card>
  );
}

export default RecentDetections;