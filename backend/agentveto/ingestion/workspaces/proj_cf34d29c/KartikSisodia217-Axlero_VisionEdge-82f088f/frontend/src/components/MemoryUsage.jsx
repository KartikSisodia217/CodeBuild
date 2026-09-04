import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Chip,
} from "@mui/material";

const memory = {
  total: 64,
  used: 46.8,
  cache: 8.2,
  swap: 3.4,
  speed: "5600 MHz",
};

function MemoryUsage() {
  const percent = (memory.used / memory.total) * 100;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,
        boxShadow: "0 15px 35px rgba(0,0,0,.08)",
      }}
    >
      <CardContent>

        <Typography
          variant="h6"
          fontWeight={700}
          mb={3}
        >
          Memory Usage
        </Typography>

        <Typography
          variant="h3"
          fontWeight={700}
        >
          {memory.used} GB
        </Typography>

        <Typography
          color="text.secondary"
          mb={2}
        >
          of {memory.total} GB
        </Typography>

        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            height: 12,
            borderRadius: 20,
            mb: 4,
          }}
        />

        <Grid container spacing={2}>

          <Grid item xs={6}>
            <Typography color="text.secondary">
              Cache
            </Typography>

            <Chip
              label={`${memory.cache} GB`}
              color="primary"
            />
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">
              Swap
            </Typography>

            <Chip
              label={`${memory.swap} GB`}
              color="secondary"
            />
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">
              Memory Speed
            </Typography>

            <Typography fontWeight={700}>
              {memory.speed}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography color="text.secondary">
              Usage
            </Typography>

            <Typography fontWeight={700}>
              {percent.toFixed(1)}%
            </Typography>
          </Grid>

        </Grid>

      </CardContent>
    </Card>
  );
}

export default MemoryUsage;