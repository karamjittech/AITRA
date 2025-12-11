"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ShareOfVoiceChartProps {
  dateRange: "7d" | "30d" | "90d";
}

export function ShareOfVoiceChart({ dateRange }: ShareOfVoiceChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setData([
      { name: "No Data", value: 100, color: "#e5e7eb" },
    ]);
    setIsLoading(false);
  };

  const COLORS = ["#3b82f6", "#f97316", "#10b981", "#f59e0b", "#8b5cf6"];

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
      </div>
    );
  }

  if (data.length === 0 || (data.length === 1 && data[0].name === "No Data")) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-center space-y-3">
        <div className="p-4 bg-gray-100 rounded-full">
          <svg
            className="h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-lg">No Citation Data Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-1">
            Start tracking keywords to see your share of voice across AI models
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
