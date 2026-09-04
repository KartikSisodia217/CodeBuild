import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function AnalyticsChart({ data = [] }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        minHeight: 440,
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
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
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
              Weekly Detection Trend
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: "#64748B",
              }}
            >
              AI detections over the last 7 days
            </Typography>
          </Box>

          <Box
            sx={{
              px: 1.5,
              py: 0.7,
              borderRadius: 2,
              background: "#EFF6FF",
              color: "#2563EB",
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
            >
              LIVE
            </Typography>
          </Box>
        </Box>

        {/* Chart */}

        <Box
          sx={{
            width: "100%",
            height: 320,
          }}
        >
          {data.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="visionEdgeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#2563EB"
                      stopOpacity={0.35}
                    />

                    <stop
                      offset="100%"
                      stopColor="#2563EB"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748B",
                    fontSize: 12,
                  }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748B",
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    boxShadow:
                      "0 8px 20px rgba(15,23,42,0.10)",
                    background: "#FFFFFF",
                  }}
                  labelStyle={{
                    color: "#0F172A",
                    fontWeight: 700,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="detections"
                  stroke="#2563EB"
                  strokeWidth={3}
                  fill="url(#visionEdgeGradient)"
                  dot={{
                    r: 4,
                    fill: "#FFFFFF",
                    stroke: "#2563EB",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#2563EB",
                    stroke: "#FFFFFF",
                    strokeWidth: 3,
                  }}
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                color="text.secondary"
              >
                No detection data available
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default AnalyticsChart;