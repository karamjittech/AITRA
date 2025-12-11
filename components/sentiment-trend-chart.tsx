"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface SentimentTrendChartProps {
  dateRange: "7d" | "30d" | "90d";
}

export function SentimentTrendChart({ dateRange }: SentimentTrendChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setData([]);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
      </div>
    );
  }

  if (data.length === 0) {
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
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-lg">No Sentiment Data Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-1">
            Citation sentiment will appear here once you start tracking keywords
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="positive" stackId="a" fill="#10b981" name="Positive" />
          <Bar dataKey="neutral" stackId="a" fill="#6b7280" name="Neutral" />
          <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Negative" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
