import { Card, CardContent, ToggleButtonGroup, ToggleButton, Typography, Box } from "@mui/material";
import { useState } from "react";

function DateRangeFilter() {
  const [range, setRange] = useState("7d");

  const handleChange = (_, value) => {
    if (value !== null) {
      setRange(value);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 5,
        boxShadow: "0 15px 35px rgba(0,0,0,.08)",
      }}
    >
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h6" fontWeight={700}>
            Analytics Time Range
          </Typography>

          <ToggleButtonGroup
            value={range}
            exclusive
            onChange={handleChange}
            size="small"
          >
            <ToggleButton value="today">
              Today
            </ToggleButton>

            <ToggleButton value="7d">
              7 Days
            </ToggleButton>

            <ToggleButton value="30d">
              30 Days
            </ToggleButton>

            <ToggleButton value="90d">
              90 Days
            </ToggleButton>

            <ToggleButton value="custom">
              Custom
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </CardContent>
    </Card>
  );
}

export default DateRangeFilter;