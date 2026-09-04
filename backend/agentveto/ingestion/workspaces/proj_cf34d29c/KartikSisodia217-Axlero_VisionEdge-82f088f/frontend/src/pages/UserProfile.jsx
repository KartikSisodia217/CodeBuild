import React, { useState } from "react";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";

function UserProfile() {
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "VisionEdge Administrator",
    role: "System Administrator",
    email: "admin@visionedge.com",
    phone: "+91 98765 43210",
    userId: "VE-ADMIN-001",
  });

  const [accountActive, setAccountActive] = useState(true);

  const handleChange = (field) => (event) => {
    setProfile((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleEditToggle = () => {
    setEditing((prev) => !prev);
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        bgcolor: "background.default",
        color: "text.primary",
        transition:
          "background-color 0.25s ease, color 0.25s ease",
      }}
    >
      {/* PAGE HEADER */}

      <Box
        sx={{
          mb: 3,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontSize: {
              xs: "1.8rem",
              sm: "2.2rem",
              md: "2.5rem",
            },
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.2,
          }}
        >
          User Profile
        </Typography>

        <Typography
          sx={{
            mt: 0.7,
            color: "text.secondary",
            fontSize: "0.95rem",
          }}
        >
          Manage your VisionEdge administrator account
        </Typography>
      </Box>

      {/* TOP SECTION */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "0.75fr 1.75fr",
          },
          gap: 3,
          mb: 3,
        }}
      >
        {/* PROFILE CARD */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            bgcolor: "background.paper",
            color: "text.primary",
            border: 1,
            borderColor: "divider",
            transition:
              "background-color 0.25s ease, border-color 0.25s ease",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 3,
                md: 4,
              },
              "&:last-child": {
                pb: 4,
              },
            }}
          >
            <Stack
              alignItems="center"
              spacing={1.5}
            >
              <Avatar
                sx={{
                  width: 108,
                  height: 108,
                  bgcolor: "primary.main",
                  color: "#FFFFFF",
                  fontSize: "3rem",
                  fontWeight: 800,
                  boxShadow:
                    "0 12px 30px rgba(37,99,235,0.25)",
                }}
              >
                V
              </Avatar>

              <Typography
                sx={{
                  mt: 1,
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "text.primary",
                  textAlign: "center",
                }}
              >
                {profile.name}
              </Typography>

              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.9rem",
                  textAlign: "center",
                }}
              >
                {profile.role}
              </Typography>

              {/* ACTIVE STATUS */}

              <Box
                sx={{
                  mt: 1,
                  px: 1.8,
                  py: 0.8,
                  borderRadius: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.8,
                  bgcolor: "success.main",
                  color: "#FFFFFF",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                }}
              >
                <VerifiedUserRoundedIcon
                  sx={{
                    fontSize: 17,
                  }}
                />

                Active Account
              </Box>
            </Stack>

            <Divider
              sx={{
                my: 3,
                borderColor: "divider",
              }}
            />

            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "success.main",
                }}
              >
                <SecurityRoundedIcon
                  sx={{
                    fontSize: 20,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "text.primary",
                  }}
                >
                  Account Secure
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: "0.78rem",
                  color: "text.secondary",
                  ml: 3.5,
                }}
              >
                User ID: {profile.userId}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* ACCOUNT INFORMATION */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            bgcolor: "background.paper",
            color: "text.primary",
            border: 1,
            borderColor: "divider",
            transition:
              "background-color 0.25s ease, border-color 0.25s ease",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 3,
                md: 4,
              },
              "&:last-child": {
                pb: 4,
              },
            }}
          >
            {/* CARD HEADER */}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 2,
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Account Information
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: "0.85rem",
                    color: "text.secondary",
                  }}
                >
                  Your administrator account details
                </Typography>
              </Box>

              <Button
                variant="outlined"
                startIcon={<EditRoundedIcon />}
                onClick={handleEditToggle}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {editing ? "Cancel" : "Edit"}
              </Button>
            </Box>

            {/* ACCOUNT FIELDS */}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr 1fr",
                },
                gap: 2.5,
              }}
            >
              <TextField
                label="Full Name"
                value={profile.name}
                onChange={handleChange("name")}
                disabled={!editing}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <BadgeRoundedIcon
                      sx={{
                        mr: 1,
                        color: "text.secondary",
                        fontSize: 20,
                      }}
                    />
                  ),
                }}
              />

              <TextField
                label="Role"
                value={profile.role}
                disabled
                fullWidth
                InputProps={{
                  startAdornment: (
                    <AdminPanelSettingsRoundedIcon
                      sx={{
                        mr: 1,
                        color: "text.secondary",
                        fontSize: 20,
                      }}
                    />
                  ),
                }}
              />

              <TextField
                label="Email Address"
                value={profile.email}
                onChange={handleChange("email")}
                disabled={!editing}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <EmailRoundedIcon
                      sx={{
                        mr: 1,
                        color: "text.secondary",
                        fontSize: 20,
                      }}
                    />
                  ),
                }}
              />

              <TextField
                label="Phone Number"
                value={profile.phone}
                onChange={handleChange("phone")}
                disabled={!editing}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <PhoneRoundedIcon
                      sx={{
                        mr: 1,
                        color: "text.secondary",
                        fontSize: 20,
                      }}
                    />
                  ),
                }}
              />
            </Box>

            {/* ACCOUNT STATUS */}

            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 3,
                bgcolor: "background.default",
                border: 1,
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                  }}
                >
                  Account Status
                </Typography>

                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    color: "text.secondary",
                    mt: 0.3,
                  }}
                >
                  Enable or disable administrator access
                </Typography>
              </Box>

              <Switch
                checked={accountActive}
                onChange={(event) =>
                  setAccountActive(event.target.checked)
                }
                color="primary"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* ACCESS & SECURITY */}

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          bgcolor: "background.paper",
          color: "text.primary",
          border: 1,
          borderColor: "divider",
          mb: 3,
          transition:
            "background-color 0.25s ease, border-color 0.25s ease",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 3,
              md: 4,
            },
            "&:last-child": {
              pb: 4,
            },
          }}
        >
          <Typography
            sx={{
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Access & Security
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              mb: 3,
              fontSize: "0.85rem",
              color: "text.secondary",
            }}
          >
            Current permissions and security status
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            <SecurityItem
              icon={<LockRoundedIcon />}
              title="Authentication"
              value="Secure"
              iconColor="primary.main"
              iconBg="action.hover"
            />

            <SecurityItem
              icon={<VerifiedUserRoundedIcon />}
              title="Account Protection"
              value="Enabled"
              iconColor="success.main"
              iconBg="action.hover"
            />

            <SecurityItem
              icon={<AdminPanelSettingsRoundedIcon />}
              title="Administrator Access"
              value="Full Access"
              iconColor="secondary.main"
              iconBg="action.hover"
            />
          </Box>
        </CardContent>
      </Card>

      {/* CONTACT + SECURITY */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 3,
        }}
      >
        <InfoCard
          icon={<EmailRoundedIcon />}
          title="Contact"
          text="Administrator communication and account recovery information."
        />

        <InfoCard
          icon={<SecurityRoundedIcon />}
          title="Security"
          text="Your VisionEdge administrator account is protected with secure access controls."
        />
      </Box>
    </Box>
  );
}

/* ============================================================
   SECURITY ITEM
============================================================ */

function SecurityItem({
  icon,
  title,
  value,
  iconColor,
  iconBg,
}) {
  return (
    <Box
      sx={{
        minHeight: 110,
        p: 2.2,
        borderRadius: 3,
        bgcolor: "background.default",
        border: 1,
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 2,
        transition:
          "background-color 0.25s ease, border-color 0.25s ease",
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: "50%",
          bgcolor: iconBg,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: "0.8rem",
            color: "text.secondary",
            mb: 0.4,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: "0.95rem",
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({
  icon,
  title,
  text,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        color: "text.primary",
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              bgcolor: "action.hover",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>

          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            {title}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: "0.85rem",
            lineHeight: 1.7,
            color: "text.secondary",
          }}
        >
          {text}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default UserProfile;