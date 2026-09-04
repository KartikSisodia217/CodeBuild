import { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Grid,
  Switch,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

function Settings() {
  const defaultSettings = {
    aiDetection: true,
    notifications: true,
    securityAlerts: true,
    autoReconnect: true,
  };

  const [settings, setSettings] =
    useState(defaultSettings);

  const [inferenceMode, setInferenceMode] =
    useState("TensorRT");

  const [saved, setSaved] =
    useState(false);

  // ============================================================
  // LOAD SETTINGS
  // ============================================================

  useEffect(() => {
    try {
      const storedSettings =
        localStorage.getItem(
          "visionEdgeSettings"
        );

      if (!storedSettings) {
        return;
      }

      const parsed =
        JSON.parse(storedSettings);

      setSettings({
        ...defaultSettings,
        ...parsed,
      });

      if (parsed.inferenceMode) {
        setInferenceMode(
          parsed.inferenceMode
        );
      }
    } catch (error) {
      console.error(
        "Failed to load settings:",
        error
      );
    }
  }, []);

  // ============================================================
  // TOGGLE
  // ============================================================

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setSaved(false);
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSave = () => {
    localStorage.setItem(
      "visionEdgeSettings",
      JSON.stringify({
        ...settings,
        inferenceMode,
      })
    );

    setSaved(true);
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset all VisionEdge settings to their default values?"
    );

    if (!confirmed) {
      return;
    }

    // Reset settings
    setSettings(defaultSettings);

    setInferenceMode("TensorRT");

    // Remove saved configuration
    localStorage.removeItem(
      "visionEdgeSettings"
    );

    // Reset global application theme
    localStorage.setItem(
      "visionedge-theme",
      "light"
    );

    // Notify main.jsx
    window.dispatchEvent(
      new CustomEvent(
        "visionedge-theme-change",
        {
          detail: "light",
        }
      )
    );

    setSaved(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        p: {
          xs: 2,
          md: 4,
        },

        backgroundColor:
          "background.default",

        color: "text.primary",

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
          justifyContent:
            "space-between",

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
                width: 50,
                height: 50,
                borderRadius: 3,

                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",

                backgroundColor:
                  "action.hover",

                color:
                  "primary.main",
              }}
            >
              <SettingsRoundedIcon />
            </Box>

            <Box>
              <Typography
                sx={{
                  color:
                    "text.primary",

                  fontSize: {
                    xs: "1.7rem",
                    md: "2.2rem",
                  },

                  fontWeight: 800,
                  lineHeight: 1.15,
                }}
              >
                Settings
              </Typography>

              <Typography
                sx={{
                  color:
                    "text.secondary",

                  mt: 0.5,
                }}
              >
                Configure VisionEdge
                platform and monitoring
                preferences
              </Typography>
            </Box>
          </Box>
        </Box>

        <Chip
          icon={
            <CheckCircleRoundedIcon />
          }
          label="System Active"
          sx={{
            fontWeight: 700,

            color:
              "#15803D",

            backgroundColor:
              "#DCFCE7",
          }}
        />
      </Box>

      {/* ======================================================
          SETTINGS GRID
      ====================================================== */}

      <Grid
        container
        spacing={3}
      >
        {/* AI CONFIGURATION */}

        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <SettingsCard
            icon={
              <MemoryRoundedIcon />
            }
            title="AI Configuration"
            subtitle="Configure AI inference and detection"
          >
            <SettingRow
              title="AI Object Detection"
              description="Enable real-time object detection"
              checked={
                settings.aiDetection
              }
              onChange={() =>
                handleToggle(
                  "aiDetection"
                )
              }
            />

            <Divider
              sx={{
                my: 2.5,
              }}
            />

            <Box>
              <Typography
                fontWeight={700}
                sx={{
                  color:
                    "text.primary",
                  mb: 0.5,
                }}
              >
                Inference Engine
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color:
                    "text.secondary",
                  mb: 1.5,
                }}
              >
                Select the AI inference
                backend
              </Typography>

              <FormControl
                size="small"
                sx={{
                  minWidth: 200,
                }}
              >
                <Select
                  value={
                    inferenceMode
                  }
                  onChange={(event) => {
                    setInferenceMode(
                      event.target.value
                    );

                    setSaved(false);
                  }}
                  sx={{
                    borderRadius: 2.5,
                  }}
                >
                  <MenuItem value="TensorRT">
                    TensorRT
                  </MenuItem>

                  <MenuItem value="CUDA">
                    CUDA
                  </MenuItem>

                  <MenuItem value="CPU">
                    CPU
                  </MenuItem>
                </Select>
              </FormControl>

              <Box
                sx={{
                  mt: 1.5,
                }}
              >
                <Chip
                  label={`Active: ${inferenceMode}`}
                  size="small"
                  sx={{
                    fontWeight: 700,

                    color:
                      "#6D28D9",

                    backgroundColor:
                      "#F5F3FF",
                  }}
                />
              </Box>
            </Box>
          </SettingsCard>
        </Grid>

        {/* SECURITY */}

        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <SettingsCard
            icon={
              <SecurityRoundedIcon />
            }
            title="Security"
            subtitle="Manage security monitoring"
          >
            <SettingRow
              title="Security Alerts"
              description="Enable suspicious activity alerts"
              checked={
                settings.securityAlerts
              }
              onChange={() =>
                handleToggle(
                  "securityAlerts"
                )
              }
            />

            <Divider
              sx={{
                my: 2.5,
              }}
            />

            <SettingRow
              title="Automatic Stream Reconnect"
              description="Reconnect cameras when connection is lost"
              checked={
                settings.autoReconnect
              }
              onChange={() =>
                handleToggle(
                  "autoReconnect"
                )
              }
            />

            <Box
              sx={{
                mt: 2.5,
                p: 1.8,
                borderRadius: 3,

                backgroundColor:
                  "rgba(245,158,11,0.10)",

                border:
                  "1px solid rgba(245,158,11,0.25)",
              }}
            >
              <Typography
                sx={{
                  fontSize:
                    "0.78rem",

                  color:
                    "text.secondary",

                  fontWeight: 600,
                }}
              >
                Security monitoring is
                continuously active while
                the platform is running.
              </Typography>
            </Box>
          </SettingsCard>
        </Grid>

        {/* NOTIFICATIONS */}

        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <SettingsCard
            icon={
              <NotificationsRoundedIcon />
            }
            title="Notifications"
            subtitle="Configure system notifications"
          >
            <SettingRow
              title="System Notifications"
              description="Receive important system notifications"
              checked={
                settings.notifications
              }
              onChange={() =>
                handleToggle(
                  "notifications"
                )
              }
            />

            <Divider
              sx={{
                my: 2.5,
              }}
            />

            <Box
              sx={{
                p: 2,
                borderRadius: 3,

                backgroundColor:
                  "action.hover",

                border: "1px solid",
                borderColor:
                  "divider",
              }}
            >
              <Typography
                fontWeight={700}
                sx={{
                  color:
                    "text.primary",
                  mb: 0.5,
                }}
              >
                Notification Status
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color:
                    "text.secondary",
                }}
              >
                {settings.notifications
                  ? "Notifications are enabled."
                  : "Notifications are currently disabled."}
              </Typography>
            </Box>
          </SettingsCard>
        </Grid>

        {/* PLATFORM */}

        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <SettingsCard
            icon={
              <SettingsRoundedIcon />
            }
            title="Platform"
            subtitle="VisionEdge platform information"
          >
            <InfoRow
              label="Platform"
              value="VisionEdge"
            />

            <InfoRow
              label="Version"
              value="1.0.0"
            />

            <InfoRow
              label="Inference"
              value={
                inferenceMode
              }
            />

            <InfoRow
              label="AI Detection"
              value={
                settings.aiDetection
                  ? "Enabled"
                  : "Disabled"
              }
            />

            <InfoRow
              label="Monitoring"
              value="Active"
            />

            <InfoRow
              label="Stream Reconnect"
              value={
                settings.autoReconnect
                  ? "Enabled"
                  : "Disabled"
              }
              last
            />
          </SettingsCard>
        </Grid>
      </Grid>

      {/* ======================================================
          ACTION BAR
      ====================================================== */}

      <Box
        sx={{
          mt: 4,
          p: 2.5,
          borderRadius: 4,

          backgroundColor:
            "background.paper",

          border: "1px solid",
          borderColor: "divider",

          display: "flex",
          justifyContent:
            "space-between",

          alignItems: "center",

          flexDirection: {
            xs: "column",
            sm: "row",
          },

          gap: 2,
        }}
      >
        <Box>
          <Typography
            fontWeight={700}
            sx={{
              color:
                "text.primary",
            }}
          >
            Configuration
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color:
                "text.secondary",
              mt: 0.3,
            }}
          >
            Save your VisionEdge
            monitoring preferences.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            startIcon={
              <RestartAltRoundedIcon />
            }
            onClick={handleReset}
            sx={{
              borderRadius: 2.5,
              textTransform:
                "none",
              fontWeight: 700,
              px: 2.5,
            }}
          >
            Reset
          </Button>

          <Button
            variant="contained"
            startIcon={
              <SaveRoundedIcon />
            }
            onClick={handleSave}
            sx={{
              borderRadius: 2.5,
              textTransform:
                "none",
              fontWeight: 700,
              px: 3,

              boxShadow:
                "0 8px 20px rgba(37,99,235,.22)",
            }}
          >
            Save Settings
          </Button>
        </Box>
      </Box>

      {/* SAVE MESSAGE */}

      <Snackbar
        open={saved}
        autoHideDuration={2500}
        onClose={() =>
          setSaved(false)
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() =>
            setSaved(false)
          }
          sx={{
            borderRadius: 3,
            fontWeight: 600,
          }}
        >
          Settings saved successfully.
        </Alert>
      </Snackbar>
    </Box>
  );
}

