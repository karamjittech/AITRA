import { RoadmapPhase, MonthlyMilestone } from "./types";

export function calculateCurrentPhase(overallScore: number): number {
  if (overallScore < 50) return 1;
  if (overallScore < 75) return 2;
  return 3;
}

export function calculatePhaseCompletion(
  overallScore: number,
  phase: number
): number {
  if (phase === 1) {
    const phaseScore = Math.min(Math.max(overallScore, 0), 49);
    return Math.round((phaseScore / 49) * 100);
  } else if (phase === 2) {
    if (overallScore < 50) return 0;
    const phaseScore = Math.min(Math.max(overallScore - 50, 0), 24);
    return Math.round((phaseScore / 24) * 100);
  } else {
    if (overallScore < 75) return 0;
    const phaseScore = Math.min(Math.max(overallScore - 75, 0), 25);
    return Math.round((phaseScore / 25) * 100);
  }
}

export function generateRoadmapPhases(overallScore: number): RoadmapPhase[] {
  const currentPhase = calculateCurrentPhase(overallScore);

  const phases: RoadmapPhase[] = [
    {
      phase: 1,
      title: "Content & Schema Foundation",
      description:
        "Build a strong content foundation with proper structure and schema markup",
      status:
        currentPhase > 1 ? "completed" : currentPhase === 1 ? "current" : "upcoming",
      objectives: [
        "Expand content to 4,000+ words for comprehensive coverage",
        "Add 15+ H2/H3 sections for clear hierarchy",
        "Implement FAQ and HowTo schema markup",
        "Optimize title tags and meta descriptions",
        "Add bullet points and list structures for scannability",
      ],
      estimatedWeeks: 3,
      completionPercentage:
        currentPhase === 1 ? calculatePhaseCompletion(overallScore, 1) : currentPhase > 1 ? 100 : 0,
      completionDate: currentPhase > 1 ? new Date().toISOString() : null,
    },
    {
      phase: 2,
      title: "Authority & Freshness",
      description:
        "Build domain authority and establish content freshness signals",
      status:
        currentPhase > 2 ? "completed" : currentPhase === 2 ? "current" : "upcoming",
      objectives: [
        "Build 10+ quality backlinks from relevant sites",
        "Establish monthly content update schedule",
        "Add E-E-A-T signals (author bio, credentials)",
        "Include 5-8 external citations to authoritative sources",
        "Expand content depth to 1,500+ words with nuanced analysis",
      ],
      estimatedWeeks: 5,
      completionPercentage:
        currentPhase === 2 ? calculatePhaseCompletion(overallScore, 2) : currentPhase > 2 ? 100 : 0,
      completionDate: currentPhase > 2 ? new Date().toISOString() : null,
    },
    {
      phase: 3,
      title: "AI Platform Optimization",
      description:
        "Fine-tune content for specific AI model preferences and maximize citations",
      status: currentPhase === 3 ? "current" : "upcoming",
      objectives: [
        "Platform-specific optimizations for each AI model",
        "Citation and source optimization for Claude",
        "Paragraph breaking and clarity for ChatGPT",
        "Add data visualizations and statistics for Perplexity",
        "Mobile optimization and structured data for Gemini",
      ],
      estimatedWeeks: 4,
      completionPercentage:
        currentPhase === 3 ? calculatePhaseCompletion(overallScore, 3) : 0,
      completionDate: null,
    },
  ];

  return phases;
}

export function generateMonthlyMilestones(
  currentScore: number
): MonthlyMilestone[] {
  const milestones: MonthlyMilestone[] = [
    {
      month: 1,
      monthName: "Month 1",
      expectedGoogleRank: "#40-60",
      expectedAiCitationPercentage: "0%",
      expectedScore: "45-55",
      keyMilestones: [
        "Content expanded to 4,000+ words",
        "Schema markup implemented",
        "10 initial backlinks acquired",
      ],
    },
    {
      month: 2,
      monthName: "Month 2",
      expectedGoogleRank: "#20-30",
      expectedAiCitationPercentage: "2-5%",
      expectedScore: "60-70",
      keyMilestones: [
        "AI signal improvements complete",
        "25 total backlinks",
        "Monthly content updates established",
      ],
    },
    {
      month: 3,
      monthName: "Month 3",
      expectedGoogleRank: "#10-15",
      expectedAiCitationPercentage: "10-15%",
      expectedScore: "75-80",
      keyMilestones: [
        "Phase 1 & 2 complete",
        "40+ backlinks total",
        "Regular AI Overview appearances",
      ],
    },
    {
      month: 6,
      monthName: "Month 6",
      expectedGoogleRank: "#3-6",
      expectedAiCitationPercentage: "20-25%",
      expectedScore: "85-90",
      keyMilestones: [
        "All phases complete",
        "100+ backlinks established",
        "Consistent AI model citations across platforms",
      ],
    },
  ];

  return milestones;
}

export function estimateWeeksToComplete(currentScore: number): number {
  const currentPhase = calculateCurrentPhase(currentScore);

  if (currentPhase === 1) {
    return 12;
  } else if (currentPhase === 2) {
    return 9;
  } else {
    return 4;
  }
}
