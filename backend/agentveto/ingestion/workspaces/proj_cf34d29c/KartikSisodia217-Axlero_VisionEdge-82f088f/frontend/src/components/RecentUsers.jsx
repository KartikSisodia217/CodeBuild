import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

function RecentUsers({ users = [] }) {
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
            alignItems: "center",
            justifyContent: "space-between",
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
              Recent Users
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: "#64748B",
              }}
            >
              Active platform users
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
            <PeopleIcon />
          </Box>
        </Box>

        {/* Users */}

        {users.length === 0 ? (
          <Box
            sx={{
              py: 6,
              textAlign: "center",
            }}
          >
            <PeopleIcon
              sx={{
                fontSize: 42,
                color: "#94A3B8",
                mb: 1,
              }}
            />

            <Typography
              color="text.secondary"
            >
              No users available
            </Typography>
          </Box>
        ) : (
          <Box>
            {users.map((user, index) => {
              const online =
                user.status?.toLowerCase() ===
                "online";

              const initials = user.name
                ? user.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "U";

              return (
                <Box
                  key={`${user.name}-${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 1.7,

                    borderBottom:
                      index !== users.length - 1
                        ? "1px solid #E2E8F0"
                        : "none",
                  }}
                >
                  {/* Avatar */}

                  <Box
                    sx={{
                      position: "relative",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        backgroundColor:
                          "#DBEAFE",
                        color: "#1D4ED8",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                      }}
                    >
                      {initials}
                    </Avatar>

                    <Box
                      sx={{
                        position: "absolute",
                        right: -1,
                        bottom: -1,
                        width: 11,
                        height: 11,
                        borderRadius: "50%",
                        backgroundColor:
                          online
                            ? "#10B981"
                            : "#94A3B8",
                        border:
                          "2px solid #FFFFFF",
                      }}
                    />
                  </Box>

                  {/* User Details */}

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      fontWeight={800}
                      fontSize="0.9rem"
                      sx={{
                        color: "#0F172A",
                      }}
                    >
                      {user.name}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748B",
                      }}
                    >
                      {user.role}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.2,
                        color: "#94A3B8",
                      }}
                    >
                      {user.last_seen}
                    </Typography>
                  </Box>

                  {/* Detection Count */}

                  <Box
                    sx={{
                      textAlign: "right",
                    }}
                  >
                    <Typography
                      fontWeight={800}
                      fontSize="0.9rem"
                      sx={{
                        color: "#2563EB",
                      }}
                    >
                      {user.detections}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "#94A3B8",
                      }}
                    >
                      detections
                    </Typography>
                  </Box>

                  {/* Status */}

                  <Chip
                    icon={
                      online ? (
                        <VerifiedUserIcon
                          sx={{
                            fontSize:
                              "14px !important",
                          }}
                        />
                      ) : undefined
                    }
                    label={
                      online
                        ? "Online"
                        : "Offline"
                    }
                    size="small"
                    sx={{
                      display: {
                        xs: "none",
                        sm: "flex",
                      },
                      fontWeight: 700,
                      backgroundColor:
                        online
                          ? "#ECFDF5"
                          : "#F1F5F9",
                      color: online
                        ? "#047857"
                        : "#64748B",
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentUsers;