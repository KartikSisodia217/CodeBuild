import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Card,
  Chip,
  InputAdornment,
} from "@mui/material";

import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";

import LogTable from "../components/LogTable";
import { logService } from "../services/logService";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [dateRange, setDateRange] = useState("today");
  const [loading, setLoading] = useState(false);
  const [liveMode, setLiveMode] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);

      const data = await logService.getLogs();

      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // LIVE LOG MONITORING
  useEffect(() => {
    if (!liveMode) {
      return;
    }

    const interval = setInterval(() => {
      loadLogs();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [liveMode]);

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (log) =>
          log.id?.toLowerCase().includes(query) ||
          log.event?.toLowerCase().includes(query) ||
          log.camera?.toLowerCase().includes(query) ||
          log.severity?.toLowerCase().includes(query)
      );
    }

    if (severity !== "all") {
      result = result.filter(
        (log) =>
          log.severity?.toLowerCase() ===
          severity.toLowerCase()
      );
    }

    return result;
  }, [logs, search, severity]);

  const clearFilters = () => {
    setSearch("");
    setSeverity("all");
    setDateRange("today");
  };

  const exportLogs = () => {
    if (!filteredLogs.length) {
      return;
    }

    const headers = [
      "ID",
      "Event",
      "Camera",
      "Severity",
      "Time",
    ];

    const rows = filteredLogs.map((log) => [
      log.id,
      log.event,
      log.camera,
      log.severity,
      log.time,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download =
      "visionedge-security-logs.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const totalLogs = logs.length;

  const criticalLogs = logs.filter(
    (log) => log.severity === "Critical"
  ).length;

  const highLogs = logs.filter(
    (log) => log.severity === "High"
  ).length;

  const mediumLogs = logs.filter(
    (log) => log.severity === "Medium"
  ).length;

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 4,
        },
        minHeight: "calc(100vh - 80px)",
        backgroundColor: "#F8FAFC",
      }}
    >
      {/* HEADER */}

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
          <Typography
            sx={{
              fontSize: {
                xs: "1.8rem",
                md: "2.2rem",
              },
              fontWeight: 800,
              color: "#0F172A",
            }}
          >
            Security Logs
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: "#64748B",
            }}
          >
            Monitor AI Detection Events &
            System Activities
          </Typography>
        </Box>

        {/* ACTIONS */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          {/* LIVE STATUS */}

          <Button
            variant={liveMode ? "contained" : "outlined"}
            startIcon={
              <FiberManualRecordRoundedIcon
                sx={{
                  fontSize: "12px !important",
                  animation: liveMode
                    ? "livePulse 1.5s infinite"
                    : "none",

                  "@keyframes livePulse": {
                    "0%": {
                      opacity: 1,
                    },
                    "50%": {
                      opacity: 0.35,
                    },
                    "100%": {
                      opacity: 1,
                    },
                  },
                }}
              />
            }
            onClick={() =>
              setLiveMode((previous) => !previous)
            }
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,

              backgroundColor: liveMode
                ? "#16A34A"
                : "transparent",

              borderColor: "#16A34A",

              color: liveMode
                ? "#FFFFFF"
                : "#16A34A",

              "&:hover": {
                backgroundColor: liveMode
                  ? "#15803D"
                  : "#F0FDF4",
              },
            }}
          >
            {liveMode ? "LIVE" : "LIVE OFF"}
          </Button>

          {/* REFRESH */}

          <Button
            variant="outlined"
            startIcon={
              <RefreshRoundedIcon
                sx={{
                  animation: loading
                    ? "spin 1s linear infinite"
                    : "none",

                  "@keyframes spin": {
                    from: {
                      transform: "rotate(0deg)",
                    },
                    to: {
                      transform: "rotate(360deg)",
                    },
                  },
                }}
              />
            }
            onClick={loadLogs}
            disabled={loading}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Refresh
          </Button>

          {/* EXPORT */}

          <Button
            variant="contained"
            startIcon={
              <DownloadRoundedIcon />
            }
            onClick={exportLogs}
            disabled={!filteredLogs.length}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: "#2563EB",

              "&:hover": {
                backgroundColor: "#1D4ED8",
              },
            }}
          >
            Export Logs
          </Button>
        </Box>
      </Box>

      {/* LIVE STATUS BAR */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          px: 2.5,
          py: 1.5,
          borderRadius: 3,
          border: "1px solid #DCFCE7",
          backgroundColor: "#F0FDF4",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <FiberManualRecordRoundedIcon
            sx={{
              fontSize: 12,
              color: liveMode
                ? "#16A34A"
                : "#94A3B8",
              animation: liveMode
                ? "pulse 1.5s infinite"
                : "none",

              "@keyframes pulse": {
                "0%": {
                  opacity: 1,
                  transform: "scale(1)",
                },
                "50%": {
                  opacity: 0.35,
                  transform: "scale(0.75)",
                },
                "100%": {
                  opacity: 1,
                  transform: "scale(1)",
                },
              },
            }}
          />

          <Typography
            sx={{
              color: liveMode
                ? "#166534"
                : "#64748B",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}
          >
            {liveMode
              ? "Live monitoring active — logs refresh automatically"
              : "Live monitoring paused"}
          </Typography>
        </Box>
      </Card>

      {/* STAT CARDS */}

      <Grid
        container
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: "1px solid #E2E8F0",
            }}
          >
            <Typography
              color="text.secondary"
              fontSize="0.85rem"
              fontWeight={600}
            >
              Total Logs
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: "2rem",
                fontWeight: 800,
                color: "#0F172A",
              }}
            >
              {totalLogs}
            </Typography>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: "1px solid #FECACA",
            }}
          >
            <Typography
              color="text.secondary"
              fontSize="0.85rem"
              fontWeight={600}
            >
              Critical
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: "2rem",
                fontWeight: 800,
                color: "#DC2626",
              }}
            >
              {criticalLogs}
            </Typography>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: "1px solid #FED7AA",
            }}
          >
            <Typography
              color="text.secondary"
              fontSize="0.85rem"
              fontWeight={600}
            >
              High Severity
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: "2rem",
                fontWeight: 800,
                color: "#EA580C",
              }}
            >
              {highLogs}
            </Typography>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: "1px solid #FDE68A",
            }}
          >
            <Typography
              color="text.secondary"
              fontSize="0.85rem"
              fontWeight={600}
            >
              Medium
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: "2rem",
                fontWeight: 800,
                color: "#D97706",
              }}
            >
              {mediumLogs}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* FILTERS */}

      <Card
        elevation={0}
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 4,
          border: "1px solid #E2E8F0",
        }}
      >
        <Grid
          container
          spacing={2}
        >
          <Grid
            size={{
              xs: 12,
              md: 5,
            }}
          >
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search logs..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon
                      sx={{
                        color: "#94A3B8",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "#F8FAFC",
                },
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <TextField
              fullWidth
              select
              size="small"
              value={severity}
              onChange={(event) =>
                setSeverity(
                  event.target.value
                )
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "#F8FAFC",
                },
              }}
            >
              <MenuItem value="all">
                All Severity
              </MenuItem>

              <MenuItem value="low">
                Low
              </MenuItem>

              <MenuItem value="medium">
                Medium
              </MenuItem>

              <MenuItem value="high">
                High
              </MenuItem>

              <MenuItem value="critical">
                Critical
              </MenuItem>
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 2,
            }}
          >
            <TextField
              fullWidth
              select
              size="small"
              value={dateRange}
              onChange={(event) =>
                setDateRange(
                  event.target.value
                )
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "#F8FAFC",
                },
              }}
            >
              <MenuItem value="today">
                Today
              </MenuItem>

              <MenuItem value="7">
                Last 7 Days
              </MenuItem>

              <MenuItem value="30">
                Last 30 Days
              </MenuItem>
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 2,
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              sx={{
                height: 40,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* TABLE */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            color: "#334155",
          }}
        >
          Security Event Logs
        </Typography>

        <Chip
          label={`${filteredLogs.length} records`}
          size="small"
          sx={{
            fontWeight: 700,
            color: "#2563EB",
            backgroundColor: "#EFF6FF",
          }}
        />
      </Box>

      <LogTable logs={filteredLogs} />
    </Box>
  );
}

export default Logs;