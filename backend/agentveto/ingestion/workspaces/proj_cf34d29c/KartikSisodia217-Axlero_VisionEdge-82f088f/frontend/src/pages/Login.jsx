import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

function Login() {
  return (
    <Container maxWidth="sm">

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >

        <Card
          sx={{
            width: "100%",
            borderRadius: 4,
          }}
        >

          <CardContent
            sx={{
              p: 5,
            }}
          >

            <Box
              display="flex"
              justifyContent="center"
              mb={2}
            >
              <Avatar
                sx={{
                  bgcolor: "#2563EB",
                }}
              >
                <LockOutlinedIcon />
              </Avatar>
            </Box>

            <Typography
              variant="h4"
              align="center"
              fontWeight="bold"
            >
              VisionEdge
            </Typography>

            <Typography
              align="center"
              mb={4}
              color="text.secondary"
            >
              Administrator Login
            </Typography>

            <TextField
              fullWidth
              label="Email"
              margin="normal"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
            />

            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                py: 1.5,
              }}
            >
              Login
            </Button>

          </CardContent>

        </Card>

      </Box>

    </Container>
  );
}

export default Login;