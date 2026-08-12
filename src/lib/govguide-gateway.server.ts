const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.5-flash";

export type GatewayMessage = { role: "system" | "user" | "assistant"; content: string };

export class AssistantError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type Usage = {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
};

export async function completeChat(
  messages: GatewayMessage[],
): Promise<{ answer: string; usage: Usage }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AssistantError("The assistant is not configured yet.", 500);

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.2, max_tokens: 1200 }),
  });

  if (response.status === 429) {
    throw new AssistantError("GovGuide is busy right now. Please try again in a moment.", 429);
  }
  if (response.status === 402) {
    throw new AssistantError("The assistant has run out of AI credits for now.", 402);
  }
  if (!response.ok) {
    console.error("AI gateway error", response.status, await response.text());
    throw new AssistantError("I couldn't reach the assistant. Please try again.", 502);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };
  const answer = payload.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new AssistantError("I couldn't produce an answer. Please try again.", 502);

  const input = payload.usage?.prompt_tokens ?? null;
  const output = payload.usage?.completion_tokens ?? null;
  const total =
    payload.usage?.total_tokens ?? (input !== null && output !== null ? input + output : null);

  return { answer, usage: { inputTokens: input, outputTokens: output, totalTokens: total } };
}

/** Short, human-friendly conversation title. Falls back to a trimmed question. */
export async function generateTitle(question: string): Promise<string> {
  const fallback = fallbackTitle(question);
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return fallback;
  try {
    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        max_tokens: 24,
        messages: [
          {
            role: "system",
            content:
              "Write a title of at most 6 words summarising the user's question about a South African government service. Title Case. No quotes, no punctuation at the end.",
          },
          { role: "user", content: question.slice(0, 400) },
        ],
      }),
    });
    if (!response.ok) return fallback;
    const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const title = payload.choices?.[0]?.message?.content?.replace(/^["'\s]+|["'.\s]+$/g, "");
    if (!title) return fallback;
    return title.split(/\s+/).slice(0, 8).join(" ").slice(0, 70);
  } catch {
    return fallback;
  }
}

function fallbackTitle(question: string) {
  const words = question.replace(/\s+/g, " ").trim().split(" ").slice(0, 6).join(" ");
  return (words.charAt(0).toUpperCase() + words.slice(1)).slice(0, 70) || "New conversation";
}
