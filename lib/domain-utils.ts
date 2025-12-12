export interface NormalizedDomain {
  original: string;
  normalized: string;
  displayName: string;
}

export interface DomainCitation {
  domain: string;
  position: number;
  strength: 'primary' | 'supporting' | 'mention';
  platform?: string;
}

export interface CompetitorMetrics {
  domain: string;
  displayName: string;
  citationCount: number;
  sovPercentage: number;
  platforms: string[];
  coCitationFrequency: number;
  trend?: 'rising' | 'falling' | 'stable';
  lastSeen?: Date;
}

export const NOISE_DOMAINS = [
  'wikipedia.org',
  'wikimedia.org',
  'youtube.com',
  'reddit.com',
  'github.com',
  'stackoverflow.com',
  'medium.com',
  'linkedin.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'tiktok.com',
  'google.com',
  'bing.com',
  'amazon.com',
  'apple.com',
  'microsoft.com',
  'forbes.com',
  'nytimes.com',
  'wsj.com',
  'bbc.com',
  'cnn.com',
];

export function normalizeDomain(url: string): string {
  if (!url) return '';

  let normalized = url.trim();

  normalized = normalized.replace(/^https?:\/\//i, '');

  normalized = normalized.replace(/^www\./i, '');

  normalized = normalized.replace(/\/.*$/, '');

  normalized = normalized.toLowerCase();

  return normalized;
}

export function extractDomainFromUrl(url: string): NormalizedDomain {
  const normalized = normalizeDomain(url);

  const displayName = normalized
    .split('.')[0]
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    original: url,
    normalized,
    displayName,
  };
}

export function isNoiseDomain(domain: string): boolean {
  const normalized = normalizeDomain(domain);
  return NOISE_DOMAINS.some((noise) => normalized.includes(noise) || noise.includes(normalized));
}

export function extractDomainsFromCitations(
  citations: Array<{ url?: string; domain?: string; position?: number }>
): DomainCitation[] {
  const domainMap = new Map<string, DomainCitation>();

  citations.forEach((citation, index) => {
    const url = citation.url || citation.domain || '';
    if (!url) return;

    const normalized = normalizeDomain(url);
    if (!normalized || isNoiseDomain(normalized)) return;

    if (!domainMap.has(normalized)) {
      domainMap.set(normalized, {
        domain: normalized,
        position: citation.position ?? index + 1,
        strength: index === 0 ? 'primary' : index < 3 ? 'supporting' : 'mention',
      });
    }
  });

  return Array.from(domainMap.values()).sort((a, b) => a.position - b.position);
}

export function calculateShareOfVoice(citations: DomainCitation[]): Map<string, number> {
  const totalCitations = citations.length;
  if (totalCitations === 0) return new Map();

  const domainCounts = new Map<string, number>();

  citations.forEach((citation) => {
    const count = domainCounts.get(citation.domain) || 0;
    domainCounts.set(citation.domain, count + 1);
  });

  const sovMap = new Map<string, number>();
  domainCounts.forEach((count, domain) => {
    const percentage = (count / totalCitations) * 100;
    sovMap.set(domain, Math.round(percentage * 100) / 100);
  });

  return sovMap;
}

export function groupCitationsByPlatform(
  citations: Array<DomainCitation & { platform?: string }>
): Map<string, DomainCitation[]> {
  const platformMap = new Map<string, DomainCitation[]>();

  citations.forEach((citation) => {
    const platform = citation.platform || 'unknown';
    const existing = platformMap.get(platform) || [];
    existing.push(citation);
    platformMap.set(platform, existing);
  });

  return platformMap;
}

export function identifyCoCitations(
  citations: DomainCitation[],
  userDomain: string
): Map<string, number> {
  const normalizedUserDomain = normalizeDomain(userDomain);
  const hasUserCitation = citations.some((c) => c.domain === normalizedUserDomain);

  if (!hasUserCitation) return new Map();

  const coCitationMap = new Map<string, number>();

  citations.forEach((citation) => {
    if (citation.domain !== normalizedUserDomain) {
      const count = coCitationMap.get(citation.domain) || 0;
      coCitationMap.set(citation.domain, count + 1);
    }
  });

  return coCitationMap;
}

export function rankCompetitors(competitors: CompetitorMetrics[]): CompetitorMetrics[] {
  return [...competitors].sort((a, b) => {
    if (b.sovPercentage !== a.sovPercentage) {
      return b.sovPercentage - a.sovPercentage;
    }
    return b.citationCount - a.citationCount;
  });
}

export function calculateTrend(
  currentSOV: number,
  previousSOV: number
): 'rising' | 'falling' | 'stable' {
  const threshold = 2;

  if (currentSOV > previousSOV + threshold) return 'rising';
  if (currentSOV < previousSOV - threshold) return 'falling';
  return 'stable';
}

export function formatSOVPercentage(percentage: number): string {
  if (percentage >= 10) {
    return percentage.toFixed(0) + '%';
  }
  return percentage.toFixed(1) + '%';
}

export function getTopCompetitors(
  competitors: CompetitorMetrics[],
  limit: number = 5
): CompetitorMetrics[] {
  return rankCompetitors(competitors).slice(0, limit);
}

export function calculateMarketConcentration(competitors: CompetitorMetrics[]): {
  herfindahlIndex: number;
  topThreeShare: number;
  isConcentrated: boolean;
} {
  const totalSOV = competitors.reduce((sum, c) => sum + c.sovPercentage, 0);

  const herfindahlIndex = competitors.reduce((sum, c) => {
    const marketShare = c.sovPercentage / 100;
    return sum + marketShare * marketShare;
  }, 0);

  const topThree = rankCompetitors(competitors).slice(0, 3);
  const topThreeShare = topThree.reduce((sum, c) => sum + c.sovPercentage, 0);

  const isConcentrated = herfindahlIndex > 0.25 || topThreeShare > 75;

  return {
    herfindahlIndex: Math.round(herfindahlIndex * 10000) / 10000,
    topThreeShare: Math.round(topThreeShare * 100) / 100,
    isConcentrated,
  };
}
