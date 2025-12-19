"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScoreDisplayProps {
  score: number;
  label: string;
  maxScore: number;
  color?: "red" | "yellow" | "green";
}

export function ScoreDisplay({ score, label, maxScore, color = "green" }: ScoreDisplayProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const percentage = (score / maxScore) * 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColorClasses = () => {
    if (color === "red") return "text-red-600";
    if (color === "yellow") return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <span className={`text-sm font-bold ${getColorClasses()}`}>
          {animatedScore.toFixed(1)}/{maxScore}
        </span>
      </div>
      <Progress value={percentage} className="h-2.5" />
    </div>
  );
}

interface OverallScoreProps {
  score: number;
}

export function OverallScore({ score }: OverallScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = score;
    const duration = 1500;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  const getScoreColor = () => {
    if (score >= 75) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = () => {
    if (score >= 75) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  const strokeDasharray = 2 * Math.PI * 70;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * animatedScore) / 100;

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-52 h-52">
            <svg className="transform -rotate-90 w-52 h-52">
              <circle
                cx="104"
                cy="104"
                r="70"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-gray-100"
              />
              <circle
                cx="104"
                cy="104"
                r="70"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className={`${getScoreColor()} transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl font-bold ${getScoreColor()}`}>
                {Math.round(animatedScore)}
              </span>
              <span className="text-xs text-muted-foreground mt-1">out of 100</span>
            </div>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-bold text-gray-900">AI Readiness Score</h3>
            <p className={`text-base font-medium ${getScoreColor()}`}>
              {getScoreLabel()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
