import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
} from "@mui/material";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SettingsIcon from "@mui/icons-material/Settings";

function QuickActions() {
  const actions = [
    {
      title: "Add User",
      icon: <PersonAddIcon />,
      color: "#2563EB",
    },
    {
      title: "Add Stream",
      icon: <VideoCallIcon />,
      color: "#10B981",
    },
    {
      title: "Analytics",
      icon: <AnalyticsIcon />,
      color: "#F59E0B",
    },
    {
      title: "Settings",
      icon: <SettingsIcon />,
      color: "#8B5CF6",
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,
        border: "1px solid #E5E7EB",
        boxShadow: "0 10px 30px rgba(0,0,0,.06)",
      }}
    >
      <CardContent>

        <Typography
          variant="h5"
          fontWeight={700}
          mb={3}
        >
          Quick Actions
        </Typography>

        <Grid container spacing={2}>

          {actions.map((action) => (

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={action.title}
            >
              <Button
                fullWidth
                startIcon={action.icon}
                sx={{
                  height: 70,
                  borderRadius: 3,
                  background: action.color,
                  color: "#fff",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: 16,

                  "&:hover": {
                    background: action.color,
                    opacity: .9,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {action.title}
              </Button>
            </Grid>

          ))}

        </Grid>

      </CardContent>
    </Card>
  );
}

export default QuickActions;