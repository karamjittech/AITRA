"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Code,
  Copy,
  CheckCircle2,
  Loader2,
  Building2,
  MapPin,
  User,
  Sparkles,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/client";

interface EntitySchemaGeneratorProps {
  brandIdentity: any | null;
}

export function EntitySchemaGenerator({ brandIdentity }: EntitySchemaGeneratorProps) {
  const [activeTab, setActiveTab] = useState("organization");
  const [generating, setGenerating] = useState(false);
  const [generatedSchema, setGeneratedSchema] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async (schemaType: string) => {
    if (!brandIdentity) {
      toast({
        title: "Brand Identity Required",
        description: "Please save your brand information first",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-fix`;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fixType: schemaType,
          currentContent: "",
          brandIdentity: {
            organization_name: brandIdentity.organization_name,
            organization_type: brandIdentity.organization_type,
            website_url: brandIdentity.website_url,
            logo_url: brandIdentity.logo_url,
            description: brandIdentity.description,
            same_as_links: brandIdentity.same_as_links,
            knows_about: brandIdentity.knows_about,
            physical_address: brandIdentity.physical_address,
            contact_info: brandIdentity.contact_info,
            founding_date: brandIdentity.founding_date,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Schema generation failed");
      }

      const result = await response.json();
      setGeneratedSchema(JSON.stringify(result.schema, null, 2));

      toast({
        title: "Schema Generated",
        description: "Your schema is ready to implement",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate schema",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedSchema);
      setCopied(true);
      toast({
        title: "Copied to Clipboard",
        description: "Schema code copied successfully",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getSchemaStats = () => {
    if (!brandIdentity) return { sameAsCount: 0, knowsAboutCount: 0, hasAddress: false };

    return {
      sameAsCount: brandIdentity.same_as_links?.length || 0,
      knowsAboutCount: brandIdentity.knows_about?.length || 0,
      hasAddress: !!(
        brandIdentity.physical_address?.street &&
        brandIdentity.physical_address?.city
      ),
    };
  };

  const stats = getSchemaStats();

  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <Sparkles className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <strong className="text-blue-900">AI-Optimized Schemas:</strong> These schemas include
          sameAs and knowsAbout properties proven to increase AI citations by 45%. The generator
          uses your brand identity data to create complete, valid JSON-LD markup.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Schema Readiness</CardTitle>
          <CardDescription>Check your brand data completeness</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Organization Name</span>
            </div>
            {brandIdentity?.organization_name ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Authority Links (sameAs)</span>
            </div>
            <Badge variant={stats.sameAsCount > 0 ? "default" : "secondary"}>
              {stats.sameAsCount} links
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Expertise Topics (knowsAbout)</span>
            </div>
            <Badge variant={stats.knowsAboutCount > 0 ? "default" : "secondary"}>
              {stats.knowsAboutCount} topics
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Physical Address</span>
            </div>
            {stats.hasAddress ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
          </div>

          {(!brandIdentity?.organization_name || stats.sameAsCount === 0) && (
            <Alert className="border-yellow-200 bg-yellow-50 mt-4">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900">
                <strong>Missing Critical Data:</strong> Add organization name and authority links in
                the Brand Identity tab to generate high-quality schemas.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="organization">
            <Building2 className="h-4 w-4 mr-2" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="local-business">
            <MapPin className="h-4 w-4 mr-2" />
            LocalBusiness
          </TabsTrigger>
          <TabsTrigger value="person">
            <User className="h-4 w-4 mr-2" />
            Person
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Schema</CardTitle>
              <CardDescription>
                For companies, brands, and organizations. Establishes entity identity in Knowledge
                Graphs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">What's Included:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Basic organization info (name, type, description)</li>
                  <li>
                    <strong>sameAs links</strong> to Wikipedia, LinkedIn, Crunchbase (critical for AI
                    trust)
                  </li>
                  <li>
                    <strong>knowsAbout</strong> expertise topics (helps AI understand your authority)
                  </li>
                  <li>Contact information and social profiles</li>
                  <li>Founding date and logo</li>
                </ul>
              </div>

              <Button
                onClick={() => handleGenerate("organization-schema-eeat")}
                disabled={generating || !brandIdentity?.organization_name}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Code className="mr-2 h-4 w-4" />
                    Generate Organization Schema
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="local-business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LocalBusiness Schema</CardTitle>
              <CardDescription>
                For businesses with physical locations. Extends Organization schema with
                location-specific properties.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">What's Included:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>All Organization schema properties</li>
                  <li>Complete physical address with PostalAddress markup</li>
                  <li>Opening hours and service area</li>
                  <li>Price range and payment methods</li>
                  <li>Geographic coordinates (if provided)</li>
                </ul>
              </div>

              {!stats.hasAddress && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-900">
                    LocalBusiness schema requires a physical address. Add your address in the Brand
                    Identity tab.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={() => handleGenerate("local-business-schema")}
                disabled={generating || !brandIdentity?.organization_name || !stats.hasAddress}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Code className="mr-2 h-4 w-4" />
                    Generate LocalBusiness Schema
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="person" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Person Schema</CardTitle>
              <CardDescription>
                For individual authors, experts, and thought leaders. Establishes personal authority.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">What's Included:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Personal information (name, job title, description)</li>
                  <li>
                    <strong>sameAs links</strong> to LinkedIn, ORCID, personal website
                  </li>
                  <li>
                    <strong>knowsAbout</strong> areas of expertise
                  </li>
                  <li>Affiliation with organization</li>
                  <li>Contact points and social profiles</li>
                </ul>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  Person schema uses your organization data as a starting point. Customize the
                  generated schema with individual author details.
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => handleGenerate("person-schema-eeat")}
                disabled={generating || !brandIdentity?.organization_name}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Code className="mr-2 h-4 w-4" />
                    Generate Person Schema
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {generatedSchema && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-green-900">Generated Schema</CardTitle>
                <CardDescription className="text-green-700">
                  Copy this code and add it to your website's &lt;head&gt; section
                </CardDescription>
              </div>
              <Button onClick={handleCopy} variant="outline" size="sm">
                {copied ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                <code>{`<script type="application/ld+json">\n${generatedSchema}\n</script>`}</code>
              </pre>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-sm text-green-900">How to Implement:</h4>
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                <li>Copy the code above</li>
                <li>Add it to the &lt;head&gt; section of your website</li>
                <li>Test with Google's Rich Results Test tool</li>
                <li>
                  Verify at{" "}
                  <a
                    href="https://search.google.com/test/rich-results"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    search.google.com/test/rich-results
                  </a>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Why Schema Matters for AI:</strong>
            </p>
            <p>
              Schema.org markup helps AI models understand your entity identity, authority, and
              relationships. The sameAs property is particularly critical - it connects your website
              to authoritative external sources like Wikipedia, LinkedIn, and Wikidata.
            </p>
            <p className="mt-3">
              <strong className="text-foreground">Research shows:</strong> Sites with comprehensive
              entity schemas and sameAs links see 45% more AI citations compared to those without.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
