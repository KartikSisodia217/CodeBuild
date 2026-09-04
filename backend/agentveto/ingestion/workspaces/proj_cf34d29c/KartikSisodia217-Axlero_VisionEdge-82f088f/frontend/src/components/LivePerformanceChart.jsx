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
  Legend,
} from "recharts";

const data = [
  { time: "10:00", cpu: 48, gpu: 71, ram: 58, network: 320 },
  { time: "10:05", cpu: 56, gpu: 78, ram: 60, network: 380 },
  { time: "10:10", cpu: 62, gpu: 82, ram: 64, network: 420 },
  { time: "10:15", cpu: 71, gpu: 88, ram: 68, network: 460 },
  { time: "10:20", cpu: 67, gpu: 81, ram: 71, network: 430 },
  { time: "10:25", cpu: 74, gpu: 91, ram: 75, network: 520 },
  { time: "10:30", cpu: 69, gpu: 86, ram: 72, network: 480 },
];

function LivePerformanceChart() {
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
          Live Performance Monitor
        </Typography>

        <ResponsiveContainer
          width="100%"
          height={350}
        >
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="time" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="cpu"
              stroke="#2563EB"
              strokeWidth={3}
              dot={false}
              name="CPU"
            />

            <Line
              type="monotone"
              dataKey="gpu"
              stroke="#10B981"
              strokeWidth={3}
              dot={false}
              name="GPU"
            />

            <Line
              type="monotone"
              dataKey="ram"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={false}
              name="RAM"
            />

            <Line
              type="monotone"
              dataKey="network"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={false}
              name="Network"
            />
          </LineChart>
        </ResponsiveContainer>

      </CardContent>
    </Card>
  );
}

export default LivePerformanceChart;