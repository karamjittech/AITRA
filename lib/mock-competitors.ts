import { CompetitorData } from "./types";

export function generateMockCompetitors(
  userScore: number,
  userWordCount: number,
  userDomain: string
): CompetitorData[] {
  const competitors: CompetitorData[] = [
    {
      id: "mock-competitor-1",
      competitorName: "Industry Leader",
      competitorUrl: "https://example-leader.com",
      competitorDomain: "example-leader.com",
      domainRating: 92,
      backlinkCount: 2000,
      contentLength: Math.floor(userWordCount * 1.5),
      h1Count: 1,
      h2Count: 12,
      schemaPresent: true,
      freshnessDays: 7,
      overallScore: Math.min(userScore + 25, 95),
      googleRank: 1,
      aiCitationPercentage: 30,
      isMockData: true,
    },
    {
      id: "mock-competitor-2",
      competitorName: "Established Competitor",
      competitorUrl: "https://example-competitor.com",
      competitorDomain: "example-competitor.com",
      domainRating: 78,
      backlinkCount: 850,
      contentLength: Math.floor(userWordCount * 1.2),
      h1Count: 1,
      h2Count: 8,
      schemaPresent: true,
      freshnessDays: 14,
      overallScore: Math.min(userScore + 15, 85),
      googleRank: 2,
      aiCitationPercentage: 22,
      isMockData: true,
    },
    {
      id: "mock-competitor-3",
      competitorName: "Rising Challenger",
      competitorUrl: "https://example-challenger.com",
      competitorDomain: "example-challenger.com",
      domainRating: 65,
      backlinkCount: 320,
      contentLength: Math.floor(userWordCount * 1.1),
      h1Count: 1,
      h2Count: 6,
      schemaPresent: false,
      freshnessDays: 30,
      overallScore: Math.max(userScore + 5, 60),
      googleRank: 5,
      aiCitationPercentage: 12,
      isMockData: true,
    },
  ];

  return competitors;
}

export function selectPrimaryCompetitor(
  competitors: CompetitorData[]
): CompetitorData {
  return competitors[0];
}
