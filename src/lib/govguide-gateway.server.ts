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

export async function completeChat(messages: GatewayMessage[]) {
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
  };
  const answer = payload.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new AssistantError("I couldn't produce an answer. Please try again.", 502);
  return answer;
}
