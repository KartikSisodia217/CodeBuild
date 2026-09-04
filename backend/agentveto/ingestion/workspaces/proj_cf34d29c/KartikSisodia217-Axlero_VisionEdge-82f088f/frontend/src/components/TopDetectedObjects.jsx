import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from "@mui/material";

import AnalyticsIcon from "@mui/icons-material/Analytics";

function TopDetectedObjects() {
  const objects = [
    {
      name: "Person",
      count: 482,
      percentage: 92,
    },
    {
      name: "Vehicle",
      count: 318,
      percentage: 72,
    },
    {
      name: "Car",
      count: 246,
      percentage: 58,
    },
    {
      name: "Truck",
      count: 124,
      percentage: 34,
    },
    {
      name: "Bicycle",
      count: 73,
      percentage: 21,
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow:
          "0 8px 24px rgba(15,23,42,0.06)",
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
              sx={{ color: "#0F172A" }}
            >
              Top Detected Objects
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: "#64748B",
              }}
            >
              Most frequently detected objects
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
            <AnalyticsIcon />
          </Box>
        </Box>

        {/* Objects */}

        {objects.map((object, index) => (
          <Box
            key={object.name}
            sx={{
              py: 1.7,
              borderBottom:
                index !== objects.length - 1
                  ? "1px solid #E2E8F0"
                  : "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.8,
              }}
            >
              <Typography
                fontWeight={700}
                fontSize="0.88rem"
                sx={{ color: "#334155" }}
              >
                {object.name}
              </Typography>

              <Typography
                fontWeight={800}
                fontSize="0.88rem"
                sx={{ color: "#2563EB" }}
              >
                {object.count}
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={object.percentage}
              sx={{
                height: 7,
                borderRadius: 5,
                backgroundColor: "#E2E8F0",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 5,
                  background:
                    "linear-gradient(90deg,#2563EB,#60A5FA)",
                },
              }}
            />
          </Box>
        ))}

        {/* Footer */}

        <Box
          sx={{
            mt: 2.5,
            p: 1.5,
            borderRadius: 2.5,
            backgroundColor: "#F8FAFC",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "#64748B" }}
          >
            Total objects detected
          </Typography>

          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ color: "#0F172A" }}
          >
            1,287
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default TopDetectedObjects;