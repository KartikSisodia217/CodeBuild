import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";

import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";
import SecurityIcon from "@mui/icons-material/Security";

function NotificationPanel({ activity = [] }) {
  const getIcon = (level) => {
    switch (level?.toUpperCase()) {
      case "WARNING":
        return <WarningAmberIcon />;

      case "ERROR":
        return <ErrorIcon />;

      case "SECURITY":
        return <SecurityIcon />;

      default:
        return <InfoOutlinedIcon />;
    }
  };

  const getColor = (level) => {
    switch (level?.toUpperCase()) {
      case "WARNING":
        return "#F59E0B";

      case "ERROR":
        return "#EF4444";

      case "SECURITY":
        return "#8B5CF6";

      default:
        return "#2563EB";
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.06)",
      }}
    >
      <CardContent
        sx={{
          p: 3,
          "&:last-child": {
            pb: 3,
          },
        }}
      >
        {/* Header */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                color: "#0F172A",
              }}
            >
              Notifications
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: "#64748B",
              }}
            >
              Latest platform activity
            </Typography>
          </Box>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#EFF6FF",
              color: "#2563EB",
            }}
          >
            <NotificationsActiveIcon />
          </Box>
        </Box>

        {/* Activity */}

        {activity.length === 0 ? (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
            }}
          >
            <NotificationsActiveIcon
              sx={{
                fontSize: 40,
                color: "#94A3B8",
                mb: 1,
              }}
            />

            <Typography color="text.secondary">
              No recent notifications
            </Typography>
          </Box>
        ) : (
          <Box>
            {activity.map((item, index) => {
              const color = getColor(item.level);

              return (
                <Box
                  key={item.id ?? index}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    py: 1.7,
                    borderBottom:
                      index !== activity.length - 1
                        ? "1px solid #E2E8F0"
                        : "none",
                  }}
                >
                  {/* Icon */}

                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      minWidth: 38,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: `${color}14`,
                      color: color,

                      "& svg": {
                        fontSize: 20,
                      },
                    }}
                  >
                    {getIcon(item.level)}
                  </Box>

                  {/* Content */}

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.4,
                      }}
                    >
                      <Typography
                        fontWeight={700}
                        fontSize="0.85rem"
                        sx={{
                          color: "#0F172A",
                        }}
                      >
                        {item.message}
                      </Typography>

                      <Chip
                        label={item.level}
                        size="small"
                        sx={{
                          height: 21,
                          fontSize: "0.62rem",
                          fontWeight: 800,
                          color: color,
                          backgroundColor: `${color}14`,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "#94A3B8",
                      }}
                    >
                      {item.timestamp}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default NotificationPanel;