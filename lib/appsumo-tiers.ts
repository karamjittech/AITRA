export interface AppSumoTier {
  tier: number;
  name: string;
  credits: number;
  resetPeriod: 'monthly' | 'never';
  features: {
    maxKeywords: number;
    maxWebsites: number;
    maxCompetitors: number;
    maxPagesPerScan: number;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    whiteLabel: boolean;
    apiAccess: boolean;
  };
}

export const APPSUMO_TIERS: Record<number, AppSumoTier> = {
  1: {
    tier: 1,
    name: 'Tier 1 - Starter',
    credits: 100,
    resetPeriod: 'monthly',
    features: {
      maxKeywords: 25,
      maxWebsites: 3,
      maxCompetitors: 5,
      maxPagesPerScan: 50,
      advancedAnalytics: false,
      prioritySupport: false,
      whiteLabel: false,
      apiAccess: false,
    },
  },
  2: {
    tier: 2,
    name: 'Tier 2 - Professional',
    credits: 250,
    resetPeriod: 'monthly',
    features: {
      maxKeywords: 100,
      maxWebsites: 10,
      maxCompetitors: 15,
      maxPagesPerScan: 200,
      advancedAnalytics: true,
      prioritySupport: false,
      whiteLabel: false,
      apiAccess: false,
    },
  },
  3: {
    tier: 3,
    name: 'Tier 3 - Agency',
    credits: 500,
    resetPeriod: 'monthly',
    features: {
      maxKeywords: 500,
      maxWebsites: 50,
      maxCompetitors: 50,
      maxPagesPerScan: 1000,
      advancedAnalytics: true,
      prioritySupport: true,
      whiteLabel: true,
      apiAccess: true,
    },
  },
};

export function getTierInfo(tier: number): AppSumoTier | null {
  return APPSUMO_TIERS[tier] || null;
}

export function canStackToNextTier(currentTier: number): boolean {
  return currentTier < 3;
}

export function getNextTier(currentTier: number): number {
  return Math.min(currentTier + 1, 3);
}

export function validateCodeFormat(code: string): { valid: boolean; tier?: number } {
  const ltdPattern = /^LTD-T([1-3])-[A-Z0-9]{4,}$/i;
  const match = code.toUpperCase().match(ltdPattern);

  if (!match) {
    return { valid: false };
  }

  const tier = parseInt(match[1], 10);
  return { valid: true, tier };
}

export function calculateCreditResetDate(lastReset: Date): Date {
  const nextReset = new Date(lastReset);
  nextReset.setMonth(nextReset.getMonth() + 1);
  return nextReset;
}

export function shouldResetCredits(lastReset: Date | null): boolean {
  if (!lastReset) return true;

  const now = new Date();
  const resetDate = calculateCreditResetDate(lastReset);
  return now >= resetDate;
}