// =============================================================
// SETTINGS CARD
// =============================================================

function SettingsCard({
  icon,
  title,
  subtitle,
  children,
}) {
  return (
    <Box
      sx={{
        height: "100%",
        p: 3,
        borderRadius: 4,

        backgroundColor:
          "background.paper",

        border: "1px solid",
        borderColor: "divider",

        boxShadow:
          "0 8px 24px rgba(15,23,42,0.05)",

        transition:
          "transform .25s ease, box-shadow .25s ease",

        "&:hover": {
          transform:
            "translateY(-4px)",

          boxShadow:
            "0 16px 35px rgba(15,23,42,0.09)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 3,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,

            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",

            color:
              "primary.main",

            backgroundColor:
              "action.hover",
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            fontWeight={800}
            sx={{
              color:
                "text.primary",
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color:
                "text.secondary",
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>

      {children}
    </Box>
  );
}

// =============================================================
// SETTING ROW
// =============================================================

function SettingRow({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",

        gap: 2,
      }}
    >
      <Box
        sx={{
          minWidth: 0,
        }}
      >
        <Typography
          fontWeight={700}
          sx={{
            color:
              "text.primary",
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color:
              "text.secondary",
            mt: 0.3,
          }}
        >
          {description}
        </Typography>
      </Box>

      <Switch
        checked={checked}
        onChange={onChange}
        sx={{
          flexShrink: 0,

          "& .MuiSwitch-switchBase.Mui-checked":
            {
              color:
                "#2563EB",
            },

          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
            {
              backgroundColor:
                "#2563EB",
            },
        }}
      />
    </Box>
  );
}

// =============================================================
// INFO ROW
// =============================================================

function InfoRow({
  label,
  value,
  last = false,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent:
          "space-between",

        alignItems: "center",

        gap: 2,

        py: 1.4,

        borderBottom: last
          ? "none"
          : "1px solid",

        borderColor:
          "divider",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color:
            "text.secondary",
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>

      <Typography
        fontWeight={700}
        sx={{
          color:
            "text.primary",

          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default Settings;