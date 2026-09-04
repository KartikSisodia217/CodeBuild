import { Box, Paper, Typography } from "@mui/material";

const items = [
  {
    title: "Today's Events",
    value: "1,248",
    color: "#2563EB",
  },
  {
    title: "Active Cameras",
    value: "18 / 20",
    color: "#10B981",
  },
  {
    title: "Critical Alerts",
    value: "03",
    color: "#EF4444",
  },
  {
    title: "Average FPS",
    value: "29.8",
    color: "#F59E0B",
  },
];

function AnalyticsSummary() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2,1fr)",
          lg: "repeat(4,1fr)",
        },
        gap: 2,
        mb: 3,
      }}
    >
      {items.map((item) => (
        <Paper
          key={item.title}
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: "1px solid #E5E7EB",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {item.title}
          </Typography>

          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              mt: 1,
              color: item.color,
            }}
          >
            {item.value}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

export default AnalyticsSummary;