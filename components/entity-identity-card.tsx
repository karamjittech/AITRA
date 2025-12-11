"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, User, Network, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface EntityIdentityCardProps {
  entityType: string;
  entityIdentityScore: number;
  hasOrganizationSchema: boolean;
  hasPersonSchema: boolean;
  hasSameAsLinks: boolean;
  sameAsPlatforms: string[];
  onDefineEntity?: () => void;
}

export function EntityIdentityCard({
  entityType,
  entityIdentityScore,
  hasOrganizationSchema,
  hasPersonSchema,
  hasSameAsLinks,
  sameAsPlatforms,
  onDefineEntity,
}: EntityIdentityCardProps) {
  const maxScore = 15;
  const percentage = (entityIdentityScore / maxScore) * 100;

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = () => {
    if (percentage >= 80) return "bg-green-100";
    if (percentage >= 50) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getEntityIcon = () => {
    if (entityType === "organization") return <Building2 className="h-5 w-5" />;
    if (entityType === "person") return <User className="h-5 w-5" />;
    if (entityType === "both") return <Network className="h-5 w-5" />;
    return <AlertCircle className="h-5 w-5" />;
  };

  const getEntityLabel = () => {
    if (entityType === "organization") return "Organization";
    if (entityType === "person") return "Person";
    if (entityType === "both") return "Organization & Person";
    return "No Entity Identity";
  };

  const needsImprovement = entityIdentityScore < maxScore;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getEntityIcon()}
            <CardTitle className="text-xl">Entity Identity</CardTitle>
          </div>
          <Badge variant={entityType === "none" ? "destructive" : "default"}>
            {getEntityLabel()}
          </Badge>
        </div>
        <CardDescription>
          Knowledge Graph connections that help AI models verify your authority
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Entity Identity Score</span>
            <span className={`text-2xl font-bold ${getScoreColor()}`}>
              {entityIdentityScore}/{maxScore}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${getScoreBgColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {percentage >= 80 && "Excellent entity identity!"}
            {percentage >= 50 && percentage < 80 && "Good start, but can be improved"}
            {percentage < 50 && "Entity identity needs improvement"}
          </p>
        </div>

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold text-sm">Schema Markup Status</h4>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {hasOrganizationSchema ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Organization Schema</span>
              {hasOrganizationSchema && (
                <Badge variant="secondary" className="text-xs">+5 points</Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasPersonSchema ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Person Schema</span>
              {hasPersonSchema && (
                <Badge variant="secondary" className="text-xs">+3 points</Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasSameAsLinks ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Knowledge Graph Links (sameAs)</span>
              {hasSameAsLinks && (
                <Badge variant="secondary" className="text-xs">+7 points</Badge>
              )}
            </div>
          </div>
        </div>

        {sameAsPlatforms.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-2">Connected Platforms</h4>
            <div className="flex flex-wrap gap-2">
              {sameAsPlatforms.map((platform) => (
                <Badge key={platform} variant="outline" className="text-xs">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {needsImprovement && (
          <div className="border-t pt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-blue-900">
                  Why Entity Identity Matters
                </h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Research shows government sources are <strong>11.75x more likely</strong> to be cited by AI models.
                  Entity identity helps AI verify your authority through Knowledge Graph connections like Wikipedia,
                  Wikidata, and LinkedIn.
                </p>
              </div>

              {entityType === "none" && onDefineEntity && (
                <Button onClick={onDefineEntity} className="w-full" size="sm">
                  <Network className="h-4 w-4 mr-2" />
                  Define Brand Entity
                </Button>
              )}

              {entityType !== "none" && !hasSameAsLinks && (
                <div className="space-y-2">
                  <p className="text-xs text-blue-700">
                    <strong>Next Step:</strong> Add sameAs links to connect your entity to Knowledge Graphs
                  </p>
                  {onDefineEntity && (
                    <Button onClick={onDefineEntity} variant="outline" className="w-full" size="sm">
                      Add Knowledge Graph Links
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!needsImprovement && (
          <div className="border-t pt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-green-900">Perfect Entity Identity!</h4>
                  <p className="text-xs text-green-700 mt-1">
                    Your entity is fully defined with Knowledge Graph connections.
                    AI models can verify your authority through established identity markers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
