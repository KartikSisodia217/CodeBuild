import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const alerts = [
  {
    title: "GPU Usage High",
    desc: "GPU utilization exceeded 85%.",
    color: "#F59E0B",
    icon: <WarningAmberIcon />,
    time: "2 min ago",
    status: "Warning",
  },
  {
    title: "Camera Offline",
    desc: "Warehouse Camera lost connection.",
    color: "#EF4444",
    icon: <ErrorIcon />,
    time: "8 min ago",
    status: "Critical",
  },
  {
    title: "Backup Completed",
    desc: "Nightly database backup finished.",
    color: "#10B981",
    icon: <CheckCircleIcon />,
    time: "18 min ago",
    status: "Success",
  },
  {
    title: "AI Model Updated",
    desc: "YOLO model upgraded successfully.",
    color: "#2563EB",
    icon: <NotificationsActiveIcon />,
    time: "35 min ago",
    status: "Info",
  },
];

function AlertPanel() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,
        border: "1px solid #E5E7EB",
      }}
    >
      <CardContent>

        <Typography
          variant="h6"
          fontWeight={700}
          mb={0.5}
        >
          Alert Center
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          mb={3}
        >
          Latest system alerts
        </Typography>

        <Stack spacing={2}>

          {alerts.map((alert, index) => (

            <Box key={index}>

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
                      bgcolor: `${alert.color}20`,
                      color: alert.color,
                    }}
                  >
                    {alert.icon}
                  </Avatar>

                  <Box>

                    <Typography fontWeight={600}>
                      {alert.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {alert.desc}
                    </Typography>

                  </Box>

                </Box>

                <Box textAlign="right">

                  <Chip
                    label={alert.status}
                    size="small"
                    sx={{
                      mb: 1,
                    }}
                  />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {alert.time}
                  </Typography>

                </Box>

              </Box>

              {index !== alerts.length - 1 && (
                <Divider sx={{ mt: 2 }} />
              )}

            </Box>

          ))}

        </Stack>

      </CardContent>
    </Card>
  );
}

export default AlertPanel;