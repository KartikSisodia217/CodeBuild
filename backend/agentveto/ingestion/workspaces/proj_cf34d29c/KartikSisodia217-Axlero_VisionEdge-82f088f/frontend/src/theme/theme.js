import { createTheme } from "@mui/material/styles";

const getTheme = (mode = "light") => {
  const isDark = mode === "dark";

  return createTheme({
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

      warning: {
        main: "#F59E0B",
      },

      error: {
        main: "#DC2626",
      },

      background: {
        default: isDark ? "#020617" : "#F8FAFC",
        paper: isDark ? "#0F172A" : "#FFFFFF",
      },

      text: {
        primary: isDark ? "#F8FAFC" : "#0F172A",
        secondary: isDark ? "#94A3B8" : "#64748B",
      },

      divider: isDark ? "#1E293B" : "#E2E8F0",

      action: {
        hover: isDark
          ? "rgba(255,255,255,0.06)"
          : "rgba(15,23,42,0.04)",
        selected: isDark
          ? "rgba(37,99,235,0.18)"
          : "rgba(37,99,235,0.08)",
      },
    },

    typography: {
      fontFamily: [
        "Inter",
        "Roboto",
        "Arial",
        "sans-serif",
      ].join(","),
    },

    shape: {
      borderRadius: 12,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            backgroundColor: isDark ? "#020617" : "#F8FAFC",
          },

          body: {
            margin: 0,
            backgroundColor: isDark ? "#020617" : "#F8FAFC",
            color: isDark ? "#F8FAFC" : "#0F172A",
            transition:
              "background-color 0.25s ease, color 0.25s ease",
          },

          "#root": {
            minHeight: "100vh",
            backgroundColor: isDark ? "#020617" : "#F8FAFC",
          },

          "*": {
            boxSizing: "border-box",
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 10,
          },
        },
      },

      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            "&.Mui-checked": {
              color: "#2563EB",
            },

            "&.Mui-checked + .MuiSwitch-track": {
              backgroundColor: "#2563EB",
            },
          },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
          },
        },
      },
    },
  });
};

export default getTheme;