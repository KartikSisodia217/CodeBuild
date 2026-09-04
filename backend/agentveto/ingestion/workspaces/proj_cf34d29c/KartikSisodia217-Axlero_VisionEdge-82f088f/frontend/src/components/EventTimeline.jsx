import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SecurityIcon from "@mui/icons-material/Security";
import CircleIcon from "@mui/icons-material/Circle";

const events = [
  {
    id: 1,
    title: "Person Detected",
    location: "Main Entrance",
    time: "Just Now",
    icon: <PersonIcon />,
    color: "#2563EB",
    status: "Normal",
  },
  {
    id: 2,
    title: "Vehicle Entered",
    location: "Parking Area",
    time: "2 mins ago",
    icon: <DirectionsCarIcon />,
    color: "#10B981",
    status: "Detected",
  },
  {
    id: 3,
    title: "Restricted Zone Access",
    location: "Warehouse",
    time: "5 mins ago",
    icon: <WarningAmberIcon />,
    color: "#F59E0B",
    status: "Warning",
  },
  {
    id: 4,
    title: "Unauthorized Person",
    location: "Server Room",
    time: "11 mins ago",
    icon: <SecurityIcon />,
    color: "#EF4444",
    status: "Critical",
  },
];

function EventTimeline() {
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
          Event Timeline
        </Typography>

        {events.map((event, index) => (
          <Box
            key={event.id}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              mb: index === events.length - 1 ? 0 : 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mr: 2,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: `${event.color}20`,
                  color: event.color,
                  width: 46,
                  height: 46,
                }}
              >
                {event.icon}
              </Avatar>

              {index !== events.length - 1 && (
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    bgcolor: "#E5E7EB",
                    minHeight: 45,
                    mt: 1,
                  }}
                />
              )}
            </Box>

            <Box sx={{ flex: 1 }}>

              <Typography fontWeight={700}>
                {event.title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mt={0.5}
              >
                {event.location}
              </Typography>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={1}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {event.time}
                </Typography>

                <Chip
                  size="small"
                  icon={
                    <CircleIcon
                      sx={{
                        color: `${event.color} !important`,
                        fontSize: 10,
                      }}
                    />
                  }
                  label={event.status}
                  sx={{
                    bgcolor: `${event.color}15`,
                    color: event.color,
                    fontWeight: 700,
                  }}
                />
              </Box>

            </Box>
          </Box>
        ))}

      </CardContent>
    </Card>
  );
}

export default EventTimeline;