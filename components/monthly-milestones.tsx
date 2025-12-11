"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateMonthlyMilestones } from "@/lib/phase-calculator";
import { Calendar, TrendingUp, Target, CheckCircle2 } from "lucide-react";

interface MonthlyMilestonesProps {
  currentScore: number;
}

export function MonthlyMilestones({ currentScore }: MonthlyMilestonesProps) {
  const milestones = generateMonthlyMilestones(currentScore);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          6-Month Timeline & Milestones
        </CardTitle>
        <CardDescription>
          Expected progress and key achievements at each stage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={milestone.month} className="relative">
              {index < milestones.length - 1 && (
                <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 to-transparent" />
              )}

              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{milestone.month}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 pb-6">
                  <div>
                    <h4 className="font-semibold text-base mb-1">{milestone.monthName}</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <Target className="h-4 w-4 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-xs text-blue-600 font-medium">Google Rank</p>
                        <p className="text-sm font-bold text-blue-900">
                          {milestone.expectedGoogleRank}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                      <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">AI Citations</p>
                        <p className="text-sm font-bold text-green-900">
                          {milestone.expectedAiCitationPercentage}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 border border-purple-200">
                      <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                      <div>
                        <p className="text-xs text-purple-600 font-medium">Score Target</p>
                        <p className="text-sm font-bold text-purple-900">
                          {milestone.expectedScore}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Key Milestones
                    </p>
                    <ul className="space-y-1.5">
                      {milestone.keyMilestones.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> These milestones represent typical
            progress for sites following the optimization roadmap. Your actual timeline may vary
            based on competition, content quality, and implementation speed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
