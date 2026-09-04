import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";

import StreamCard from "./StreamCard";
import streamsService from "../services/streamsService";

function StreamManagement() {
  const [streams, setStreams] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const loadStreams = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await streamsService.getStreams();

      console.log("STREAM MANAGEMENT DATA:", data);

      if (Array.isArray(data)) {
        setStreams(data);
      } else {
        setStreams([]);
      }
    } catch (err) {
      console.error("Failed to load streams:", err);
      setError("Failed to load camera streams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStreams();
  }, []);

  const filteredStreams = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return streams;
    }

    return streams.filter((stream) => {
      return (
        stream.camera_name
          ?.toLowerCase()
          .includes(query) ||
        stream.rtsp_url
          ?.toLowerCase()
          .includes(query) ||
        stream.resolution
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [streams, search]);

  console.log("🔥 NEW STREAM MANAGEMENT COMPONENT LOADED");
  console.log("🔥 STREAMS:", streams);

  const handleStart = async (streamId) => {
    try {
      setActionLoading(streamId);

      await streamsService.startStream(streamId);

      await loadStreams();
    } catch (err) {
      console.error("Start stream error:", err);

      setError(
        err?.message || "Failed to start stream."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleStop = async (streamId) => {
    try {
      setActionLoading(streamId);

      await streamsService.stopStream(streamId);

      await loadStreams();
    } catch (err) {
      console.error("Stop stream error:", err);

      setError(
        err?.message || "Failed to stop stream."
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        p: {
          xs: 2,
          md: 4,
        },
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
            variant="h4"
            fontWeight={800}
            color="#0F172A"
          >
            Live Camera Monitoring
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            AI Powered Video Stream Management
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadStreams}
            disabled={loading}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              px: 3,
              boxShadow: "none",
            }}
          >
            Add Camera
          </Button>
        </Box>
      </Box>

      {/* SEARCH */}

      <TextField
        fullWidth
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        placeholder="Search cameras..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 4,
          bgcolor: "#fff",
        }}
      />

      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {/* LOADING */}

      {loading ? (
        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : filteredStreams.length === 0 ? (
        <Box
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 4,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={800}
            color="#334155"
          >
            No cameras found
          </Typography>

          <Typography
            color="#94A3B8"
            sx={{ mt: 1 }}
          >
            No configured streams match your search.
          </Typography>
        </Box>
      ) : (
        /* STREAM GRID */

        <Grid container spacing={3}>
          {filteredStreams.map((stream) => (
            <Grid
              key={stream.id}
              size={{
                xs: 12,
                md: 6,
                lg: 4,
              }}
            >
              <StreamCard
                stream={stream}
                actionLoading={actionLoading}
                onStart={handleStart}
                onStop={handleStop}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default StreamManagement;