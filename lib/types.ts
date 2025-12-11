export interface PageAnalysis {
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  h2Count: number;
  wordCount: number;
  hasFaqSchema: boolean;
  hasHowtoSchema: boolean;
  hasArticleSchema: boolean;
  hasListStructure: boolean;
  readabilityScore: number;
}

export interface Scores {
  structureScore: number;
  metadataScore: number;
  contentScore: number;
  schemaScore: number;
  overallScore: number;
}

export interface AnalysisResult {
  success: boolean;
  analysis: PageAnalysis;
  scores: Scores;
  pageId: string;
  websiteId: string;
}

export interface AnalysisError {
  error: string;
}
