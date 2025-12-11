"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bot, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface PlatformCardProps {
  platformName: string;
  platformIcon?: React.ReactNode;
  overallScore: number;
  preferenceProfile: string;
  components: {
    name: string;
    score: number;
    maxScore: number;
    status: "good" | "needs-work" | "critical";
    recommendation?: string;
  }[];
}

export function PlatformCard({
  platformName,
  platformIcon,
  overallScore,
  preferenceProfile,
  components,
}: PlatformCardProps) {
  const getScoreColor = (score: number): "green" | "yellow" | "red" => {
    if (score >= 76) return "green";
    if (score >= 61) return "yellow";
    return "red";
  };

  const getStatusBadge = (status: "good" | "needs-work" | "critical") => {
    switch (status) {
      case "good":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Good
          </Badge>
        );
      case "needs-work":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Needs Work
          </Badge>
        );
      case "critical":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Critical
          </Badge>
        );
    }
  };

  const scoreColor = getScoreColor(overallScore);
  const scoreColorClass =
    scoreColor === "green"
      ? "text-green-600"
      : scoreColor === "yellow"
      ? "text-yellow-600"
      : "text-red-600";

  const progressColorClass =
    scoreColor === "green"
      ? "bg-green-500"
      : scoreColor === "yellow"
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {platformIcon || <Bot className="h-5 w-5 text-muted-foreground" />}
            <CardTitle className="text-xl">{platformName}</CardTitle>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${scoreColorClass}`}>
              {overallScore}
            </div>
            <div className="text-xs text-muted-foreground">out of 100</div>
          </div>
        </div>
        <CardDescription className="text-sm italic">
          {preferenceProfile}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Overall Compatibility</span>
            <span>{overallScore}%</span>
          </div>
          <Progress value={overallScore} className={progressColorClass} />
        </div>

        <div className="space-y-3 pt-2">
          {components.map((component, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{component.name}</span>
                  {getStatusBadge(component.status)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {component.score}/{component.maxScore}
                </span>
              </div>
              <Progress
                value={(component.score / component.maxScore) * 100}
                className="h-2"
              />
              {component.recommendation && (
                <p className="text-xs text-muted-foreground pl-1">
                  {component.recommendation}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
