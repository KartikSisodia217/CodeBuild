import React from "react";

import {
  Box,
  Typography,
} from "@mui/material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

const menuItems = [
  {
    label: "Dashboard",
    page: "dashboard",
    icon: <DashboardRoundedIcon />,
  },
  {
    label: "Stream Management",
    page: "streams",
    icon: <VideocamRoundedIcon />,
  },
  {
    label: "Camera Monitoring",
    page: "camera-monitoring",
    icon: <CameraAltRoundedIcon />,
  },
  {
    label: "Security Alerts",
    page: "security-alerts",
    icon: <NotificationsRoundedIcon />,
  },
  {
    label: "Activity & Logs",
    page: "activity-logs",
    icon: <DescriptionRoundedIcon />,
  },
  {
    label: "Real-Time Monitoring",
    page: "real-time-monitoring",
    icon: <TimelineRoundedIcon />,
  },
  {
    label: "Settings",
    page: "settings",
    icon: <SettingsRoundedIcon />,
  },
  {
    label: "User",
    page: "user",
    icon: <PersonRoundedIcon />,
  },
];

function Sidebar({
  activePage,
  setActivePage,
}) {
  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        minHeight: "100vh",

        display: "flex",
        flexDirection: "column",

        bgcolor: "background.paper",

        borderRight: 1,
        borderColor: "divider",

        color: "text.primary",

        transition:
          "background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease",
      }}
    >
      {/* =====================================================
          LOGO
      ====================================================== */}

      <Box
        sx={{
          px: 3,
          py: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: "1.6rem",
            fontWeight: 900,
            color: "text.primary",

            transition: "color 0.25s ease",
          }}
        >
          VisionEdge
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: "0.8rem",
            color: "text.secondary",

            transition: "color 0.25s ease",
          }}
        >
          AI Video Intelligence
        </Typography>
      </Box>

      {/* =====================================================
          MENU
      ====================================================== */}

      <Box
        sx={{
          px: 1,
          pb: 2,
        }}
      >
        {menuItems.map((item) => {
          const isActive =
            activePage === item.page;

          return (
            <Box
              key={item.page}
              onClick={() =>
                setActivePage(item.page)
              }
              sx={{
                display: "flex",
                alignItems: "center",

                gap: 2,

                px: 2,
                py: 1.5,

                mb: 0.7,

                borderRadius: 3,

                cursor: "pointer",

                userSelect: "none",

                bgcolor: isActive
                  ? "primary.main"
                  : "transparent",

                color: isActive
                  ? "#FFFFFF"
                  : "text.secondary",

                transition:
                  "background-color 0.2s ease, color 0.2s ease, transform 0.15s ease",

                "&:hover": {
                  bgcolor: isActive
                    ? "primary.main"
                    : "action.hover",

                  color: isActive
                    ? "#FFFFFF"
                    : "text.primary",
                },

                "&:active": {
                  transform: "scale(0.99)",
                },
              }}
            >
              {/* ICON */}

              <Box
                sx={{
                  width: 24,
                  height: 24,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  flexShrink: 0,

                  color: "inherit",

                  "& svg": {
                    fontSize: 22,
                  },
                }}
              >
                {item.icon}
              </Box>

              {/* LABEL */}

              <Typography
                sx={{
                  fontSize: "0.95rem",

                  fontWeight: isActive
                    ? 700
                    : 500,

                  color: "inherit",

                  lineHeight: 1.3,

                  transition:
                    "color 0.2s ease",
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* =====================================================
          SPACER
      ====================================================== */}

      <Box sx={{ flex: 1 }} />

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <Box
        sx={{
          px: 3,
          py: 2,

          borderTop: 1,
          borderColor: "divider",

          bgcolor: "background.paper",

          transition:
            "background-color 0.25s ease, border-color 0.25s ease",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.72rem",
            color: "text.secondary",

            transition: "color 0.25s ease",
          }}
        >
          VisionEdge Platform
        </Typography>

        <Typography
          sx={{
            fontSize: "0.72rem",
            color: "text.disabled",

            mt: 0.3,

            transition: "color 0.25s ease",
          }}
        >
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );
}

export default Sidebar;