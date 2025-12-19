"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RoadmapPhase } from "@/lib/types";
import { Calendar, CheckCircle2, Circle, Target } from "lucide-react";
import { MonthlyMilestones } from "./monthly-milestones";

interface RoadmapVisualizationProps {
  phases: RoadmapPhase[];
  currentPhase: number;
  overallScore: number;
}

export function RoadmapVisualization({
  phases,
  currentPhase,
  overallScore,
}: RoadmapVisualizationProps) {
  const getPhaseIcon = (phase: RoadmapPhase) => {
    if (phase.status === "completed") {
      return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    } else if (phase.status === "current") {
      return <Circle className="h-6 w-6 text-primary fill-primary" />;
    } else {
      return <Circle className="h-6 w-6 text-gray-300" />;
    }
  };

  const getPhaseColor = (phase: RoadmapPhase) => {
    if (phase.phase === 1) return "blue";
    if (phase.phase === 2) return "orange";
    return "green";
  };

  const currentPhaseData = phases.find((p) => p.status === "current");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Target className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h3 className="text-2xl font-bold">Optimization Roadmap</h3>
        <p className="text-muted-foreground">
          Your systematic path to AI search visibility
        </p>
      </div>

      {currentPhaseData && (
        <Card className="border-2 border-primary bg-primary/5 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Current Phase: {currentPhaseData.title}
            </CardTitle>
            <CardDescription>{currentPhaseData.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span className="text-muted-foreground">
                  {currentPhaseData.completionPercentage}%
                </span>
              </div>
              <Progress value={currentPhaseData.completionPercentage} className="h-3" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Estimated: {currentPhaseData.estimatedWeeks} weeks</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {phases.map((phase, index) => {
          const color = getPhaseColor(phase);
          const borderColor =
            phase.status === "completed"
              ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 shadow-sm"
              : phase.status === "current"
              ? "border-2 border-primary bg-primary/5 dark:bg-primary/10 shadow-md"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800/50 shadow-sm";

          return (
            <Card key={phase.phase} className={borderColor}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getPhaseIcon(phase)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">
                          Phase {phase.phase}: {phase.title}
                        </CardTitle>
                        {phase.status === "completed" && (
                          <Badge variant="default" className="bg-green-600">
                            Completed
                          </Badge>
                        )}
                        {phase.status === "current" && (
                          <Badge variant="default">In Progress</Badge>
                        )}
                        {phase.status === "upcoming" && (
                          <Badge variant="secondary">Upcoming</Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {phase.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      {phase.estimatedWeeks} weeks
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {phase.status === "current" && (
                    <div className="space-y-2 mb-4">
                      <Progress value={phase.completionPercentage} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">
                        {phase.completionPercentage}% complete
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Key Objectives
                    </h4>
                    <ul className="space-y-2">
                      {phase.objectives.map((objective, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground mt-0.5">•</span>
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {phase.status === "current" && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium text-primary">
                        Current Score: {overallScore}/100
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {phase.phase === 1 && "Reach 50+ to complete Phase 1"}
                        {phase.phase === 2 && "Reach 75+ to complete Phase 2"}
                        {phase.phase === 3 && "Reach 85+ to complete Phase 3"}
                      </p>
                    </div>
                  )}

                  {phase.completionDate && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        Completed on {new Date(phase.completionDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <MonthlyMilestones currentScore={overallScore} />
    </div>
  );
}
