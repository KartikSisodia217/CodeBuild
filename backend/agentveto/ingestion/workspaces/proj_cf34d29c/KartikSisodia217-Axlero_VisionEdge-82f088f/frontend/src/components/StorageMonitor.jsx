import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Chip,
} from "@mui/material";

import StorageIcon from "@mui/icons-material/Storage";
import SdStorageIcon from "@mui/icons-material/SdStorage";

const disks = [
  {
    name: "Primary SSD",
    total: 1000,
    used: 684,
    read: "3.8 GB/s",
    write: "2.9 GB/s",
    health: "98%",
    iops: "410K",
    color: "#2563EB",
  },
  {
    name: "Backup HDD",
    total: 2000,
    used: 1265,
    read: "218 MB/s",
    write: "184 MB/s",
    health: "96%",
    iops: "120K",
    color: "#10B981",
  },
];

function StorageMonitor() {
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
          Storage Monitor
        </Typography>

        {disks.map((disk) => {
          const percent = (disk.used / disk.total) * 100;

          return (
            <Box key={disk.name} mb={4}>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Box display="flex" gap={1} alignItems="center">

                  {disk.name.includes("SSD") ? (
                    <StorageIcon sx={{ color: disk.color }} />
                  ) : (
                    <SdStorageIcon sx={{ color: disk.color }} />
                  )}

                  <Typography fontWeight={700}>
                    {disk.name}
                  </Typography>

                </Box>

                <Chip
                  label={`${percent.toFixed(0)}% Used`}
                  color="primary"
                />

              </Box>

              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{
                  height: 10,
                  borderRadius: 20,
                  mb: 3,

                  "& .MuiLinearProgress-bar": {
                    backgroundColor: disk.color,
                  },
                }}
              />

              <Grid container spacing={2}>

                <Grid item xs={6}>
                  <Typography color="text.secondary">
                    Capacity
                  </Typography>

                  <Typography fontWeight={700}>
                    {disk.used} GB / {disk.total} GB
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography color="text.secondary">
                    Health
                  </Typography>

                  <Typography fontWeight={700}>
                    {disk.health}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography color="text.secondary">
                    Read Speed
                  </Typography>

                  <Typography fontWeight={700}>
                    {disk.read}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography color="text.secondary">
                    Write Speed
                  </Typography>

                  <Typography fontWeight={700}>
                    {disk.write}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography color="text.secondary">
                    IOPS
                  </Typography>

                  <Typography fontWeight={700}>
                    {disk.iops}
                  </Typography>
                </Grid>

              </Grid>

            </Box>
          );
        })}

      </CardContent>
    </Card>
  );
}

export default StorageMonitor;