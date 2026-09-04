import { Box, CircularProgress, Typography } from "@mui/material";

function PageLoader() {
  return (
    <Box
      sx={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress size={60} />

      <Typography
        mt={3}
        fontWeight={700}
      >
        Loading VisionEdge...
      </Typography>
    </Box>
  );
}

export default PageLoader;