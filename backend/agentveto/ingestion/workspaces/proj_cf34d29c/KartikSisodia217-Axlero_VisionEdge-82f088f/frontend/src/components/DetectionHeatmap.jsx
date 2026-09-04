import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
} from "@mui/material";

import WhatshotIcon from "@mui/icons-material/Whatshot";

function DetectionHeatmap() {
  const heatmap = [
    [2, 3, 5, 7, 9, 8, 6, 4, 3, 2],
    [3, 5, 7, 9, 12, 11, 8, 6, 4, 3],
    [4, 6, 9, 12, 15, 14, 11, 8, 5, 4],
    [3, 7, 11, 16, 20, 18, 14, 10, 7, 5],
    [2, 5, 9, 14, 18, 21, 16, 11, 8, 5],
    [3, 6, 10, 15, 19, 17, 13, 9, 6, 4],
    [2, 4, 7, 10, 14, 12, 9, 7, 5, 3],
  ];

  const getCellColor = (value) => {
    if (value >= 20) return "#DC2626";
    if (value >= 15) return "#F97316";
    if (value >= 10) return "#F59E0B";
    if (value >= 6) return "#FACC15";
    if (value >= 3) return "#93C5FD";
    return "#DBEAFE";
  };

  return (
    <Card
      elevation={0}
      sx={{
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
              Detection Heatmap
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: "#64748B",
              }}
            >
              AI detection intensity across monitoring periods
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
              backgroundColor: "#FEF2F2",
              color: "#EF4444",
            }}
          >
            <WhatshotIcon />
          </Box>
        </Box>

        {/* Heatmap */}

        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            backgroundColor: "#F8FAFC",
            overflowX: "auto",
          }}
        >
          <Box
            sx={{
              minWidth: 700,
            }}
          >
            {/* Time labels */}

            <Grid
              container
              columns={10}
              spacing={0.6}
              sx={{
                mb: 0.8,
              }}
            >
              {[
                "12 AM",
                "4 AM",
                "8 AM",
                "10 AM",
                "12 PM",
                "2 PM",
                "4 PM",
                "6 PM",
                "8 PM",
                "10 PM",
              ].map((time) => (
                <Grid
                  key={time}
                  size={1}
                  sx={{
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94A3B8",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                    }}
                  >
                    {time}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Cells */}

            {heatmap.map((row, rowIndex) => (
              <Grid
                container
                columns={10}
                spacing={0.6}
                key={rowIndex}
                sx={{
                  mb:
                    rowIndex !==
                    heatmap.length - 1
                      ? 0.6
                      : 0,
                }}
              >
                {row.map((value, colIndex) => (
                  <Grid
                    size={1}
                    key={`${rowIndex}-${colIndex}`}
                  >
                    <Box
                      title={`${value} detections`}
                      sx={{
                        height: 38,
                        borderRadius: 1.5,
                        backgroundColor:
                          getCellColor(value),
                        transition:
                          "all 0.2s ease",
                        cursor: "pointer",

                        "&:hover": {
                          transform:
                            "scale(1.08)",
                          boxShadow:
                            "0 4px 10px rgba(15,23,42,0.15)",
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            ))}
          </Box>
        </Box>

        {/* Legend */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
            mt: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#64748B",
              fontWeight: 600,
            }}
          >
            Low
          </Typography>

          {[
            "#DBEAFE",
            "#93C5FD",
            "#FACC15",
            "#F59E0B",
            "#F97316",
            "#DC2626",
          ].map((color) => (
            <Box
              key={color}
              sx={{
                width: 18,
                height: 18,
                borderRadius: 1,
                backgroundColor: color,
              }}
            />
          ))}

          <Typography
            variant="caption"
            sx={{
              color: "#64748B",
              fontWeight: 600,
            }}
          >
            High
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default DetectionHeatmap;