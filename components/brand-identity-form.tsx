"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Plus, X, Save, Loader2, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BrandIdentityFormProps {
  brandIdentity: any | null;
  onUpdate: (data: any) => void;
  onSave: () => void;
}

const ORGANIZATION_TYPES = [
  "Organization",
  "Corporation",
  "LocalBusiness",
  "EducationalOrganization",
  "GovernmentOrganization",
  "NGO",
  "PerformingGroup",
  "SportsOrganization",
];

export function BrandIdentityForm({ brandIdentity, onUpdate, onSave }: BrandIdentityFormProps) {
  const [formData, setFormData] = useState({
    organization_name: "",
    organization_type: "Organization",
    logo_url: "",
    description: "",
    website_url: "",
    same_as_links: [] as string[],
    knows_about: [] as string[],
    physical_address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    contact_info: {
      email: "",
      phone: "",
      contactPageUrl: "",
    },
    founding_date: "",
  });

  const [newLink, setNewLink] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (brandIdentity) {
      setFormData({
        organization_name: brandIdentity.organization_name || "",
        organization_type: brandIdentity.organization_type || "Organization",
        logo_url: brandIdentity.logo_url || "",
        description: brandIdentity.description || "",
        website_url: brandIdentity.website_url || "",
        same_as_links: brandIdentity.same_as_links || [],
        knows_about: brandIdentity.knows_about || [],
        physical_address: brandIdentity.physical_address || {
          street: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
        },
        contact_info: brandIdentity.contact_info || {
          email: "",
          phone: "",
          contactPageUrl: "",
        },
        founding_date: brandIdentity.founding_date || "",
      });
    }
  }, [brandIdentity]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value,
      },
    }));
  };

  const addLink = () => {
    if (newLink.trim()) {
      setFormData((prev) => ({
        ...prev,
        same_as_links: [...prev.same_as_links, newLink.trim()],
      }));
      setNewLink("");
    }
  };

  const removeLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      same_as_links: prev.same_as_links.filter((_, i) => i !== index),
    }));
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      setFormData((prev) => ({
        ...prev,
        knows_about: [...prev.knows_about, newTopic.trim()],
      }));
      setNewTopic("");
    }
  };

  const removeTopic = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      knows_about: prev.knows_about.filter((_, i) => i !== index),
    }));
  };

  const detectPlatform = (url: string) => {
    if (url.includes("linkedin.com")) return "LinkedIn";
    if (url.includes("twitter.com") || url.includes("x.com")) return "Twitter";
    if (url.includes("wikipedia.org")) return "Wikipedia";
    if (url.includes("wikidata.org")) return "Wikidata";
    if (url.includes("crunchbase.com")) return "Crunchbase";
    if (url.includes("facebook.com")) return "Facebook";
    if (url.includes("instagram.com")) return "Instagram";
    if (url.includes("orcid.org")) return "ORCID";
    return "Web";
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      const saveData: any = {
        user_id: userData.user.id,
        organization_name: formData.organization_name,
        organization_type: formData.organization_type,
        logo_url: formData.logo_url,
        description: formData.description,
        website_url: formData.website_url,
        same_as_links: formData.same_as_links,
        knows_about: formData.knows_about,
        physical_address: formData.physical_address,
        contact_info: formData.contact_info,
        founding_date: formData.founding_date,
      };

      let result;
      if (brandIdentity?.id) {
        const { user_id, ...updateData } = saveData;
        // @ts-expect-error - brand_identity table type not yet generated
        result = await supabase.from("brand_identity").update(updateData).eq("id", brandIdentity.id);
      } else {
        result = await supabase.from("brand_identity").insert(saveData);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Success",
        description: "Brand identity saved successfully",
      });
      onSave();
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Error",
        description: "Failed to save brand identity",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Information
          </CardTitle>
          <CardDescription>
            Core brand details that establish your entity identity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org_name">
                Organization Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="org_name"
                value={formData.organization_name}
                onChange={(e) => handleInputChange("organization_name", e.target.value)}
                placeholder="Your Company Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org_type">Organization Type</Label>
              <Select
                value={formData.organization_type}
                onValueChange={(value) => handleInputChange("organization_type", value)}
              >
                <SelectTrigger id="org_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORGANIZATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of your organization (200-500 characters)"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length} characters
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                value={formData.website_url}
                onChange={(e) => handleInputChange("website_url", e.target.value)}
                placeholder="https://example.com"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={formData.logo_url}
                onChange={(e) => handleInputChange("logo_url", e.target.value)}
                placeholder="https://example.com/logo.png"
                type="url"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="founding">Founding Date</Label>
            <Input
              id="founding"
              value={formData.founding_date}
              onChange={(e) => handleInputChange("founding_date", e.target.value)}
              type="date"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-blue-600" />
            Authority Links (sameAs)
          </CardTitle>
          <CardDescription>
            <strong className="text-blue-900">Critical for AI trust:</strong> These links establish
            your Knowledge Graph identity. Add LinkedIn, Wikipedia, Crunchbase, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
              onKeyPress={(e) => e.key === "Enter" && addLink()}
            />
            <Button onClick={addLink} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.same_as_links.length > 0 && (
            <div className="space-y-2">
              {formData.same_as_links.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg"
                >
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-1">
                      {detectPlatform(link)}
                    </Badge>
                    <p className="text-sm text-muted-foreground truncate">{link}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink(index)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expertise Topics (knowsAbout)</CardTitle>
          <CardDescription>
            Topics your organization is expert in. Helps AI models understand your authority.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="e.g., SEO, AI, Marketing"
              onKeyPress={(e) => e.key === "Enter" && addTopic()}
            />
            <Button onClick={addTopic} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.knows_about.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.knows_about.map((topic, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {topic}
                  <button onClick={() => removeTopic(index)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Physical Address</CardTitle>
          <CardDescription>
            Business address helps verify legitimacy (required for LocalBusiness schema)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={formData.physical_address.street}
              onChange={(e) => handleNestedChange("physical_address", "street", e.target.value)}
              placeholder="123 Main St, Suite 100"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.physical_address.city}
                onChange={(e) => handleNestedChange("physical_address", "city", e.target.value)}
                placeholder="San Francisco"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.physical_address.state}
                onChange={(e) => handleNestedChange("physical_address", "state", e.target.value)}
                placeholder="CA"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.physical_address.country}
                onChange={(e) => handleNestedChange("physical_address", "country", e.target.value)}
                placeholder="United States"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal">Postal Code</Label>
              <Input
                id="postal"
                value={formData.physical_address.postalCode}
                onChange={(e) =>
                  handleNestedChange("physical_address", "postalCode", e.target.value)
                }
                placeholder="94102"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Ways for customers and AI models to reach you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.contact_info.email}
                onChange={(e) => handleNestedChange("contact_info", "email", e.target.value)}
                placeholder="contact@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.contact_info.phone}
                onChange={(e) => handleNestedChange("contact_info", "phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_page">Contact Page URL</Label>
            <Input
              id="contact_page"
              type="url"
              value={formData.contact_info.contactPageUrl}
              onChange={(e) =>
                handleNestedChange("contact_info", "contactPageUrl", e.target.value)
              }
              placeholder="https://example.com/contact"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Brand Identity
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
