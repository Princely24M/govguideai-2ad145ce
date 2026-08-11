import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type GovernmentService = {
  id: string;
  service_name: string;
  slug: string;
  category: string;
  icon: string;
  description: string;
  eligibility: string[];
  required_documents: string[];
  application_steps: string[];
  fees: string | null;
  processing_time: string | null;
  locations: string[];
  important_notes: string[];
  province: string;
  source_authority: string;
  source_url: string;
  last_verified: string;
};

export type FaqEntry = {
  id: string;
  service_id: string | null;
  question: string;
  answer: string;
  last_verified: string;
};

export const SERVICE_COLUMNS =
  "id,service_name,slug,category,icon,description,eligibility,required_documents,application_steps,fees,processing_time,locations,important_notes,province,source_authority,source_url,last_verified";

export const CATEGORY_ORDER = [
  "Identity",
  "Travel",
  "Transport",
  "Social Services",
  "Business",
  "Other Public Services",
];

export const servicesQuery = queryOptions({
  queryKey: ["government_services"],
  queryFn: async (): Promise<GovernmentService[]> => {
    const { data, error } = await supabase
      .from("government_services")
      .select(SERVICE_COLUMNS)
      .order("service_name", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as GovernmentService[];
  },
});

export const serviceDetailQuery = (slug: string) =>
  queryOptions({
    queryKey: ["government_services", slug],
    queryFn: async (): Promise<{ service: GovernmentService | null; faqs: FaqEntry[] }> => {
      const { data, error } = await supabase
        .from("government_services")
        .select(SERVICE_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      const service = (data ?? null) as GovernmentService | null;
      if (!service) return { service: null, faqs: [] };

      const { data: faqs, error: faqError } = await supabase
        .from("faq_entries")
        .select("id,service_id,question,answer,last_verified")
        .eq("service_id", service.id);
      if (faqError) throw new Error(faqError.message);

      return { service, faqs: (faqs ?? []) as FaqEntry[] };
    },
  });

export function formatVerified(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
