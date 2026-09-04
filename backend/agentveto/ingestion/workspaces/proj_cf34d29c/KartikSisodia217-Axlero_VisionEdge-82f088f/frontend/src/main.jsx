import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import {
  ThemeProvider,
  CssBaseline,
  createTheme,
} from "@mui/material";

import App from "./App";

import {
  VisionEdgeProvider,
} from "./context/VisionEdgeContext";

import "./index.css";

function AppRoot() {
  // ============================================================
  // THEME MODE
  // ============================================================

  const [mode, setMode] = useState(() => {
    return (
      localStorage.getItem("visionedge-theme") ||
      "light"
    );
  });

  // ============================================================
  // LISTEN FOR THEME CHANGES
  // ============================================================

  useEffect(() => {
    const handleThemeChange = (event) => {
      const newTheme = event.detail;

      if (
        newTheme === "dark" ||
        newTheme === "light"
      ) {
        setMode(newTheme);
      }
    };

    window.addEventListener(
      "visionedge-theme-change",
      handleThemeChange
    );

    return () => {
      window.removeEventListener(
        "visionedge-theme-change",
        handleThemeChange
      );
    };
  }, []);

  // ============================================================
  // MUI THEME
  // ============================================================

  const theme = createTheme({
    palette: {
      mode,

      primary: {
        main: "#2563EB",
      },

      secondary: {
        main: "#7C3AED",
      },

      success: {
        main: "#16A34A",
      },

      error: {
        main: "#DC2626",
      },

      warning: {
        main: "#D97706",
      },

      background: {
        default:
          mode === "dark"
            ? "#070D1D"
            : "#F6F8FC",

        paper:
          mode === "dark"
            ? "#10182B"
            : "#FFFFFF",
      },

      text: {
        primary:
          mode === "dark"
            ? "#F8FAFC"
            : "#111827",

        secondary:
          mode === "dark"
            ? "#94A3B8"
            : "#64748B",

        disabled:
          mode === "dark"
            ? "#64748B"
            : "#94A3B8",
      },

      divider:
        mode === "dark"
          ? "rgba(148,163,184,0.16)"
          : "rgba(15,23,42,0.10)",

      action: {
        hover:
          mode === "dark"
            ? "rgba(255,255,255,0.07)"
            : "rgba(15,23,42,0.05)",

        selected:
          mode === "dark"
            ? "rgba(37,99,235,0.20)"
            : "rgba(37,99,235,0.10)",

        disabled:
          mode === "dark"
            ? "rgba(148,163,184,0.20)"
            : "rgba(15,23,42,0.12)",
      },
    },

    shape: {
      borderRadius: 16,
    },

    typography: {
      fontFamily:
        '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

      h1: {
        fontWeight: 800,
      },

      h2: {
        fontWeight: 800,
      },

      h3: {
        fontWeight: 800,
      },

      h4: {
        fontWeight: 800,
      },

      h5: {
        fontWeight: 800,
      },

      h6: {
        fontWeight: 800,
      },
    },

    components: {
      // ========================================================
      // CARD
      // ========================================================

      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",

            transition:
              "background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease",
          },
        },
      },

      // ========================================================
      // PAPER
      // ========================================================

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },

      // ========================================================
      // APPBAR
      // ========================================================

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },

      // ========================================================
      // DIALOG
      // ========================================================

      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor:
              mode === "dark"
                ? "#10182B"
                : "#FFFFFF",
          },
        },
      },

      // ========================================================
      // MENU
      // ========================================================

      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
          },
        },
      },

      // ========================================================
      // TEXT FIELD
      // ========================================================

      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
      },

      // ========================================================
      // BUTTON
      // ========================================================

      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 700,
          },
        },
      },

      // ========================================================
      // CHIP
      // ========================================================

      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          },
        },
      },

      // ========================================================
      // TOOLTIP
      // ========================================================

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: "0.75rem",
          },
        },
      },
    },
  });

  // ============================================================
  // APPLICATION
  // ============================================================

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <VisionEdgeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </VisionEdgeProvider>
    </ThemeProvider>
  );
}

// ==============================================================
// ROOT
// ==============================================================

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <AppRoot />
  </React.StrictMode>
);