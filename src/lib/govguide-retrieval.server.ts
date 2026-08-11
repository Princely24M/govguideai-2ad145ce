import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type RetrievedService = {
  id: string;
  slug: string;
  service_name: string;
  category: string;
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

type RetrievedFaq = { service_id: string | null; question: string; answer: string };

/**
 * Keyword retrieval over the structured knowledge base. This is the "R" of a future RAG
 * pipeline: swap this function for a pgvector similarity search and the rest of the chat
 * flow keeps working unchanged (an `embedding vector(1536)` column already exists).
 */
const SYNONYMS: Record<string, string[]> = {
  "smart-id": ["id", "identity", "smart id", "id card", "id book", "identity document", "green book", "16"],
  passport: ["passport", "travel document", "travel", "overseas", "abroad", "visa page"],
  "learners-licence": ["learner", "learners", "learner's", "k53", "written test", "learners test"],
  "drivers-licence": ["driver", "drivers", "driver's", "driving", "driving licence", "driving license", "practical test", "renew licence card"],
  "vehicle-licence": ["vehicle", "car licence", "licence disc", "disc", "registration", "roadworthy", "mvl2", "number plate"],
  "social-grants": ["grant", "grants", "sassa", "social grant", "child support", "old age", "pension", "disability", "srd", "foster"],
  uif: ["uif", "unemployment", "retrenched", "retrenchment", "maternity", "ufiling", "ui-19", "labour", "dismissed"],
  "business-registration": ["business", "company", "cipc", "register a company", "pty", "startup", "sole proprietor", "trading name"],
};

function scoreService(service: RetrievedService, text: string) {
  let score = 0;
  const haystack = `${service.service_name} ${service.category} ${service.description}`.toLowerCase();

  for (const word of service.service_name.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3)) {
    if (text.includes(word)) score += 4;
  }
  for (const term of SYNONYMS[service.slug] ?? []) {
    if (text.includes(term)) score += term.includes(" ") ? 6 : 3;
  }
  for (const word of text.split(/[^a-z]+/).filter((w) => w.length > 4)) {
    if (haystack.includes(word)) score += 1;
  }
  return score;
}

function block(label: string, values: string[] | null) {
  if (!values || values.length === 0) return "";
  return `\n${label}:\n${values.map((v) => `- ${v}`).join("\n")}`;
}

export async function retrieveContext(question: string, history: string[]) {
  const text = `${history.join(" ")} ${question} ${question}`.toLowerCase();

  const [{ data: services, error }, { data: faqs }] = await Promise.all([
    supabaseAdmin
      .from("government_services")
      .select(
        "id,slug,service_name,category,description,eligibility,required_documents,application_steps,fees,processing_time,locations,important_notes,province,source_authority,source_url,last_verified",
      ),
    supabaseAdmin.from("faq_entries").select("service_id,question,answer"),
  ]);

  if (error) throw new Error(error.message);

  const all = (services ?? []) as RetrievedService[];
  const faqList = (faqs ?? []) as RetrievedFaq[];

  const ranked = all
    .map((service) => ({ service, score: scoreService(service, text) }))
    .sort((a, b) => b.score - a.score);

  const matched = ranked.filter((entry) => entry.score >= 4).slice(0, 3);

  // Nothing matched: give the model the catalogue only, so it can clarify or say it does not know.
  if (matched.length === 0) {
    const catalogue = all
      .map((s) => `- ${s.service_name} (${s.category}): ${s.description}`)
      .join("\n");
    return {
      context: `AVAILABLE SERVICES IN THE KNOWLEDGE BASE (no specific match for this question):\n${catalogue}`,
      services: [] as RetrievedService[],
    };
  }

  const context = matched
    .map(({ service }) => {
      const serviceFaqs = faqList.filter((f) => f.service_id === service.id);
      return [
        `### SERVICE: ${service.service_name}`,
        `Category: ${service.category} | Scope: ${service.province}`,
        `Description: ${service.description}`,
        block("Eligibility", service.eligibility),
        block("Required documents", service.required_documents),
        block("Application steps (in order)", service.application_steps),
        service.fees ? `\nFees: ${service.fees}` : "\nFees: NOT VERIFIED in this knowledge base.",
        service.processing_time
          ? `Processing time: ${service.processing_time}`
          : "Processing time: NOT VERIFIED in this knowledge base.",
        block("Where to apply", service.locations),
        block("Important notes", service.important_notes),
        serviceFaqs.length
          ? block("Verified FAQs", serviceFaqs.map((f) => `Q: ${f.question} A: ${f.answer}`))
          : "",
        `\nSource authority: ${service.source_authority}`,
        `Source URL: ${service.source_url}`,
        `Last verified: ${service.last_verified}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n---\n\n");

  return { context, services: matched.map((m) => m.service) };
}
