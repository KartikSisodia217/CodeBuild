
function CameraCard({
  camera,
  actionLoading,
  onAction,
}) {
  const startKey = `${camera.id}-start`;
  const stopKey = `${camera.id}-stop`;
  const reconnectKey = `${camera.id}-reconnect`;

  const busy =
    Boolean(
      actionLoading[startKey] ||
      actionLoading[stopKey] ||
      actionLoading[reconnectKey]
    );

  const previewUrl =
    camera.previewUrl ||
    camera.preview_url ||
    camera.snapshotUrl ||
    camera.snapshot_url ||
    camera.thumbnail ||
    "";

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: camera.isOnline
          ? "rgba(34,197,94,0.22)"
          : "divider",
        boxShadow:
          "0 10px 30px rgba(15,23,42,0.07)",
        transition:
          "transform .22s ease, box-shadow .22s ease, border-color .22s ease",

        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow:
            "0 20px 45px rgba(15,23,42,0.13)",
          borderColor: camera.isOnline
            ? "rgba(34,197,94,0.45)"
            : "rgba(37,99,235,0.25)",
        },
      }}
    >
      {/* =====================================================
          LIVE CAMERA PREVIEW
      ===================================================== */}

      <Box
        sx={{
          height: 210,
          position: "relative",
          overflow: "hidden",
          bgcolor: "#020617",
          background: previewUrl
            ? "#020617"
            : camera.isOnline
              ? "radial-gradient(circle at 50% 45%, #172554 0%, #0f172a 38%, #020617 100%)"
              : "linear-gradient(135deg,#111827,#020617)",
        }}
      >
        {/* REAL IMAGE / STREAM PREVIEW */}

        {previewUrl ? (
          <Box
            component="img"
            src={previewUrl}
            alt={camera.name}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              filter: camera.isOnline
                ? "brightness(.82) saturate(1.08)"
                : "grayscale(1) brightness(.45)",
            }}
            onError={(event) => {
              event.currentTarget.style.display =
                "none";
            }}
          />
        ) : (
          <>
            {/* SCAN GRID */}

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                opacity: camera.isOnline
                  ? 0.16
                  : 0.06,
                backgroundImage:
                  "linear-gradient(rgba(148,163,184,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.22) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            {/* RADAR GLOW */}

            {camera.isOnline && (
              <Box
                sx={{
                  position: "absolute",
                  width: 180,
                  height: 180,
                  left: "50%",
                  top: "50%",
                  transform:
                    "translate(-50%, -50%)",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(56,189,248,.18), rgba(37,99,235,.05), transparent 70%)",
                  animation:
                    "cameraPulse 2.5s ease-in-out infinite",

                  "@keyframes cameraPulse": {
                    "0%,100%": {
                      transform:
                        "translate(-50%, -50%) scale(.9)",
                      opacity: 0.6,
                    },
                    "50%": {
                      transform:
                        "translate(-50%, -50%) scale(1.08)",
                      opacity: 1,
                    },
                  },
                }}
              />
            )}

            {/* CAMERA ICON */}

            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform:
                  "translate(-50%, -50%)",
                width: 72,
                height: 72,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor:
                  "rgba(15,23,42,.78)",
                border:
                  "1px solid rgba(148,163,184,.18)",
                color: camera.isOnline
                  ? "#38BDF8"
                  : "#64748B",
                boxShadow:
                  camera.isOnline
                    ? "0 0 40px rgba(56,189,248,.28)"
                    : "none",
                backdropFilter:
                  "blur(10px)",
              }}
            >
              {camera.isOnline ? (
                <VideocamRoundedIcon
                  sx={{
                    fontSize: 34,
                  }}
                />
              ) : (
                <VideocamOffRoundedIcon
                  sx={{
                    fontSize: 34,
                  }}
                />
              )}
            </Box>
          </>
        )}

        {/* DARK OVERLAY */}

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(2,6,23,.25), transparent 45%, rgba(2,6,23,.75))",
            pointerEvents: "none",
          }}
        />

        {/* TOP STATUS */}

        <Chip
          size="small"
          icon={
            camera.isOnline ? (
              <CheckCircleRoundedIcon />
            ) : (
              <WarningAmberRoundedIcon />
            )
          }
          label={
            camera.isOnline
              ? "LIVE"
              : "OFFLINE"
          }
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            fontWeight: 900,
            letterSpacing: ".04em",
            color: camera.isOnline
              ? "#BBF7D0"
              : "#FECACA",
            bgcolor: camera.isOnline
              ? "rgba(22,101,52,.86)"
              : "rgba(127,29,29,.86)",
            backdropFilter:
              "blur(10px)",

            "& .MuiChip-icon": {
              color: camera.isOnline
                ? "#22C55E"
                : "#EF4444",
            },
          }}
        />

        {/* AI STATUS */}

        {camera.aiEnabled && (
          <Chip
            size="small"
            icon={
              <MemoryRoundedIcon />
            }
            label="AI ACTIVE"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              fontWeight: 900,
              color: "#DDD6FE",
              bgcolor:
                "rgba(76,29,149,.86)",
              backdropFilter:
                "blur(10px)",

              "& .MuiChip-icon": {
                color: "#A78BFA",
              },
            }}
          />
        )}

        {/* LIVE INDICATOR */}

        {camera.isStreaming && (
          <Box
            sx={{
              position: "absolute",
              top: 54,
              left: 14,
              display: "flex",
              alignItems: "center",
              gap: 0.7,
              px: 1,
              py: 0.45,
              borderRadius: 2,
              bgcolor:
                "rgba(2,6,23,.72)",
              backdropFilter:
                "blur(8px)",
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: "#EF4444",
                boxShadow:
                  "0 0 10px #EF4444",
                animation:
                  "liveBlink 1.2s infinite",

                "@keyframes liveBlink": {
                  "0%,100%": {
                    opacity: 1,
                  },
                  "50%": {
                    opacity: 0.35,
                  },
                },
              }}
            />

            <Typography
              sx={{
                color: "#F8FAFC",
                fontSize: ".62rem",
                fontWeight: 900,
              }}
            >
              REC
            </Typography>
          </Box>
        )}

        {/* FPS */}

        {camera.isOnline && (
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              left: 12,
              px: 1.1,
              py: 0.55,
              borderRadius: 2,
              bgcolor:
                "rgba(2,6,23,.78)",
              color: "#E2E8F0",
              fontSize: ".68rem",
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              backdropFilter:
                "blur(8px)",
            }}
          >
            <SpeedRoundedIcon
              sx={{
                fontSize: 14,
              }}
            />

            {camera.fps} FPS
          </Box>
        )}

        {/* RESOLUTION */}

        <Box
          sx={{
            position: "absolute",
            bottom: 12,
            right: 12,
            px: 1.1,
            py: 0.55,
            borderRadius: 2,
            bgcolor:
              "rgba(2,6,23,.78)",
            color: "#E2E8F0",
            fontSize: ".68rem",
            fontWeight: 900,
            backdropFilter:
              "blur(8px)",
          }}
        >
          {camera.resolution}
        </Box>
      </Box>

      {/* =====================================================
          CAMERA INFORMATION
      ===================================================== */}

      <CardContent
        sx={{
          p: 2.2,
          "&:last-child": {
            pb: 2.2,
          },
        }}
      >
        {/* NAME */}

        <Box
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontWeight: 850,
                fontSize: "1rem",
                overflow: "hidden",
                textOverflow:
                  "ellipsis",
                whiteSpace:
                  "nowrap",
              }}
            >
              {camera.name}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.35,
                color:
                  "text.secondary",
                overflow: "hidden",
                textOverflow:
                  "ellipsis",
                whiteSpace:
                  "nowrap",
              }}
            >
              {camera.location}
            </Typography>
          </Box>

          {camera.isOnline ? (
            <WifiRoundedIcon
              sx={{
                color:
                  "success.main",
                flexShrink: 0,
              }}
            />
          ) : (
            <WifiOffRoundedIcon
              sx={{
                color:
                  "error.main",
                flexShrink: 0,
              }}
            />
          )}
        </Box>

        <Divider
          sx={{
            my: 1.8,
          }}
        />

        {/* DETAILS */}

        <Stack spacing={1.05}>
          <InfoRow
            icon={
              <SettingsInputAntennaRoundedIcon />
            }
            label="Stream"
            value={
              camera.streamType
            }
          />

          <InfoRow
            icon={
              <SpeedRoundedIcon />
            }
            label="Frame Rate"
            value={`${camera.fps} FPS`}
          />

          <InfoRow
            icon={
              <MemoryRoundedIcon />
            }
            label="AI Detection"
            value={
              camera.aiEnabled
                ? "Enabled"
                : "Disabled"
            }
            valueColor={
              camera.aiEnabled
                ? "success.main"
                : "text.secondary"
            }
          />
        </Stack>

        {/* HEALTH BAR */}

        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent:
                "space-between",
              mb: 0.55,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color:
                  "text.secondary",
                fontWeight: 700,
              }}
            >
              Camera Health
            </Typography>

            <Typography
              variant="caption"
              sx={{
                fontWeight: 900,
                color:
                  camera.isOnline
                    ? "success.main"
                    : "error.main",
              }}
            >
              {camera.isOnline
                ? "Stable"
                : "Disconnected"}
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={
              camera.isOnline
                ? camera.aiEnabled
                  ? 96
                  : 88
                : 18
            }
            sx={{
              height: 6,
              borderRadius: 10,
              bgcolor:
                "action.hover",

              "& .MuiLinearProgress-bar": {
                borderRadius: 10,
              },
            }}
          />
        </Box>

        {/* ACTIONS */}

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 2,
          }}
        >
          {camera.isStreaming ? (
            <Button
              fullWidth
              size="small"
              variant="outlined"
              color="error"
              disabled={busy}
              startIcon={
                actionLoading[
                  stopKey
                ] ? (
                  <CircularProgress
                    size={15}
                  />
                ) : (
                  <StopRoundedIcon />
                )
              }
              onClick={() =>
                onAction(
                  camera,
                  "stop"
                )
              }
              sx={{
                borderRadius: 2.5,
                fontWeight: 800,
              }}
            >
              Stop
            </Button>
          ) : (
            <Button
              fullWidth
              size="small"
              variant="contained"
              disabled={busy}
              startIcon={
                actionLoading[
                  startKey
                ] ? (
                  <CircularProgress
                    size={15}
                  />
                ) : (
                  <PlayArrowRoundedIcon />
                )
              }
              onClick={() =>
                onAction(
                  camera,
                  "start"
                )
              }
              sx={{
                borderRadius: 2.5,
                fontWeight: 800,
                boxShadow:
                  "0 6px 16px rgba(37,99,235,.22)",
              }}
            >
              Start
            </Button>
          )}

          <Button
            fullWidth
            size="small"
            variant="outlined"
            disabled={busy}
            startIcon={
              actionLoading[
                reconnectKey
              ] ? (
                <CircularProgress
                  size={15}
                />
              ) : (
                <ReplayRoundedIcon />
              )
            }
            onClick={() =>
              onAction(
                camera,
                "reconnect"
              )
            }
            sx={{
              borderRadius: 2.5,
              fontWeight: 800,
            }}
          >
            Reconnect
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}