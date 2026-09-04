import {
  Box,
  Typography,
  Chip,
  Button,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import CircleIcon from "@mui/icons-material/Circle";

function AnalyticsHeader() {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Box
      sx={{
        mb: 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          fontWeight={700}
        >
          VisionEdge Dashboard
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          AI Powered Video Analytics & Monitoring Platform
        </Typography>

        <Chip
          icon={
            <CircleIcon
              sx={{
                color: "#10B981 !important",
                fontSize: 12,
              }}
            />
          }
          label="System Running Normally"
          sx={{
            mt: 2,
            bgcolor: "#DCFCE7",
            color: "#15803D",
            fontWeight: 700,
          }}
        />
      </Box>

      <Box
        display="flex"
        alignItems="center"
        gap={2}
      >
        <Box textAlign="right">
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Today
          </Typography>

          <Typography fontWeight={700}>
            {today}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          sx={{
            borderRadius: 3,
            px: 3,
            textTransform: "none",
          }}
        >
          Refresh
        </Button>
      </Box>
    </Box>
  );
}

export default AnalyticsHeader;