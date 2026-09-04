import {
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", detections: 8200 },
  { month: "Feb", detections: 9100 },
  { month: "Mar", detections: 10250 },
  { month: "Apr", detections: 11300 },
  { month: "May", detections: 12150 },
  { month: "Jun", detections: 13280 },
  { month: "Jul", detections: 14100 },
  { month: "Aug", detections: 14800 },
  { month: "Sep", detections: 15600 },
  { month: "Oct", detections: 16250 },
  { month: "Nov", detections: 17180 },
  { month: "Dec", detections: 18450 },
];

function MonthlyTrendChart() {
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
          Monthly Detection Trend
        </Typography>

        <ResponsiveContainer
          width="100%"
          height={350}
        >
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="detections"
              stroke="#2563EB"
              strokeWidth={4}
              dot={{
                r: 5,
              }}
              activeDot={{
                r: 8,
              }}
            />
          </LineChart>
        </ResponsiveContainer>

      </CardContent>
    </Card>
  );
}

export default MonthlyTrendChart;