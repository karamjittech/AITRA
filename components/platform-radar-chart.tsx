"use client";

import { useEffect, useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts";

export function PlatformRadarChart() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setData([
      { platform: "ChatGPT", score: 0 },
      { platform: "Claude", score: 0 },
      { platform: "Gemini", score: 0 },
      { platform: "Perplexity", score: 0 },
    ]);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="platform" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Visibility Score"
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Start tracking keywords to see platform-specific visibility scores
      </div>
    </div>
  );
}
