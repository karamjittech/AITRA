import { BotName, BotInfo, BlockReason } from './types';

export interface RobotsTxtRule {
  userAgent: string;
  disallow: string[];
  allow: string[];
}

export interface ParsedRobotsTxt {
  rules: Map<string, RobotsTxtRule>;
  hasWildcard: boolean;
}

export const BOT_CONFIGS: BotInfo[] = [
  {
    name: 'GPTBot',
    displayName: 'GPTBot (OpenAI)',
    description: 'Powers ChatGPT search and AI responses',
    userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)',
    platform: 'ChatGPT'
  },
  {
    name: 'CCBot',
    displayName: 'CCBot (Common Crawl)',
    description: 'Used by Claude and other AI models',
    userAgent: 'CCBot/2.0 (https://commoncrawl.org/faq/)',
    platform: 'Claude'
  },
  {
    name: 'Google-Extended',
    displayName: 'Google-Extended',
    description: 'Powers Google Gemini AI model training',
    userAgent: 'Mozilla/5.0 (compatible; Google-Extended)',
    platform: 'Gemini'
  },
  {
    name: 'FacebookBot',
    displayName: 'FacebookBot (Meta)',
    description: 'Used by Meta AI and Llama models',
    userAgent: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    platform: 'Meta AI'
  },
  {
    name: 'PerplexityBot',
    displayName: 'PerplexityBot',
    description: 'Powers Perplexity AI search',
    userAgent: 'PerplexityBot/1.0 (+https://perplexity.ai/bot)',
    platform: 'Perplexity'
  }
];

export function getBotUserAgent(botName: BotName): string {
  const bot = BOT_CONFIGS.find(b => b.name === botName);
  return bot?.userAgent || '';
}

export function getBotInfo(botName: BotName): BotInfo | undefined {
  return BOT_CONFIGS.find(b => b.name === botName);
}

export function parseRobotsTxt(content: string): ParsedRobotsTxt {
  const rules = new Map<string, RobotsTxtRule>();
  const lines = content.split('\n');
  let currentUserAgent: string | null = null;
  let hasWildcard = false;

  for (let line of lines) {
    line = line.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const directive = line.substring(0, colonIndex).trim().toLowerCase();
    const value = line.substring(colonIndex + 1).trim();

    if (directive === 'user-agent') {
      currentUserAgent = value.toLowerCase();

      if (currentUserAgent === '*') {
        hasWildcard = true;
      }

      if (!rules.has(currentUserAgent)) {
        rules.set(currentUserAgent, {
          userAgent: currentUserAgent,
          disallow: [],
          allow: []
        });
      }
    } else if (currentUserAgent && (directive === 'disallow' || directive === 'allow')) {
      const rule = rules.get(currentUserAgent);
      if (rule) {
        if (directive === 'disallow' && value) {
          rule.disallow.push(value);
        } else if (directive === 'allow' && value) {
          rule.allow.push(value);
        }
      }
    }
  }

  return { rules, hasWildcard };
}

export function isPathAllowed(
  path: string,
  disallowRules: string[],
  allowRules: string[]
): boolean {
  for (const allowPattern of allowRules) {
    if (pathMatchesPattern(path, allowPattern)) {
      return true;
    }
  }

  for (const disallowPattern of disallowRules) {
    if (pathMatchesPattern(path, disallowPattern)) {
      return false;
    }
  }

  return true;
}

function pathMatchesPattern(path: string, pattern: string): boolean {
  if (pattern === '/') {
    return true;
  }

  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    return path.startsWith(prefix);
  }

  if (pattern.endsWith('$')) {
    const exactPath = pattern.slice(0, -1);
    return path === exactPath;
  }

  return path.startsWith(pattern);
}

export function checkBotAllowed(
  botName: BotName,
  parsedRobots: ParsedRobotsTxt,
  requestedPath: string = '/'
): { allowed: boolean; rule: string | null } {
  const botNameLower = botName.toLowerCase();

  let specificRule = parsedRobots.rules.get(botNameLower);

  if (specificRule) {
    const allowed = isPathAllowed(requestedPath, specificRule.disallow, specificRule.allow);
    if (!allowed) {
      const matchingDisallow = specificRule.disallow.find(pattern =>
        pathMatchesPattern(requestedPath, pattern)
      );
      return {
        allowed: false,
        rule: `User-agent: ${botName}\nDisallow: ${matchingDisallow || specificRule.disallow[0]}`
      };
    }
  }

  if (parsedRobots.hasWildcard) {
    const wildcardRule = parsedRobots.rules.get('*');
    if (wildcardRule) {
      const allowed = isPathAllowed(requestedPath, wildcardRule.disallow, wildcardRule.allow);
      if (!allowed) {
        const matchingDisallow = wildcardRule.disallow.find(pattern =>
          pathMatchesPattern(requestedPath, pattern)
        );
        return {
          allowed: false,
          rule: `User-agent: *\nDisallow: ${matchingDisallow || wildcardRule.disallow[0]}`
        };
      }
    }
  }

  return { allowed: true, rule: null };
}

export function calculateBotPenalty(blockedCount: number): number {
  if (blockedCount === 0) return 0;
  if (blockedCount === 1) return 5;
  if (blockedCount === 2) return 10;
  if (blockedCount === 3) return 15;
  if (blockedCount === 4) return 20;
  return 30;
}

export function getFixInstructions(
  botName: BotName,
  blockReason: BlockReason,
  robotsTxtRule: string | null
): { title: string; description: string; steps: string[] } {
  const botInfo = getBotInfo(botName);
  const platform = botInfo?.platform || botName;

  if (blockReason === 'robots_txt') {
    return {
      title: `Remove ${botName} block from robots.txt`,
      description: `Your robots.txt file is blocking ${botName}, which means your site cannot appear in ${platform} search results.`,
      steps: [
        'Open your website\'s robots.txt file (usually at yourdomain.com/robots.txt)',
        robotsTxtRule
          ? `Remove or comment out these lines:\n${robotsTxtRule}`
          : `Remove the Disallow rule for ${botName}`,
        'Save the file and upload to your web server',
        'Wait 24-48 hours for the bot to re-crawl your site',
        'Re-analyze your page to verify the fix'
      ]
    };
  }

  if (blockReason === 'firewall') {
    return {
      title: `Unblock ${botName} in your firewall`,
      description: `Your server or firewall is blocking ${botName} requests, preventing ${platform} from accessing your content.`,
      steps: [
        'Check your firewall settings (Cloudflare, WAF, server firewall)',
        `Add ${botName} to your allowlist or whitelist`,
        'Ensure the user-agent is not blocked by security rules',
        'If using Cloudflare: Go to Security > WAF > Tools and add user-agent exception',
        'Test by making a request with the bot user-agent',
        'Re-analyze your page to verify the fix'
      ]
    };
  }

  return {
    title: `Enable ${botName} access`,
    description: `${botName} is being blocked, which prevents your site from appearing in ${platform} results.`,
    steps: [
      'Check your robots.txt file for blocking rules',
      'Check your server/firewall configuration',
      'Ensure no security plugins are blocking AI bots',
      'Consult your hosting provider if needed'
    ]
  };
}
