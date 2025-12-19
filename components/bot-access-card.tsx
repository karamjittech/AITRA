"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, Shield, Bot, Loader2 } from "lucide-react";
import { BotAccessStatus, BotInfo } from "@/lib/types";
import { BOT_CONFIGS, getFixInstructions } from "@/lib/bot-verification";
import { useState } from "react";

interface BotAccessCardProps {
  botAccessData: BotAccessStatus[];
  scorePenalty: number;
  loading?: boolean;
}

export function BotAccessCard({ botAccessData, scorePenalty, loading = false }: BotAccessCardProps) {
  const allowedBots = botAccessData.filter(b => b.isAllowed);
  const blockedBots = botAccessData.filter(b => !b.isAllowed);
  const totalBots = botAccessData.length;

  const getBotConfig = (botName: string): BotInfo | undefined => {
    return BOT_CONFIGS.find(b => b.name === botName);
  };

  const getSeverityColor = () => {
    if (blockedBots.length === 0) return "green";
    if (blockedBots.length <= 2) return "yellow";
    return "red";
  };

  const severityColor = getSeverityColor();

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${blockedBots.length > 0 ? 'text-red-600' : 'text-green-600'}`} />
            <CardTitle>AI Crawler Access</CardTitle>
          </div>
          {scorePenalty > 0 && (
            <Badge variant="destructive" className="font-semibold">-{scorePenalty} points</Badge>
          )}
        </div>
        <CardDescription>
          Verification that AI bots can physically access your site
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-blue-50 border-blue-200">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Checking AI bot access...</p>
                <p className="text-xs text-blue-700 mt-1">Verifying which AI crawlers can access your site (3-5 seconds)</p>
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {blockedBots.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Critical Issue:</strong> {blockedBots.length} of {totalBots} AI bots are blocked from accessing your site.
                  This means your content cannot appear in their search results.
                </AlertDescription>
              </Alert>
            )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Bot Access Summary</span>
            <span className={`${severityColor === 'green' ? 'text-green-600' : severityColor === 'yellow' ? 'text-yellow-600' : 'text-red-600'}`}>
              {allowedBots.length} of {totalBots} bots allowed
            </span>
          </div>

          {blockedBots.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-red-600">Blocked Bots (Fix These First)</h4>
              {blockedBots.map(bot => {
                const config = getBotConfig(bot.botName);
                const fixInstructions = getFixInstructions(bot.botName, bot.blockReason, bot.robotsTxtRule);

                return (
                  <BotStatusItem
                    key={bot.id}
                    bot={bot}
                    config={config}
                    fixInstructions={fixInstructions}
                  />
                );
              })}
            </div>
          )}

          {allowedBots.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-green-600">Allowed Bots</h4>
              {allowedBots.map(bot => {
                const config = getBotConfig(bot.botName);
                return (
                  <BotStatusItem
                    key={bot.id}
                    bot={bot}
                    config={config}
                  />
                );
              })}
            </div>
          )}
        </div>

            {blockedBots.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  All AI bots can access your site. No action needed.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface BotStatusItemProps {
  bot: BotAccessStatus;
  config?: BotInfo;
  fixInstructions?: { title: string; description: string; steps: string[] };
}

function BotStatusItem({ bot, config, fixInstructions }: BotStatusItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`p-3 rounded-lg border ${bot.isAllowed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          {bot.isAllowed ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Bot className="h-4 w-4" />
              <span className="font-medium text-sm">
                {config?.displayName || bot.botName}
              </span>
              {config && (
                <Badge variant="outline" className="text-xs">
                  {config.platform}
                </Badge>
              )}
            </div>

            {config && (
              <p className="text-xs text-gray-600 mt-0.5">{config.description}</p>
            )}

            {!bot.isAllowed && (
              <div className="mt-1">
                <Badge variant="destructive" className="text-xs">
                  {bot.blockReason === 'robots_txt' && 'Blocked in robots.txt'}
                  {bot.blockReason === 'firewall' && 'Blocked by firewall'}
                  {bot.blockReason === 'user_agent_block' && 'User-agent blocked'}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {!bot.isAllowed && fixInstructions && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              How to Fix
              <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="p-3 bg-white rounded border border-gray-200 space-y-2">
                <h5 className="text-xs font-semibold">{fixInstructions.title}</h5>
                <p className="text-xs text-gray-700">{fixInstructions.description}</p>
                <div className="space-y-1.5 mt-2">
                  <p className="text-xs font-semibold text-gray-900">Steps to fix:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                    {fixInstructions.steps.map((step, index) => (
                      <li key={index} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
