import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  LinearProgress,
} from "@mui/material";

const detections = [
  {
    label: "Person",
    value: 94,
    count: 1254,
    color: "#2563EB",
  },
  {
    label: "Vehicle",
    value: 81,
    count: 846,
    color: "#10B981",
  },
  {
    label: "Helmet",
    value: 68,
    count: 392,
    color: "#F59E0B",
  },
  {
    label: "Fire",
    value: 18,
    count: 14,
    color: "#EF4444",
  },
];

function AIDetectionSummary() {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,
        border: "1px solid #E5E7EB",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          fontWeight={700}
          mb={3}
        >
          AI Detection Summary
        </Typography>

        <Grid container spacing={3}>
          {detections.map((item) => (
            <Grid
              key={item.label}
              size={{ xs: 12, md: 6 }}
            >
              <Box mb={1}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                >
                  <Typography fontWeight={600}>
                    {item.label}
                  </Typography>

                  <Typography color="text.secondary">
                    {item.count}
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={item.value}
                  sx={{
                    mt: 1,
                    height: 10,
                    borderRadius: 5,
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default AIDetectionSummary;