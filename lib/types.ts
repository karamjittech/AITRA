export interface PageAnalysis {
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  wordCount: number;
  hasFaqSchema: boolean;
  hasHowtoSchema: boolean;
  hasArticleSchema: boolean;
  hasListStructure: boolean;
  readabilityScore: number;
  externalLinkCount: number;
  uniqueRefDomainCount: number;
  avgParagraphWords: number;
  bulletRatio: number;
  dataDensityScore: number;
  citationPatternCount: number;
  argumentDepthScore: number;
  hasViewportTag: boolean;
  hasAuthorSchema: boolean;
}

export interface Scores {
  structureScore: number;
  metadataScore: number;
  contentScore: number;
  schemaScore: number;
  overallScore: number;
}

export interface PlatformScores {
  geminiScore: number;
  chatgptScore: number;
  claudeScore: number;
  perplexityScore: number;
  geminiSchemaComponent: number;
  geminiMobileComponent: number;
  chatgptStructureComponent: number;
  chatgptClarityComponent: number;
  claudeCitationComponent: number;
  claudeNuanceComponent: number;
  perplexityExternalLinksComponent: number;
  perplexityDataComponent: number;
}

export interface AnalysisResult {
  success: boolean;
  analysis: PageAnalysis;
  scores: Scores;
  platformScores: PlatformScores;
  pageId: string;
  websiteId: string;
}

export interface AnalysisError {
  error: string;
}

export interface CompetitorData {
  id: string;
  competitorName: string;
  competitorUrl: string | null;
  competitorDomain: string | null;
  domainRating: number;
  backlinkCount: number;
  contentLength: number;
  h1Count: number;
  h2Count: number;
  schemaPresent: boolean;
  freshnessDays: number;
  overallScore: number;
  googleRank: number | null;
  aiCitationPercentage: number;
  isMockData: boolean;
}

export interface CompetitorComparison {
  userSite: {
    name: string;
    url: string;
    domainRating: number;
    backlinkCount: number;
    contentLength: number;
    h1Count: number;
    h2Count: number;
    schemaPresent: boolean;
    overallScore: number;
    googleRank: number | null;
    aiCitationPercentage: number;
  };
  competitor: CompetitorData;
  gaps: {
    contentGap: number;
    authorityGap: number;
    schemaGap: string[];
    freshnessGap: number;
  };
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  objectives: string[];
  estimatedWeeks: number;
  completionPercentage: number;
  completionDate: string | null;
}

export interface OptimizationRoadmap {
  id: string;
  pageId: string;
  currentPhase: number;
  phase1Completed: boolean;
  phase2Completed: boolean;
  phase3Completed: boolean;
  phase1CompletionDate: string | null;
  phase2CompletionDate: string | null;
  phase3CompletionDate: string | null;
  estimatedCompletionWeeks: number;
  phases: RoadmapPhase[];
}

export interface MonthlyMilestone {
  month: number;
  monthName: string;
  expectedGoogleRank: string;
  expectedAiCitationPercentage: string;
  expectedScore: string;
  keyMilestones: string[];
}
