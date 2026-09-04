import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";

import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";

function StreamCard({
  stream,
  actionLoading,
  onStart,
  onStop,
}) {
  const isOnline = stream.status === true;

  const isLoading = actionLoading === stream.id;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        overflow: "hidden",

        backgroundColor: "background.paper",

        border: "1px solid",
        borderColor: "divider",

        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 8px 24px rgba(0,0,0,0.25)"
            : "0 8px 24px rgba(15,23,42,0.06)",

        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.25s ease, border-color 0.25s ease",

        "&:hover": {
          transform: "translateY(-4px)",

          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 16px 35px rgba(0,0,0,0.40)"
              : "0 16px 35px rgba(15,23,42,0.12)",
        },
      }}
    >
      {/* =====================================================
          VIDEO PREVIEW
      ====================================================== */}

      <Box
        sx={{
          height: 230,
          position: "relative",
          overflow: "hidden",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          background:
            "linear-gradient(135deg,#020617,#0F172A,#172033)",
        }}
      >
        {/* CAMERA ICON */}

        <VideocamRoundedIcon
          sx={{
            fontSize: 70,
            color: isOnline
              ? "#22C55E"
              : "#475569",
            opacity: 0.9,
          }}
        />

        {/* STATUS */}

        <Chip
          size="small"
          label={isOnline ? "LIVE" : "OFFLINE"}
          icon={
            isOnline ? (
              <WifiRoundedIcon />
            ) : (
              <WifiOffRoundedIcon />
            )
          }
          sx={{
            position: "absolute",
            top: 14,
            left: 14,

            fontWeight: 800,

            color: "#FFFFFF",

            backgroundColor: isOnline
              ? "#16A34A"
              : "#DC2626",

            "& .MuiChip-icon": {
              color: "#FFFFFF",
            },
          }}
        />

        {/* STREAM ID */}

        <Chip
          size="small"
          label={`Stream #${stream.id}`}
          sx={{
            position: "absolute",
            top: 14,
            right: 14,

            backgroundColor:
              "rgba(15,23,42,0.85)",

            color: "#FFFFFF",
            fontWeight: 700,
          }}
        />

        {/* LIVE INDICATOR */}

        {isOnline && (
          <Box
            sx={{
              position: "absolute",
              bottom: 14,
              left: 14,

              display: "flex",
              alignItems: "center",
              gap: 1,

              px: 1.5,
              py: 0.7,

              borderRadius: 2,

              backgroundColor:
                "rgba(22,163,74,0.9)",
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
              }}
            />

            <Typography
              variant="caption"
              sx={{
                color: "#FFFFFF",
                fontWeight: 800,
              }}
            >
              LIVE
            </Typography>
          </Box>
        )}

        {/* FPS */}

        <Box
          sx={{
            position: "absolute",
            bottom: 14,
            right: 14,

            px: 1.5,
            py: 0.7,

            borderRadius: 2,

            backgroundColor:
              "rgba(15,23,42,0.85)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#FFFFFF",
              fontWeight: 800,
            }}
          >
            {isOnline
              ? `${stream.fps || 0} FPS`
              : "--"}
          </Typography>
        </Box>
      </Box>

      {/* =====================================================
          DETAILS
      ====================================================== */}

      <CardContent
        sx={{
          p: 2.5,
          backgroundColor: "background.paper",
          transition: "background-color 0.25s ease",
        }}
      >
        {/* CAMERA NAME */}

        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            color: "text.primary",

            mb: 2,

            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",

            transition: "color 0.25s ease",
          }}
        >
          {stream.camera_name || "Unnamed Camera"}
        </Typography>

        <Divider
          sx={{
            mb: 2,
            borderColor: "divider",
          }}
        />

        {/* STREAM INFORMATION */}

        <StreamInfo
          label="RTSP URL"
          value={stream.rtsp_url}
        />

        <StreamInfo
          label="Resolution"
          value={
            isOnline
              ? stream.resolution
              : "--"
          }
        />

        <StreamInfo
          label="Frame Rate"
          value={
            isOnline
              ? `${stream.fps || 0} FPS`
              : "--"
          }
        />

        <StreamInfo
          label="Status"
          value={
            isOnline
              ? "Online"
              : "Offline"
          }
          status={isOnline}
        />

        {/* =====================================================
            ACTION
        ====================================================== */}

        <Box sx={{ mt: 3 }}>
          {!isOnline ? (
            <Button
              fullWidth
              variant="contained"
              startIcon={
                isLoading ? (
                  <CircularProgress
                    size={18}
                    sx={{
                      color: "#FFFFFF",
                    }}
                  />
                ) : (
                  <PlayArrowRoundedIcon />
                )
              }
              onClick={() =>
                onStart(stream.id)
              }
              disabled={isLoading}
              sx={{
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,

                backgroundColor: "#16A34A",

                "&:hover": {
                  backgroundColor: "#15803D",
                },

                "&.Mui-disabled": {
                  backgroundColor: "#166534",
                  color: "#CBD5E1",
                },
              }}
            >
              {isLoading
                ? "Starting..."
                : "Start Stream"}
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              startIcon={
                isLoading ? (
                  <CircularProgress
                    size={18}
                    sx={{
                      color: "#FFFFFF",
                    }}
                  />
                ) : (
                  <StopRoundedIcon />
                )
              }
              onClick={() =>
                onStop(stream.id)
              }
              disabled={isLoading}
              sx={{
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,

                backgroundColor: "#DC2626",

                "&:hover": {
                  backgroundColor: "#B91C1C",
                },

                "&.Mui-disabled": {
                  backgroundColor: "#7F1D1D",
                  color: "#CBD5E1",
                },
              }}
            >
              {isLoading
                ? "Stopping..."
                : "Stop Stream"}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   STREAM INFO
============================================================ */

function StreamInfo({
  label,
  value,
  status,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",

        gap: 2,
        mb: 1.5,
      }}
    >
      {/* LABEL */}

      <Typography
        sx={{
          color: "text.secondary",

          fontSize: "0.8rem",
          fontWeight: 700,

          transition: "color 0.25s ease",
        }}
      >
        {label}
      </Typography>

      {/* VALUE */}

      <Typography
        sx={{
          color:
            label === "Status"
              ? status
                ? "#22C55E"
                : "#EF4444"
              : "text.primary",

          fontSize: "0.85rem",
          fontWeight: 700,

          textAlign: "right",

          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",

          maxWidth: "65%",

          transition: "color 0.25s ease",
        }}
      >
        {value || "--"}
      </Typography>
    </Box>
  );
}

export default StreamCard;