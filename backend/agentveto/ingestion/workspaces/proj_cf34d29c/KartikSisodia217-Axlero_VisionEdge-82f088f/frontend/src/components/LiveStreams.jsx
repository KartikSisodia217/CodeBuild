import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";

import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";

import streamService from "../services/streamService";


function LiveStreams({ cameras: dashboardCameras = [] }) {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });


  // =========================================================
  // LOAD STREAMS
  // =========================================================

  const loadStreams = async () => {
    try {
      setLoading(true);

      const data = await streamService.getStreams();

      console.log("LIVE STREAMS:", data);

      setStreams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LOAD STREAMS ERROR:", error);

      setSnackbar({
        open: true,
        message: "Failed to load camera streams.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // INITIAL LOAD + LIVE REFRESH
  // =========================================================

  useEffect(() => {
    loadStreams();

    const interval = setInterval(() => {
      loadStreams();
    }, 10000);

    return () => clearInterval(interval);
  }, []);


  // =========================================================
  // START STREAM
  // =========================================================

  const handleStart = async (streamId) => {
    try {
      setActionLoading(streamId);

      console.log(
        "Starting stream:",
        streamId
      );

      const updatedStream =
        await streamService.startStream(streamId);

      console.log(
        "START STREAM RESPONSE:",
        updatedStream
      );

      setStreams((prev) =>
        prev.map((stream) =>
          stream.id === streamId
            ? updatedStream
            : stream
        )
      );

      setSnackbar({
        open: true,
        message: `Camera ${streamId} started successfully.`,
        severity: "success",
      });
    } catch (error) {
      console.error(
        "START STREAM ERROR:",
        error
      );

      setSnackbar({
        open: true,
        message:
          error?.response?.data?.detail ||
          "Failed to start camera.",
        severity: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };


  // =========================================================
  // STOP STREAM
  // =========================================================

  const handleStop = async (streamId) => {
    try {
      setActionLoading(streamId);

      console.log(
        "Stopping stream:",
        streamId
      );

      const updatedStream =
        await streamService.stopStream(streamId);

      console.log(
        "STOP STREAM RESPONSE:",
        updatedStream
      );

      setStreams((prev) =>
        prev.map((stream) =>
          stream.id === streamId
            ? updatedStream
            : stream
        )
      );

      setSnackbar({
        open: true,
        message: `Camera ${streamId} stopped successfully.`,
        severity: "success",
      });
    } catch (error) {
      console.error(
        "STOP STREAM ERROR:",
        error
      );

      setSnackbar({
        open: true,
        message:
          error?.response?.data?.detail ||
          "Failed to stop camera.",
        severity: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };


  // =========================================================
  // CLOSE SNACKBAR
  // =========================================================

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading && streams.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          textAlign: "center",
        }}
      >
        <CircularProgress />

        <Typography
          sx={{
            mt: 2,
            color: "#64748B",
            fontWeight: 600,
          }}
        >
          Loading camera streams...
        </Typography>
      </Paper>
    );
  }


  // =========================================================
  // EMPTY STATE
  // =========================================================

  if (streams.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          textAlign: "center",
        }}
      >
        <VideocamRoundedIcon
          sx={{
            fontSize: 50,
            color: "#94A3B8",
          }}
        />

        <Typography
          sx={{
            mt: 1,
            fontWeight: 800,
            color: "#0F172A",
          }}
        >
          No camera streams found
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            color: "#64748B",
          }}
        >
          Add a camera stream to start monitoring.
        </Typography>
      </Paper>
    );
  }


  // =========================================================
  // CAMERA CARDS
  // =========================================================

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 900,
                color: "#0F172A",
              }}
            >
              Live Camera Streams
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: "0.75rem",
                color: "#94A3B8",
              }}
            >
              Real-time camera monitoring and stream control
            </Typography>
          </Box>

          <Chip
            icon={<VideocamRoundedIcon />}
            label={`${streams.length} Cameras`}
            sx={{
              fontWeight: 800,
              bgcolor: "#EFF6FF",
              color: "#2563EB",
            }}
          />
        </Box>


        {/* ===================================================
            STREAM GRID
        =================================================== */}

        <Grid
          container
          spacing={2.5}
        >
          {streams.map((stream) => {
            const isOnline =
              Boolean(stream.status);

            const isActionLoading =
              actionLoading === stream.id;

            return (
              <Grid
                key={stream.id}
                size={{
                  xs: 12,
                  md: 6,
                  lg: 4,
                }}
              >
                <Box
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                    transition:
                      "transform .25s ease, box-shadow .25s ease",

                    "&:hover": {
                      transform:
                        "translateY(-3px)",
                      boxShadow:
                        "0 12px 28px rgba(15,23,42,.08)",
                    },
                  }}
                >
                  {/* =========================================
                      VIDEO AREA
                  ========================================= */}

                  <Box
                    sx={{
                      height: 190,
                      background:
                        "linear-gradient(135deg,#0F172A,#1E293B)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <VideocamRoundedIcon
                      sx={{
                        fontSize: 58,
                        color: isOnline
                          ? "#38BDF8"
                          : "#64748B",
                      }}
                    />

                    {/* STATUS */}

                    <Chip
                      size="small"
                      label={
                        isOnline
                          ? "LIVE"
                          : "OFFLINE"
                      }
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        fontWeight: 900,
                        bgcolor: isOnline
                          ? "#DCFCE7"
                          : "#F1F5F9",
                        color: isOnline
                          ? "#16A34A"
                          : "#64748B",
                      }}
                    />

                    {/* CAMERA ID */}

                    <Typography
                      sx={{
                        position: "absolute",
                        top: 15,
                        right: 14,
                        color: "#FFFFFF",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                      }}
                    >
                      CAM-{String(stream.id).padStart(2, "0")}
                    </Typography>
                  </Box>


                  {/* =========================================
                      CAMERA INFORMATION
                  ========================================= */}

                  <Box sx={{ p: 2.5 }}>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: "#0F172A",
                        fontSize: "1rem",
                      }}
                    >
                      {stream.camera_name ||
                        `Camera ${stream.id}`}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: "0.75rem",
                        color: "#64748B",
                      }}
                    >
                      {stream.resolution ||
                        "Unknown resolution"}
                    </Typography>


                    {/* =======================================
                        STREAM METRICS
                    ======================================= */}

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mt: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        size="small"
                        label={`${stream.fps ?? 0} FPS`}
                        sx={{
                          fontWeight: 700,
                          bgcolor: "#F1F5F9",
                        }}
                      />

                      <Chip
                        size="small"
                        icon={
                          <SmartToyRoundedIcon />
                        }
                        label={
                          isOnline
                            ? "AI Enabled"
                            : "AI Disabled"
                        }
                        sx={{
                          fontWeight: 700,
                          bgcolor: isOnline
                            ? "#ECFDF5"
                            : "#F8FAFC",
                          color: isOnline
                            ? "#059669"
                            : "#64748B",
                        }}
                      />
                    </Box>


                    {/* =======================================
                        RTSP
                    ======================================= */}

                    <Typography
                      sx={{
                        mt: 2,
                        fontSize: "0.68rem",
                        color: "#94A3B8",
                        wordBreak: "break-all",
                      }}
                    >
                      {stream.rtsp_url ||
                        "No RTSP URL"}
                    </Typography>


                    {/* =======================================
                        CONTROLS
                    ======================================= */}

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mt: 2.5,
                      }}
                    >
                      {!isOnline ? (
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={
                            isActionLoading ? (
                              <CircularProgress
                                size={18}
                                color="inherit"
                              />
                            ) : (
                              <PlayArrowRoundedIcon />
                            )
                          }
                          onClick={() =>
                            handleStart(stream.id)
                          }
                          disabled={
                            isActionLoading
                          }
                          sx={{
                            borderRadius: 2.5,
                            textTransform: "none",
                            fontWeight: 800,
                            boxShadow: "none",
                          }}
                        >
                          {isActionLoading
                            ? "Starting..."
                            : "Start Camera"}
                        </Button>
                      ) : (
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          startIcon={
                            isActionLoading ? (
                              <CircularProgress
                                size={18}
                              />
                            ) : (
                              <StopRoundedIcon />
                            )
                          }
                          onClick={() =>
                            handleStop(stream.id)
                          }
                          disabled={
                            isActionLoading
                          }
                          sx={{
                            borderRadius: 2.5,
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          {isActionLoading
                            ? "Stopping..."
                            : "Stop Camera"}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>


      {/* =====================================================
          SNACKBAR
      ===================================================== */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: 2.5,
            fontWeight: 700,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default LiveStreams;