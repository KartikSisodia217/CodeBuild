import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

function SettingsPanel() {
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
          mb={3}
        >
          System Configuration
        </Typography>

        <Grid container spacing={3}>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Administrator Name"
              defaultValue="Rajesh Reddy"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email Address"
              defaultValue="admin@visionedge.ai"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography
              fontWeight={700}
              mb={2}
            >
              AI Detection Settings
            </Typography>

            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable Person Detection"
            />

            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable Vehicle Detection"
            />

            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable Helmet Detection"
            />

            <FormControlLabel
              control={<Switch />}
              label="Enable Fire Detection"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography
              fontWeight={700}
              mb={2}
            >
              Notifications
            </Typography>

            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Email Alerts"
            />

            <FormControlLabel
              control={<Switch defaultChecked />}
              label="SMS Alerts"
            />

            <FormControlLabel
              control={<Switch />}
              label="Push Notifications"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ mb: 3 }} />

            <Box
              display="flex"
              justifyContent="flex-end"
            >
              <Button
                variant="contained"
                sx={{
                  px: 4,
                  borderRadius: 3,
                  textTransform: "none",
                }}
              >
                Save Changes
              </Button>
            </Box>

          </Grid>

        </Grid>

      </CardContent>
    </Card>
  );
}

export default SettingsPanel;