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
