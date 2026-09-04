import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";

import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import OnlinePredictionRoundedIcon from "@mui/icons-material/OnlinePredictionRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import { dashboardService } from "../services/dashboardService";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ============================================================
  // LOAD USERS
  // ============================================================

  const loadUsers = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log("====================================");
      console.log("USERS: Loading dashboard data...");
      console.log("====================================");

      const data = await dashboardService.getDashboard();

      console.log("USERS: Dashboard response:", data);

      // --------------------------------------------------------
      // SUPPORT DIFFERENT POSSIBLE RESPONSE STRUCTURES
      // --------------------------------------------------------

      let usersData = [];

      if (Array.isArray(data)) {
        usersData = data;
      } else if (Array.isArray(data?.users)) {
        usersData = data.users;
      } else if (Array.isArray(data?.data?.users)) {
        usersData = data.data.users;
      } else if (Array.isArray(data?.data)) {
        usersData = data.data;
      } else if (Array.isArray(data?.result?.users)) {
        usersData = data.result.users;
      }

      console.log("USERS: Extracted users:", usersData);

      // --------------------------------------------------------
      // NORMALIZE USER DATA
      // --------------------------------------------------------

      const normalizedUsers = usersData.map((user, index) => {
        const detections =
          user?.detections ??
          user?.detection_count ??
          user?.total_detections ??
          user?.ai_detections ??
          0;

        const lastSeen =
          user?.last_seen ??
          user?.lastSeen ??
          user?.last_active ??
          user?.lastActive ??
          "--";

        const status =
          user?.status ??
          user?.online_status ??
          user?.onlineStatus ??
          "Offline";

        const role =
          user?.role ??
          user?.user_role ??
          user?.userRole ??
          "User";

        const name =
          user?.name ??
          user?.full_name ??
          user?.fullName ??
          user?.username ??
          user?.email ??
          `User ${index + 1}`;

        return {
          ...user,

          id:
            user?.id ??
            user?.user_id ??
            user?.userId ??
            index,

          name,

          role,

          status,

          last_seen: lastSeen,

          detections:
            Number.isFinite(Number(detections))
              ? Number(detections)
              : 0,
        };
      });

      console.log(
        "USERS: Normalized users:",
        normalizedUsers
      );

      setUsers(normalizedUsers);
    } catch (error) {
      console.error(
        "USERS: Failed to load users:",
        error
      );

      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = () => {
    loadUsers(true);
  };

  // ============================================================
  // SUMMARY DATA
  // ============================================================

  const onlineUsers = useMemo(() => {
    return users.filter((user) => {
      const status =
        String(user?.status || "").toLowerCase();

      return (
        status === "online" ||
        status === "active" ||
        status === "connected"
      );
    }).length;
  }, [users]);

  const administrators = useMemo(() => {
    return users.filter((user) => {
      const role =
        String(user?.role || "").toLowerCase();

      return (
        role === "administrator" ||
        role === "admin"
      );
    }).length;
  }, [users]);

  const totalDetections = useMemo(() => {
    return users.reduce((total, user) => {
      const detections =
        Number(user?.detections) || 0;

      return total + detections;
    }, 0);
  }, [users]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress />

          <Typography
            sx={{
              color: "text.secondary",
              fontWeight: 700,
            }}
          >
            Loading Users...
          </Typography>
        </Box>
      </Box>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },

        width: "100%",
        minHeight: "100vh",

        boxSizing: "border-box",

        bgcolor: "background.default",
        color: "text.primary",

        transition:
          "background-color 0.25s ease, color 0.25s ease",

        overflowX: "hidden",
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

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
            sx={{
              color: "text.primary",
              mb: 1,
            }}
          >
            Users Management
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.95rem",
            }}
          >
            Manage VisionEdge users, roles and activity
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            refreshing ? (
              <CircularProgress size={18} />
            ) : (
              <RefreshRoundedIcon />
            )
          }
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{
            borderRadius: 3,

            textTransform: "none",

            fontWeight: 700,

            px: 2,

            borderColor: "divider",

            color: "text.primary",

            "&:hover": {
              borderColor: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <Grid
        container
        spacing={3}
        sx={{
          mb: 4,
        }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <UserSummary
            icon={<PeopleRoundedIcon />}
            title="Total Users"
            value={users.length}
            subtitle="Registered users"
            color="#2563EB"
            background="rgba(37,99,235,0.10)"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <UserSummary
            icon={<OnlinePredictionRoundedIcon />}
            title="Online Users"
            value={onlineUsers}
            subtitle="Currently active"
            color="#10B981"
            background="rgba(16,185,129,0.10)"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <UserSummary
            icon={<AdminPanelSettingsRoundedIcon />}
            title="Administrators"
            value={administrators}
            subtitle="Users with admin access"
            color="#F59E0B"
            background="rgba(245,158,11,0.10)"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <UserSummary
            icon={<PeopleRoundedIcon />}
            title="Total Detections"
            value={totalDetections}
            subtitle="User-associated detections"
            color="#7C3AED"
            background="rgba(124,58,237,0.10)"
          />
        </Grid>
      </Grid>

      {/* ======================================================
          USERS SECTION
      ====================================================== */}

      <Box
        sx={{
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            color: "text.primary",
          }}
        >
          Registered Users
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            color: "text.secondary",
            fontSize: "0.85rem",
          }}
        >
          Current VisionEdge users and their activity
        </Typography>
      </Box>

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {users.length === 0 ? (
        <Box
          sx={{
            p: 6,

            textAlign: "center",

            bgcolor: "background.paper",

            borderRadius: 4,

            border: "1px solid",

            borderColor: "divider",

            color: "text.primary",
          }}
        >
          <PeopleRoundedIcon
            sx={{
              fontSize: 60,
              color: "text.disabled",
              mb: 2,
            }}
          />

          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              color: "text.primary",
              mb: 1,
            }}
          >
            No Users Available
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
            }}
          >
            No user data is currently available from
            the dashboard backend.
          </Typography>

          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              mt: 2,

              borderRadius: 3,

              textTransform: "none",

              fontWeight: 700,

              borderColor: "divider",

              color: "text.primary",
            }}
          >
            Refresh Users
          </Button>
        </Box>
      ) : (
        /* ====================================================
           USER GRID
        ==================================================== */

        <Grid
          container
          spacing={3}
        >
          {users.map((user) => (
            <Grid
              key={user.id}
              size={{
                xs: 12,
                sm: 6,
                lg: 4,
              }}
            >
              <UserCard user={user} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

// ============================================================
// USER SUMMARY
// ============================================================

function UserSummary({
  icon,
  title,
  value,
  subtitle,
  color,
  background,
}) {
  return (
    <Box
      sx={{
        p: 2.5,

        height: "100%",

        boxSizing: "border-box",

        borderRadius: 4,

        bgcolor: "background.paper",

        border: "1px solid",

        borderColor: "divider",

        boxShadow:
          "0 8px 24px rgba(15,23,42,0.06)",

        transition:
          "transform .25s ease, box-shadow .25s ease, background-color .25s ease",

        "&:hover": {
          transform: "translateY(-4px)",

          boxShadow:
            "0 15px 35px rgba(15,23,42,0.12)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",

          alignItems: "center",

          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 48,

            height: 48,

            flexShrink: 0,

            borderRadius: 3,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            bgcolor: background,

            color: color,

            "& svg": {
              fontSize: 25,
            },
          }}
        >
          {icon}
        </Box>

        <Box
          sx={{
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              color: "text.secondary",

              fontSize: "0.82rem",

              fontWeight: 600,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 0.2,

              color: "text.primary",

              fontSize: "1.8rem",

              fontWeight: 800,

              lineHeight: 1.1,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>

      <Typography
        sx={{
          mt: 1.5,

          color: "text.secondary",

          fontSize: "0.75rem",
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}

// ============================================================
// USER CARD
// ============================================================

function UserCard({ user }) {
  const status =
    String(user?.status || "Offline");

  const isOnline =
    status.toLowerCase() === "online" ||
    status.toLowerCase() === "active" ||
    status.toLowerCase() === "connected";

  const name =
    user?.name || "Unknown User";

  const role =
    user?.role || "User";

  const lastSeen =
    user?.last_seen || "--";

  const detections =
    Number(user?.detections) || 0;

  const initial =
    name.charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        p: 3,

        height: "100%",

        boxSizing: "border-box",

        borderRadius: 4,

        bgcolor: "background.paper",

        border: "1px solid",

        borderColor: "divider",

        color: "text.primary",

        transition:
          "transform .25s ease, box-shadow .25s ease, background-color .25s ease",

        "&:hover": {
          transform: "translateY(-4px)",

          boxShadow:
            "0 15px 35px rgba(15,23,42,0.12)",
        },
      }}
    >
      {/* ====================================================
          USER HEADER
      ==================================================== */}

      <Box
        sx={{
          display: "flex",

          alignItems: "center",

          gap: 2,

          mb: 3,
        }}
      >
        <Avatar
          sx={{
            width: 54,

            height: 54,

            bgcolor: "primary.main",

            color: "#FFFFFF",

            fontWeight: 800,

            fontSize: "1.2rem",
          }}
        >
          {initial}
        </Avatar>

        <Box
          sx={{
            flex: 1,

            minWidth: 0,
          }}
        >
          <Typography
            fontWeight={800}
            sx={{
              color: "text.primary",

              overflow: "hidden",

              textOverflow: "ellipsis",

              whiteSpace: "nowrap",
            }}
          >
            {name}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 0.3,

              color: "text.secondary",

              overflow: "hidden",

              textOverflow: "ellipsis",

              whiteSpace: "nowrap",
            }}
          >
            {role}
          </Typography>
        </Box>

        <Chip
          size="small"
          label={status}
          sx={{
            flexShrink: 0,

            fontWeight: 700,

            bgcolor: isOnline
              ? "rgba(16,185,129,0.12)"
              : "action.hover",

            color: isOnline
              ? "#10B981"
              : "text.secondary",

            border: "1px solid",

            borderColor: isOnline
              ? "rgba(16,185,129,0.25)"
              : "divider",
          }}
        />
      </Box>

      {/* ====================================================
          USER DETAILS
      ==================================================== */}

      <Box
        sx={{
          display: "flex",

          justifyContent: "space-between",

          alignItems: "center",

          mb: 1.5,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          Last Seen
        </Typography>

        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            color: "text.primary",

            maxWidth: "60%",

            overflow: "hidden",

            textOverflow: "ellipsis",

            whiteSpace: "nowrap",
          }}
        >
          {lastSeen}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",

          justifyContent: "space-between",

          alignItems: "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          Detections
        </Typography>

        <Typography
          variant="body2"
          fontWeight={800}
          sx={{
            color: "primary.main",
          }}
        >
          {detections}
        </Typography>
      </Box>
    </Box>
  );
}

export default Users;