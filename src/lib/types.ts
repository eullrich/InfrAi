// src/lib/types.ts
export interface Page {
  id: string;
  url: string;
  title: string;
  parsed_text: string;
}

// Type for company data including flattened insights for the homepage
export interface CompanyWithInsights {
  id: number;
  name: string;
  tagline: string | null;
  // Removed boolean fields
  offering_labels?: string[] | null; // Added new labels field
  service_offerings_tags?: string[]; // Re-added for homepage filtering logic
  // company_insights is intentionally omitted here as it's flattened
}

// Type for the detailed company insights data
export interface CompanyInsights {
  id: number; // Assuming insights have their own ID
  company_id: number;
  tagline?: string | null;
  mission?: string | null;
  target_audience?: string | null;
  // Removed boolean fields
  offering_labels?: string[] | null; // Added new labels field
  service_offerings?: { name?: string; description?: string; tags?: string[] }[] | null;
  key_differentiators?: string[] | null;
  technology_overview?: string | null;
  partnerships?: string[] | null;
  known_customers?: string[] | null;
  pricing_overview?: string | null;
  processed_at?: string | null; // ISO date string
  llm_model_used?: string | null;
  source_page_ids?: string[] | null; // Assuming IDs are strings, adjust if numbers
  x_url?: string | null; // New field
  linkedin_url?: string | null; // New field
}
