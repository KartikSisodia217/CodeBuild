import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
} from "@mui/material";

import VideocamIcon from "@mui/icons-material/Videocam";

const cameras = [
  {
    id: "CAM-01",
    location: "Main Entrance",
    status: "Online",
    fps: 30,
    quality: "1080P",
    ai: "Running",
    updated: "2 sec ago",
  },
  {
    id: "CAM-02",
    location: "Parking Area",
    status: "Online",
    fps: 25,
    quality: "720P",
    ai: "Running",
    updated: "1 sec ago",
  },
  {
    id: "CAM-03",
    location: "Warehouse",
    status: "Offline",
    fps: 0,
    quality: "--",
    ai: "Stopped",
    updated: "5 min ago",
  },
  {
    id: "CAM-04",
    location: "Server Room",
    status: "Online",
    fps: 30,
    quality: "4K",
    ai: "Running",
    updated: "Just Now",
  },
];

function CameraStatusGrid() {
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
          Camera Status
        </Typography>

        <Grid container spacing={3}>

          {cameras.map((camera) => (

            <Grid item xs={12} md={6} lg={3} key={camera.id}>

              <Card
                variant="outlined"
                sx={{
                  borderRadius: 4,
                }}
              >
                <CardContent>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <VideocamIcon color="primary" />

                    <Chip
                      label={camera.status}
                      color={
                        camera.status === "Online"
                          ? "success"
                          : "error"
                      }
                      size="small"
                    />
                  </Box>

                  <Typography
                    fontWeight={700}
                    mb={1}
                  >
                    {camera.id}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    mb={2}
                  >
                    {camera.location}
                  </Typography>

                  <Typography variant="body2">
                    FPS : <b>{camera.fps}</b>
                  </Typography>

                  <Typography variant="body2">
                    Quality : <b>{camera.quality}</b>
                  </Typography>

                  <Typography variant="body2">
                    AI : <b>{camera.ai}</b>
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mt={2}
                  >
                    Updated {camera.updated}
                  </Typography>

                </CardContent>
              </Card>

            </Grid>

          ))}

        </Grid>

      </CardContent>
    </Card>
  );
}

export default CameraStatusGrid;