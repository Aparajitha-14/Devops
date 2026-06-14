"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  date: string;
  animals: number;
}

interface AnimalsChartProps {
  data: ChartData[];
  totalAnimals: number;
  loading?: boolean;
}

export default function AnimalsChart({
  data,
  totalAnimals,
  loading = false,
}: AnimalsChartProps) {
  // Log component props for debugging
  console.log("[AnimalsChart] Received props:", {
    dataLength: data?.length,
    totalAnimals,
    loading,
  });

  if (loading) {
    console.log("[AnimalsChart] Rendering loading state");
    return (
      <div className="bg-white p-8 rounded-xl shadow flex items-center justify-center h-96">
        <p className="text-[#685942]">Loading chart...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    console.log("[AnimalsChart] Rendering empty state");
    return (
      <div className="bg-white p-8 rounded-xl shadow flex items-center justify-center h-96">
        <p className="text-[#685942]">No data available for this period</p>
      </div>
    );
  }

  console.log("[AnimalsChart] Rendering chart with data:", data);

  return (
    <div className="bg-white p-8 rounded-xl shadow">
      {/* Summary Section */}
      <div className="mb-8">
        <p className="text-sm uppercase text-[#685942] mb-2">
          Animals Given Up
        </p>
        <div className="flex items-baseline gap-8">
          <div>
            <h3 className="text-4xl font-black text-[#7f5200]">
              {totalAnimals.toLocaleString()}
            </h3>
            <p className="text-xs text-[#685942] mt-1">Total Animals</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis
            dataKey="date"
            stroke="#7f5200"
            style={{ fontSize: "12px" }}
            tick={{ fill: "#685942" }}
          />
          <YAxis
            stroke="#7f5200"
            style={{ fontSize: "12px" }}
            tick={{ fill: "#685942" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "2px solid #7f5200",
              borderRadius: "8px",
              padding: "8px",
            }}
            formatter={(value) => [`${value} animals`, "Animals"]}
            labelStyle={{ color: "#7f5200", fontWeight: "bold" }}
          />
          <Line
            type="monotone"
            dataKey="animals"
            stroke="#7f5200"
            strokeWidth={2}
            dot={{ fill: "#7f5200", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
