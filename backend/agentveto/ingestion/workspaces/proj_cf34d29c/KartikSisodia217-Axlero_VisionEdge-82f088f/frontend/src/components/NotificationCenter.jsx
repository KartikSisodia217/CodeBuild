import { useEffect, useState } from "react";

import {
  Badge,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  CircularProgress,
} from "@mui/material";

import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import activityService from "../services/activityService";

function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const data = await activityService.getActivityLogs();

      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Refresh notifications every 10 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getIcon = (level) => {
    switch (level?.toUpperCase()) {
      case "WARNING":
        return (
          <WarningAmberRoundedIcon
            sx={{
              color: "#F59E0B",
              fontSize: 22,
            }}
          />
        );

      case "ERROR":
      case "CRITICAL":
        return (
          <ErrorOutlineRoundedIcon
            sx={{
              color: "#EF4444",
              fontSize: 22,
            }}
          />
        );

      default:
        return (
          <InfoOutlinedIcon
            sx={{
              color: "#2563EB",
              fontSize: 22,
            }}
          />
        );
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) {
      return "Recently";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date.toLocaleString();
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          width: 42,
          height: 42,
          color: "#64748B",
          borderRadius: 2.5,

          "&:hover": {
            backgroundColor: "#F1F5F9",
            color: "#2563EB",
          },
        }}
      >
        <Badge
          badgeContent={notifications.length}
          color="error"
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.65rem",
              fontWeight: 800,
              minWidth: 18,
              height: 18,
            },
          }}
        >
          <NotificationsNoneRoundedIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: {
              xs: 320,
              sm: 390,
            },
            maxHeight: 500,
            borderRadius: 3,
            border: "1px solid #E2E8F0",
            boxShadow:
              "0 18px 45px rgba(15,23,42,0.15)",
            overflow: "hidden",
          },
        }}
      >
        {/* HEADER */}

        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 800,
                color: "#0F172A",
              }}
            >
              Notifications
            </Typography>

            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#64748B",
                mt: 0.3,
              }}
            >
              Recent system activity
            </Typography>
          </Box>

          <Box
            sx={{
              px: 1,
              py: 0.4,
              borderRadius: 2,
              backgroundColor: "#EFF6FF",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 800,
                color: "#2563EB",
              }}
            >
              {notifications.length} NEW
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* LOADING */}

        {loading && notifications.length === 0 && (
          <Box
            sx={{
              py: 5,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}

        {/* EMPTY */}

        {!loading && notifications.length === 0 && (
          <Box
            sx={{
              py: 5,
              px: 3,
              textAlign: "center",
            }}
          >
            <NotificationsNoneRoundedIcon
              sx={{
                fontSize: 42,
                color: "#CBD5E1",
                mb: 1,
              }}
            />

            <Typography
              sx={{
                fontWeight: 700,
                color: "#334155",
              }}
            >
              No notifications
            </Typography>

            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "#94A3B8",
                mt: 0.5,
              }}
            >
              You're all caught up.
            </Typography>
          </Box>
        )}

        {/* NOTIFICATIONS */}

        {notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            onClick={handleClose}
            sx={{
              px: 2.5,
              py: 1.8,
              alignItems: "flex-start",
              whiteSpace: "normal",

              "&:hover": {
                backgroundColor: "#F8FAFC",
              },
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                minWidth: 38,
                borderRadius: 2.5,
                backgroundColor: "#F8FAFC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 1.5,
              }}
            >
              {getIcon(notification.level)}
            </Box>

            <Box
              sx={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#334155",
                  lineHeight: 1.4,
                }}
              >
                {notification.message}
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: "#94A3B8",
                  mt: 0.6,
                }}
              >
                {formatTime(notification.timestamp)}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default NotificationCenter;