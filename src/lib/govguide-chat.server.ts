import {
  AssistantError,
  completeChat,
  type GatewayMessage,
  type Usage,
} from "./govguide-gateway.server";
import { buildSystemPrompt, PROMPT_VERSION } from "./govguide-prompt.server";
import { retrieveContext } from "./govguide-retrieval.server";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type AssistantAnswer = {
  answer: string;
  promptVersion: string;
  usage: Usage;
  sources: {
    slug: string;
    serviceName: string;
    authority: string;
    url: string;
    lastVerified: string;
  }[];
};

/** Sanitise user text: cap length and strip control characters before it reaches the model. */
function clean(text: string) {
  // eslint-disable-next-line no-control-regex -- deliberately stripping control characters
  return text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, " ").slice(0, 2000);
}

export async function askAssistant(turns: ChatTurn[]): Promise<AssistantAnswer> {
  const recent = turns.slice(-10).map((turn) => ({ ...turn, content: clean(turn.content) }));
  const question = [...recent].reverse().find((turn) => turn.role === "user")?.content ?? "";
  if (!question) throw new AssistantError("Please type a question first.", 400);

  const history = recent
    .filter((t) => t.role === "user")
    .slice(-3)
    .map((t) => t.content);
  const { context, services } = await retrieveContext(question, history);

  const messages: GatewayMessage[] = [
    { role: "system", content: buildSystemPrompt(context) },
    ...recent.map((turn) => ({ role: turn.role, content: turn.content }) as GatewayMessage),
  ];

  const { answer, usage } = await completeChat(messages);

  return {
    answer,
    promptVersion: PROMPT_VERSION,
    usage,
    sources: services.map((service) => ({
      slug: service.slug,
      serviceName: service.service_name,
      authority: service.source_authority,
      url: service.source_url,
      lastVerified: service.last_verified,
    })),
  };
}
