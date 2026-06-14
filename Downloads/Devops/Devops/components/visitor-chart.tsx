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
  visitors: number;
  forms: number;
}

interface VisitorChartProps {
  data: ChartData[];
  totalVisitors: number;
  totalForms: number;
  loading?: boolean;
}

export default function VisitorChart({
  data,
  totalVisitors,
  totalForms,
  loading = false,
}: VisitorChartProps) {
  // Log component props for debugging
  console.log("[VisitorChart] Received props:", {
    dataLength: data?.length,
    totalVisitors,
    totalForms,
    loading,
  });

  if (loading) {
    console.log("[VisitorChart] Rendering loading state");
    return (
      <div className="bg-white p-8 rounded-xl shadow flex items-center justify-center h-96">
        <p className="text-[#685942]">Loading chart...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    console.log("[VisitorChart] Rendering empty state");
    return (
      <div className="bg-white p-8 rounded-xl shadow flex items-center justify-center h-96">
        <p className="text-[#685942]">No data available for this period</p>
      </div>
    );
  }

  console.log("[VisitorChart] Rendering chart with data:", data);

  return (
    <div className="bg-white p-8 rounded-xl shadow">
      {/* Summary Section */}
      <div className="mb-8">
        <p className="text-sm uppercase text-[#685942] mb-2">Visitors</p>
        <div className="flex items-baseline gap-8">
          <div>
            <h3 className="text-4xl font-black text-[#9e3c11]">
              {totalVisitors.toLocaleString()}
            </h3>
            <p className="text-xs text-[#685942] mt-1">Total Visitors</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-[#7f5200]">{totalForms}</h3>
            <p className="text-xs text-[#685942] mt-1">Forms Submitted</p>
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
            stroke="#9e3c11"
            style={{ fontSize: "12px" }}
            tick={{ fill: "#685942" }}
          />
          <YAxis
            stroke="#9e3c11"
            style={{ fontSize: "12px" }}
            tick={{ fill: "#685942" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "2px solid #9e3c11",
              borderRadius: "8px",
              padding: "8px",
            }}
            formatter={(value) => [`${value} visitors`, "Visitors"]}
            labelStyle={{ color: "#9e3c11", fontWeight: "bold" }}
          />
          <Line
            type="monotone"
            dataKey="visitors"
            stroke="#9e3c11"
            strokeWidth={2}
            dot={{ fill: "#9e3c11", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
