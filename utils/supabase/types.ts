export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          created_at: string
          gsc_connected: boolean
          gsc_property_url: string | null
          subscription_plan: string
        }
        Insert: {
          id: string
          email?: string | null
          created_at?: string
          gsc_connected?: boolean
          gsc_property_url?: string | null
          subscription_plan?: string
        }
        Update: {
          id?: string
          email?: string | null
          created_at?: string
          gsc_connected?: boolean
          gsc_property_url?: string | null
          subscription_plan?: string
        }
      }
      websites: {
        Row: {
          id: string
          user_id: string
          url: string
          domain: string
          created_at: string
          last_scraped: string | null
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          domain: string
          created_at?: string
          last_scraped?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          domain?: string
          created_at?: string
          last_scraped?: string | null
        }
      }
      tracked_keywords: {
        Row: {
          id: string
          website_id: string
          keyword: string
          search_volume: number | null
          created_at: string
        }
        Insert: {
          id?: string
          website_id: string
          keyword: string
          search_volume?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          website_id?: string
          keyword?: string
          search_volume?: number | null
          created_at?: string
        }
      }
      serp_snapshots: {
        Row: {
          id: string
          keyword_id: string
          snapshot_date: string
          has_ai_overview: boolean | null
          ai_overview_html: string | null
          cited_domains: string[]
          your_site_cited: boolean | null
          your_site_position: number | null
          estimated_traffic_impact: number | null
        }
        Insert: {
          id?: string
          keyword_id: string
          snapshot_date?: string
          has_ai_overview?: boolean | null
          ai_overview_html?: string | null
          cited_domains?: string[]
          your_site_cited?: boolean | null
          your_site_position?: number | null
          estimated_traffic_impact?: number | null
        }
        Update: {
          id?: string
          keyword_id?: string
          snapshot_date?: string
          has_ai_overview?: boolean | null
          ai_overview_html?: string | null
          cited_domains?: string[]
          your_site_cited?: boolean | null
          your_site_position?: number | null
          estimated_traffic_impact?: number | null
        }
      }
      page_data: {
        Row: {
          id: string
          website_id: string
          url: string | null
          title: string | null
          meta_description: string | null
          h1_count: number | null
          h2_count: number | null
          has_faq_schema: boolean | null
          has_howto_schema: boolean | null
          readability_score: number | null
          last_scraped: string
        }
        Insert: {
          id?: string
          website_id: string
          url?: string | null
          title?: string | null
          meta_description?: string | null
          h1_count?: number | null
          h2_count?: number | null
          has_faq_schema?: boolean | null
          has_howto_schema?: boolean | null
          readability_score?: number | null
          last_scraped?: string
        }
        Update: {
          id?: string
          website_id?: string
          url?: string | null
          title?: string | null
          meta_description?: string | null
          h1_count?: number | null
          h2_count?: number | null
          has_faq_schema?: boolean | null
          has_howto_schema?: boolean | null
          readability_score?: number | null
          last_scraped?: string
        }
      }
      scores: {
        Row: {
          id: string
          page_id: string
          structure_score: number | null
          metadata_score: number | null
          content_score: number | null
          citation_pattern_score: number | null
          overall_ai_readiness: number | null
          calculated_at: string
        }
        Insert: {
          id?: string
          page_id: string
          structure_score?: number | null
          metadata_score?: number | null
          content_score?: number | null
          citation_pattern_score?: number | null
          overall_ai_readiness?: number | null
          calculated_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          structure_score?: number | null
          metadata_score?: number | null
          content_score?: number | null
          citation_pattern_score?: number | null
          overall_ai_readiness?: number | null
          calculated_at?: string
        }
      }
      gsc_metrics: {
        Row: {
          id: string
          website_id: string
          keyword: string | null
          impressions: number | null
          clicks: number | null
          ctr: number | null
          avg_position: number | null
          data_date: string | null
        }
        Insert: {
          id?: string
          website_id: string
          keyword?: string | null
          impressions?: number | null
          clicks?: number | null
          ctr?: number | null
          avg_position?: number | null
          data_date?: string | null
        }
        Update: {
          id?: string
          website_id?: string
          keyword?: string | null
          impressions?: number | null
          clicks?: number | null
          ctr?: number | null
          avg_position?: number | null
          data_date?: string | null
        }
      }
      fixes_generated: {
        Row: {
          id: string
          page_id: string
          fix_type: string | null
          schema_json: Json | null
          applied: boolean
          created_at: string
        }
        Insert: {
          id?: string
          page_id: string
          fix_type?: string | null
          schema_json?: Json | null
          applied?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          fix_type?: string | null
          schema_json?: Json | null
          applied?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
