import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";

import streamsService from "../services/streamsService";
import StreamCard from "../components/StreamCard";

function Streams() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [formData, setFormData] = useState({
    camera_name: "",
    rtsp_url: "",
    resolution: "",
    fps: 30,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ============================================================
  // LOAD STREAMS
  // ============================================================

  const loadStreams = async () => {
    try {
      setLoading(true);

      console.log("🔥 Loading streams from backend...");

      const data = await streamsService.getStreams();

      console.log("🔥 STREAMS FROM BACKEND:", data);

      if (Array.isArray(data)) {
        setStreams(data);
      } else {
        console.error("Unexpected streams response:", data);
        setStreams([]);
      }
    } catch (error) {
      console.error("🔥 Failed to load streams:", error);

      showMessage(
        error?.message || "Failed to load streams from backend.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadStreams();
  }, []);

  // ============================================================
  // MESSAGE
  // ============================================================

  const showMessage = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // ============================================================
  // FORM
  // ============================================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "fps" ? Number(value) : value,
    }));
  };

  const handleOpenCreate = () => {
    setFormData({
      camera_name: "",
      rtsp_url: "",
      resolution: "",
      fps: 30,
    });

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (actionLoading) {
      return;
    }

    setDialogOpen(false);
  };

  // ============================================================
  // CREATE STREAM
  // ============================================================

  const handleCreateStream = async () => {
    if (!formData.camera_name.trim()) {
      showMessage("Camera name is required.", "error");
      return;
    }

    if (!formData.rtsp_url.trim()) {
      showMessage("RTSP URL is required.", "error");
      return;
    }

    if (!formData.resolution.trim()) {
      showMessage("Resolution is required.", "error");
      return;
    }

    if (!formData.fps || formData.fps <= 0) {
      showMessage("FPS must be greater than 0.", "error");
      return;
    }

    try {
      setActionLoading("create");

      await streamsService.createStream(formData);

      showMessage("Stream created successfully.", "success");

      setDialogOpen(false);

      setFormData({
        camera_name: "",
        rtsp_url: "",
        resolution: "",
        fps: 30,
      });

      await loadStreams();
    } catch (error) {
      console.error("Create stream error:", error);

      showMessage(
        error?.message || "Failed to create stream.",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // START STREAM
  // ============================================================

  const handleStart = async (streamId) => {
    try {
      setActionLoading(streamId);

      console.log("🔥 START STREAM:", streamId);

      await streamsService.startStream(streamId);

      showMessage("Stream started successfully.", "success");

      await loadStreams();
    } catch (error) {
      console.error("Start stream error:", error);

      showMessage(
        error?.message || "Failed to start stream.",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // STOP STREAM
  // ============================================================

  const handleStop = async (streamId) => {
    try {
      setActionLoading(streamId);

      console.log("🔥 STOP STREAM:", streamId);

      await streamsService.stopStream(streamId);

      showMessage("Stream stopped successfully.", "success");

      await loadStreams();
    } catch (error) {
      console.error("Stop stream error:", error);

      showMessage(
        error?.message || "Failed to stop stream.",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // SUMMARY
  // ============================================================

  const totalStreams = streams.length;

  const activeStreams = streams.filter(
    (stream) => stream.status === true
  ).length;

  const inactiveStreams = totalStreams - activeStreams;

  // ============================================================
  // UI
  // ============================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: "background.default",
        color: "text.primary",
        p: {
          xs: 2,
          md: 4,
        },
        transition:
          "background-color 0.25s ease, color 0.25s ease",
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          flexDirection: {
            xs: "column",
            md: "row",
          },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                bgcolor: "primary.main",
                color: "#FFFFFF",

                boxShadow:
                  "0 8px 20px rgba(37,99,235,0.20)",
              }}
            >
              <VideocamRoundedIcon />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: {
                    xs: "1.8rem",
                    md: "2.2rem",
                  },
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.1,
                }}
              >
                Streams
              </Typography>

              <Typography
                sx={{
                  color: "text.secondary",
                  mt: 0.5,
                }}
              >
                Manage and monitor VisionEdge video streams
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={loadStreams}
            disabled={loading}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              borderColor: "divider",
              color: "text.primary",

              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "action.hover",
              },
            }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
            }}
          >
            Add Stream
          </Button>
        </Box>
      </Box>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <Grid
        container
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <SummaryCard
            title="Total Streams"
            value={totalStreams}
            subtitle="Configured video streams"
            color="primary.main"
            background="action.hover"
            icon={<VideocamRoundedIcon />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <SummaryCard
            title="Live Streams"
            value={activeStreams}
            subtitle="Currently running"
            color="success.main"
            background="action.hover"
            icon={<WifiRoundedIcon />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <SummaryCard
            title="Offline Streams"
            value={inactiveStreams}
            subtitle="Currently stopped"
            color="text.secondary"
            background="action.hover"
            icon={<WifiOffRoundedIcon />}
          />
        </Grid>
      </Grid>

      {/* ======================================================
          TITLE
      ====================================================== */}

      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          fontWeight={800}
          color="text.primary"
        >
          Live Camera Monitoring
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "0.85rem",
            mt: 0.3,
          }}
        >
          Real-time status of configured RTSP video streams
        </Typography>
      </Box>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (
        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : streams.length === 0 ? (
        /* ====================================================
           EMPTY
        ==================================================== */

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            color: "text.primary",
            p: 6,
            textAlign: "center",
          }}
        >
          <VideocamRoundedIcon
            sx={{
              fontSize: 60,
              color: "text.disabled",
              mb: 1,
            }}
          />

          <Typography
            fontWeight={800}
            color="text.primary"
          >
            No streams configured
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              mt: 0.5,
              mb: 2,
            }}
          >
            Add your first RTSP video stream.
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
            }}
          >
            Add Stream
          </Button>
        </Card>
      ) : (
        /* ====================================================
           STREAM GRID
        ==================================================== */

        <Grid
          container
          spacing={3}
        >
          {streams.map((stream) => (
            <Grid
              key={stream.id}
              size={{
                xs: 12,
                md: 6,
                lg: 4,
              }}
            >
              <StreamCard
                stream={stream}
                actionLoading={actionLoading}
                onStart={handleStart}
                onStop={handleStop}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ======================================================
          CREATE DIALOG
      ====================================================== */}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            border: 1,
            borderColor: "divider",
            borderRadius: 3,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Add New Stream
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pt: 1,
            }}
          >
            <TextField
              label="Camera Name"
              name="camera_name"
              value={formData.camera_name}
              onChange={handleInputChange}
              fullWidth
            />

            <TextField
              label="RTSP URL"
              name="rtsp_url"
              value={formData.rtsp_url}
              onChange={handleInputChange}
              placeholder="rtsp://..."
              fullWidth
            />

            <TextField
              label="Resolution"
              name="resolution"
              value={formData.resolution}
              onChange={handleInputChange}
              placeholder="1920x1080"
              fullWidth
            />

            <TextField
              label="FPS"
              name="fps"
              type="number"
              value={formData.fps}
              onChange={handleInputChange}
              inputProps={{
                min: 1,
                max: 120,
              }}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            disabled={actionLoading === "create"}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: "text.secondary",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateStream}
            disabled={actionLoading === "create"}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
            }}
          >
            {actionLoading === "create" ? (
              <CircularProgress
                size={20}
                sx={{
                  color: "#FFFFFF",
                }}
              />
            ) : (
              "Create Stream"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          SNACKBAR
      ====================================================== */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={closeSnackbar}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={closeSnackbar}
          sx={{
            width: "100%",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  title,
  value,
  subtitle,
  color,
  background,
  icon,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        color: "text.primary",
        height: "100%",

        transition:
          "transform .25s ease, box-shadow .25s ease, background-color .25s ease",

        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow:
            "0 14px 30px rgba(0,0,0,0.12)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: background,
            color,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: "text.primary",
              fontSize: "1.8rem",
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>

      <Typography
        sx={{
          mt: 1.5,
          color: "text.secondary",
          fontSize: "0.75rem",
        }}
      >
        {subtitle}
      </Typography>
    </Card>
  );
}

export default Streams;