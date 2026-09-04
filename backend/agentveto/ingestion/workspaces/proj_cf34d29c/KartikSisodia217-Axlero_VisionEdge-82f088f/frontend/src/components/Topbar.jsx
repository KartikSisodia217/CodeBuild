import { useEffect, useState } from "react";

import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
  Tooltip,
} from "@mui/material";

import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";

function Topbar({ setActivePage }) {
  const [anchorEl, setAnchorEl] =
    useState(null);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [darkMode, setDarkMode] =
    useState(() => {
      return (
        localStorage.getItem(
          "visionedge-theme"
        ) === "dark"
      );
    });

  const menuOpen = Boolean(anchorEl);

  // ============================================================
  // THEME
  // ============================================================

  useEffect(() => {
    const handleThemeChanged = (event) => {
      const newTheme = event.detail;

      setDarkMode(newTheme === "dark");
    };

    window.addEventListener(
      "visionedge-theme-change",
      handleThemeChanged
    );

    return () => {
      window.removeEventListener(
        "visionedge-theme-change",
        handleThemeChanged
      );
    };
  }, []);

  const handleThemeToggle = () => {
    const newMode = darkMode
      ? "light"
      : "dark";

    // Save preference
    localStorage.setItem(
      "visionedge-theme",
      newMode
    );

    // Update Topbar immediately
    setDarkMode(newMode === "dark");

    // Tell main.jsx to update MUI ThemeProvider
    window.dispatchEvent(
      new CustomEvent(
        "visionedge-theme-change",
        {
          detail: newMode,
        }
      )
    );
  };

  // ============================================================
  // PROFILE MENU
  // ============================================================

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const handleNavigation = (page) => {
    setActivePage(page);

    handleProfileMenuClose();

    setSearchOpen(false);
    setSearch("");
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const clearSearch = () => {
    setSearch("");
  };

  const handleSearchKeyDown = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const query =
      search.trim().toLowerCase();

    if (!query) {
      return;
    }

    if (
      query.includes("dashboard") ||
      query.includes("home")
    ) {
      handleNavigation("dashboard");
    } else if (
      query.includes("stream")
    ) {
      handleNavigation("streams");
    } else if (
      query.includes("camera")
    ) {
      handleNavigation(
        "camera-monitoring"
      );
    } else if (
      query.includes("security") ||
      query.includes("alert")
    ) {
      handleNavigation(
        "security-alerts"
      );
    } else if (
      query.includes("activity") ||
      query.includes("log")
    ) {
      handleNavigation(
        "activity-logs"
      );
    } else if (
      query.includes("real time") ||
      query.includes("realtime") ||
      query.includes("live")
    ) {
      handleNavigation(
        "real-time-monitoring"
      );
    } else if (
      query.includes("setting")
    ) {
      handleNavigation("settings");
    } else if (
      query.includes("profile") ||
      query.includes("user")
    ) {
      handleNavigation("user");
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor:
          "background.paper",

        color: "text.primary",

        borderBottom: 1,
        borderColor: "divider",

        zIndex: 1100,

        transition:
          "background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease",
      }}
    >
      <Toolbar
        sx={{
          minHeight:
            "72px !important",

          px: {
            xs: 2,
            sm: 3,
            md: 4,
          },

          display: "flex",
          justifyContent:
            "space-between",

          gap: 2,
        }}
      >
        {/* LEFT */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            minWidth: 0,
            flex: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "1rem",
                sm: "1.15rem",
              },

              fontWeight: 800,

              color: "text.primary",

              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            VisionEdge AI Video Intelligence
          </Typography>
        </Box>

        {/* RIGHT */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: {
              xs: 0.5,
              sm: 1,
            },
          }}
        >
          {/* SEARCH */}

          {searchOpen ? (
            <TextField
              autoFocus
              size="small"
              value={search}
              onChange={
                handleSearchChange
              }
              onKeyDown={
                handleSearchKeyDown
              }
              placeholder="Search VisionEdge..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon
                      sx={{
                        color:
                          "text.secondary",
                      }}
                    />
                  </InputAdornment>
                ),

                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={
                        clearSearch
                      }
                      sx={{
                        color:
                          "text.secondary",
                      }}
                    >
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                width: {
                  xs: 180,
                  sm: 260,
                  md: 320,
                },

                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,

                  backgroundColor:
                    "background.default",

                  color:
                    "text.primary",

                  "& fieldset": {
                    borderColor:
                      "divider",
                  },

                  "&:hover fieldset": {
                    borderColor:
                      "text.secondary",
                  },

                  "&.Mui-focused fieldset": {
                    borderColor:
                      "primary.main",
                  },
                },

                "& input": {
                  color:
                    "text.primary",
                },

                "& input::placeholder": {
                  color:
                    "text.secondary",
                  opacity: 1,
                },
              }}
            />
          ) : (
            <Tooltip title="Search">
              <IconButton
                onClick={() =>
                  setSearchOpen(true)
                }
                sx={{
                  width: 42,
                  height: 42,
                  color:
                    "text.secondary",
                  borderRadius: 2.5,

                  "&:hover": {
                    backgroundColor:
                      "action.hover",
                    color:
                      "primary.main",
                  },
                }}
              >
                <SearchRoundedIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* ==================================================
              THEME TOGGLE
          ================================================== */}

          <Tooltip
            title={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            <IconButton
              onClick={
                handleThemeToggle
              }
              aria-label="Toggle dark light theme"
              sx={{
                width: 42,
                height: 42,

                color:
                  darkMode
                    ? "#FACC15"
                    : "text.secondary",

                borderRadius: 2.5,

                "&:hover": {
                  backgroundColor:
                    "action.hover",

                  color:
                    darkMode
                      ? "#FDE047"
                      : "primary.main",
                },
              }}
            >
              {darkMode ? (
                <LightModeRoundedIcon />
              ) : (
                <DarkModeRoundedIcon />
              )}
            </IconButton>
          </Tooltip>

          {/* NOTIFICATIONS */}

          <Tooltip title="Activity & Notifications">
            <IconButton
              onClick={() =>
                setActivePage(
                  "activity-logs"
                )
              }
              sx={{
                width: 42,
                height: 42,

                color:
                  "text.secondary",

                borderRadius: 2.5,

                "&:hover": {
                  backgroundColor:
                    "action.hover",
                  color:
                    "primary.main",
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <NotificationsNoneRoundedIcon />

                <Box
                  sx={{
                    position:
                      "absolute",
                    top: -2,
                    right: -2,

                    width: 8,
                    height: 8,

                    borderRadius: "50%",

                    backgroundColor:
                      "#EF4444",

                    border: 2,

                    borderColor:
                      "background.paper",
                  }}
                />
              </Box>
            </IconButton>
          </Tooltip>

          {/* PROFILE */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              ml: {
                xs: 0.5,
                sm: 1,
              },
            }}
          >
            <IconButton
              onClick={
                handleProfileMenuOpen
              }
              sx={{
                p: 0.5,
                borderRadius: 3,

                "&:hover": {
                  backgroundColor:
                    "action.hover",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,

                  backgroundColor:
                    "primary.main",

                  fontSize: "0.9rem",
                  fontWeight: 800,
                }}
              >
                VE
              </Avatar>

              <Box
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },

                  textAlign: "left",
                  ml: 1,
                  mr: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize:
                      "0.82rem",
                    fontWeight: 800,
                    color:
                      "text.primary",
                    lineHeight: 1.2,
                  }}
                >
                  VisionEdge Admin
                </Typography>

                <Typography
                  sx={{
                    fontSize:
                      "0.7rem",
                    color:
                      "text.secondary",
                    mt: 0.2,
                  }}
                >
                  Administrator
                </Typography>
              </Box>

              <KeyboardArrowDownRoundedIcon
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },

                  color:
                    "text.secondary",

                  fontSize: 20,
                }}
              />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>

      {/* PROFILE MENU */}

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={
          handleProfileMenuClose
        }
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
            mt: 1,
            minWidth: 200,
            borderRadius: 3,
            border: 1,
            borderColor: "divider",

            backgroundColor:
              "background.paper",

            color: "text.primary",

            boxShadow:
              "0 12px 30px rgba(0,0,0,0.18)",
          },
        }}
      >
        <MenuItem
          onClick={() =>
            handleNavigation("user")
          }
          sx={{
            borderRadius: 2,
            mx: 0.5,
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          User Profile
        </MenuItem>

        <MenuItem
          onClick={() =>
            handleNavigation("settings")
          }
          sx={{
            borderRadius: 2,
            mx: 0.5,
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          Settings
        </MenuItem>
      </Menu>
    </AppBar>
  );
}

export default Topbar;