import {
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from "@mui/material";

const defaultLogs = [
  {
    id: "LOG-1001",
    event: "Person Detected",
    camera: "Main Entrance",
    severity: "Low",
    time: "10:21 AM",
  },
  {
    id: "LOG-1002",
    event: "Vehicle Detected",
    camera: "Parking Area",
    severity: "Medium",
    time: "10:24 AM",
  },
  {
    id: "LOG-1003",
    event: "Unauthorized Access",
    camera: "Warehouse",
    severity: "High",
    time: "10:31 AM",
  },
  {
    id: "LOG-1004",
    event: "Camera Offline",
    camera: "Lobby",
    severity: "Critical",
    time: "10:38 AM",
  },
];

function getSeverityStyles(level) {
  switch (level) {
    case "Low":
      return {
        backgroundColor: "#ECFDF5",
        color: "#059669",
      };

    case "Medium":
      return {
        backgroundColor: "#FFFBEB",
        color: "#D97706",
      };

    case "High":
      return {
        backgroundColor: "#FFF7ED",
        color: "#EA580C",
      };

    case "Critical":
      return {
        backgroundColor: "#FEF2F2",
        color: "#DC2626",
      };

    default:
      return {
        backgroundColor: "#F1F5F9",
        color: "#475569",
      };
  }
}

function LogTable({ logs = defaultLogs }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,
        border: "1px solid #E2E8F0",
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      {/* TABLE HEADER */}

      <Box
        sx={{
          px: {
            xs: 2,
            md: 3,
          },
          py: 2.5,
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Typography
          sx={{
            fontSize: "1.1rem",
            fontWeight: 800,
            color: "#0F172A",
          }}
        >
          Security Event Logs
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: "0.8rem",
            color: "#94A3B8",
          }}
        >
          AI detection and system activity history
        </Typography>
      </Box>

      {/* TABLE */}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#F8FAFC",
              }}
            >
              <TableCell
                sx={{
                  fontWeight: 800,
                  color: "#475569",
                }}
              >
                ID
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 800,
                  color: "#475569",
                }}
              >
                Event
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 800,
                  color: "#475569",
                }}
              >
                Camera
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 800,
                  color: "#475569",
                }}
              >
                Severity
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 800,
                  color: "#475569",
                }}
              >
                Time
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => {
                const severityStyle =
                  getSeverityStyles(
                    log.severity
                  );

                return (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{
                      transition:
                        "background-color 0.2s ease",

                      "&:hover": {
                        backgroundColor:
                          "#F8FAFC",
                      },

                      "&:last-child td": {
                        borderBottom: 0,
                      },
                    }}
                  >
                    {/* ID */}

                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "#2563EB",
                        }}
                      >
                        {log.id}
                      </Typography>
                    </TableCell>

                    {/* EVENT */}

                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "#0F172A",
                        }}
                      >
                        {log.event}
                      </Typography>
                    </TableCell>

                    {/* CAMERA */}

                    <TableCell>
                      <Typography
                        sx={{
                          color: "#475569",
                          fontWeight: 600,
                        }}
                      >
                        {log.camera}
                      </Typography>
                    </TableCell>

                    {/* SEVERITY */}

                    <TableCell>
                      <Chip
                        label={log.severity}
                        size="small"
                        sx={{
                          ...severityStyle,
                          fontWeight: 800,
                          borderRadius: 2,
                          minWidth: 80,
                        }}
                      />
                    </TableCell>

                    {/* TIME */}

                    <TableCell>
                      <Typography
                        sx={{
                          color: "#64748B",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        {log.time}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{
                    py: 7,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#64748B",
                    }}
                  >
                    No logs found
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: "0.85rem",
                      color: "#94A3B8",
                    }}
                  >
                    Try changing your search or
                    severity filter.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

export default LogTable;