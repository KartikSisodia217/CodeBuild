import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
} from "@mui/material";

import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import WifiIcon from "@mui/icons-material/Wifi";
import LanIcon from "@mui/icons-material/Lan";

const network = {
  download: 842,
  upload: 214,
  ping: 12,
  packetLoss: 0.3,
  activeConnections: 186,
};

function NetworkTraffic() {
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
          Network Traffic
        </Typography>

        <Grid container spacing={3}>

          <Grid item xs={6}>
            <Box display="flex" gap={1} alignItems="center">
              <CloudDownloadIcon color="primary" />

              <Box>
                <Typography color="text.secondary">
                  Download
                </Typography>

                <Typography variant="h6" fontWeight={700}>
                  {network.download} Mbps
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box display="flex" gap={1} alignItems="center">
              <CloudUploadIcon color="success" />

              <Box>
                <Typography color="text.secondary">
                  Upload
                </Typography>

                <Typography variant="h6" fontWeight={700}>
                  {network.upload} Mbps
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box display="flex" gap={1} alignItems="center">
              <WifiIcon color="warning" />

              <Box>
                <Typography color="text.secondary">
                  Ping
                </Typography>

                <Typography variant="h6" fontWeight={700}>
                  {network.ping} ms
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box display="flex" gap={1} alignItems="center">
              <LanIcon color="secondary" />

              <Box>
                <Typography color="text.secondary">
                  Connections
                </Typography>

                <Typography variant="h6" fontWeight={700}>
                  {network.activeConnections}
                </Typography>
              </Box>
            </Box>
          </Grid>

        </Grid>

        <Box mt={4}>

          <Typography
            color="text.secondary"
            mb={1}
          >
            Network Utilization
          </Typography>

          <LinearProgress
            variant="determinate"
            value={78}
            sx={{
              height: 10,
              borderRadius: 10,
            }}
          />

        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          mt={3}
        >
          <Chip
            label={`Packet Loss ${network.packetLoss}%`}
            color="success"
          />

          <Chip
            label="Stable"
            color="primary"
          />
        </Box>

      </CardContent>
    </Card>
  );
}

export default NetworkTraffic;