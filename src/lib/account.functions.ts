import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type ConversationRow = {
  id: string;
  title: string;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type MessageSource = {
  slug: string;
  serviceName: string;
  authority: string;
  url: string;
  lastVerified: string;
};

export type MessageRow = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources: MessageSource[];
  created_at: string;
};

const CONVERSATION_COLUMNS = "id,title,status,created_at,updated_at,archived_at";

function fail(message: string): never {
  throw new Error(message);
}

/* ------------------------------- profile ------------------------------- */

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id,display_name,avatar_url,theme")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) fail("We couldn't load your profile. Please try again.");
    if (data) return data;

    const { data: created, error: insertError } = await context.supabase
      .from("profiles")
      .insert({ id: context.userId })
      .select("id,display_name,avatar_url,theme")
      .single();
    if (insertError) fail("We couldn't load your profile. Please try again.");
    return created;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        displayName: z.string().trim().min(1).max(60).optional(),
        theme: z.enum(["light", "dark", "system"]).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const patch: { display_name?: string; theme?: string } = {};
    if (data.displayName) patch.display_name = data.displayName;
    if (data.theme) patch.theme = data.theme;
    if (Object.keys(patch).length === 0) fail("Nothing to update.");

    const { data: updated, error } = await context.supabase
      .from("profiles")
      .update(patch)
      .eq("id", context.userId)
      .select("id,display_name,avatar_url,theme")
      .single();
    if (error) fail("We couldn't save your profile. Please try again.");
    return updated;
  });

/* ---------------------------- conversations ---------------------------- */

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        status: z.enum(["active", "archived"]).default("active"),
        limit: z.number().int().min(1).max(50).default(25),
        before: z.string().optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    let query = context.supabase
      .from("conversations")
      .select(CONVERSATION_COLUMNS)
      .eq("user_id", context.userId)
      .eq("status", data.status)
      .order("updated_at", { ascending: false })
      .limit(data.limit);
    if (data.before) query = query.lt("updated_at", data.before);

    const { data: rows, error } = await query;
    if (error) fail("We couldn't load your conversations.");
    return (rows ?? []) as ConversationRow[];
  });

export const searchConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ q: z.string().trim().min(1).max(120) }).parse(data))
  .handler(async ({ data, context }) => {
    const term = `%${data.q.replace(/[%_]/g, "")}%`;

    const [byTitle, byMessage] = await Promise.all([
      context.supabase
        .from("conversations")
        .select(CONVERSATION_COLUMNS)
        .eq("user_id", context.userId)
        .ilike("title", term)
        .order("updated_at", { ascending: false })
        .limit(20),
      context.supabase
        .from("messages")
        .select("conversation_id")
        .eq("user_id", context.userId)
        .ilike("content", term)
        .limit(120),
    ]);

    if (byTitle.error || byMessage.error) fail("Search is unavailable right now.");

    const found = new Map<string, ConversationRow>();
    for (const row of (byTitle.data ?? []) as ConversationRow[]) found.set(row.id, row);

    const missingIds = [
      ...new Set((byMessage.data ?? []).map((m) => m.conversation_id as string)),
    ].filter((id) => !found.has(id));

    if (missingIds.length > 0) {
      const { data: extra } = await context.supabase
        .from("conversations")
        .select(CONVERSATION_COLUMNS)
        .eq("user_id", context.userId)
        .in("id", missingIds.slice(0, 20));
      for (const row of (extra ?? []) as ConversationRow[]) found.set(row.id, row);
    }

    return [...found.values()].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  });

export const createConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("conversations")
      .insert({ user_id: context.userId })
      .select(CONVERSATION_COLUMNS)
      .single();
    if (error) fail("We couldn't start a new conversation.");
    return data as ConversationRow;
  });

export const getConversation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ id: z.string().uuid(), limit: z.number().int().min(10).max(200).default(60) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: conversation, error } = await context.supabase
      .from("conversations")
      .select(CONVERSATION_COLUMNS)
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) fail("We couldn't load that conversation.");
    if (!conversation) return { conversation: null, messages: [] as MessageRow[] };

    const { data: messages, error: messageError } = await context.supabase
      .from("messages")
      .select("id,role,content,sources,created_at")
      .eq("conversation_id", data.id)
      .order("created_at", { ascending: true })
      .limit(data.limit);
    if (messageError) fail("We couldn't load the messages in this conversation.");

    return {
      conversation: conversation as ConversationRow,
      messages: ((messages ?? []) as unknown[]).map((row) => {
        const m = row as MessageRow;
        return {
          id: m.id,
          role: m.role,
          content: m.content,
          created_at: m.created_at,
          sources: Array.isArray(m.sources) ? (m.sources as MessageSource[]) : [],
        };
      }),
    };
  });

export const setConversationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["active", "archived"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("conversations")
      .update({
        status: data.status,
        archived_at: data.status === "archived" ? new Date().toISOString() : null,
      })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) fail("We couldn't update that conversation.");
    return { ok: true } as const;
  });

export const renameConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), title: z.string().trim().min(1).max(70) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("conversations")
      .update({ title: data.title })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) fail("We couldn't rename that conversation.");
    return { ok: true } as const;
  });

export const deleteConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("conversations")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) fail("We couldn't delete that conversation.");
    return { ok: true } as const;
  });

export const deleteAllConversations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("conversations")
      .delete()
      .eq("user_id", context.userId);
    if (error) fail("We couldn't delete your conversations. Please try again.");
    return { ok: true } as const;
  });

/* -------------------------------- usage -------------------------------- */

export const getMyUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("messages")
      .select("input_tokens,output_tokens,total_tokens")
      .eq("user_id", context.userId)
      .eq("role", "assistant")
      .limit(5000);
    if (error) fail("Usage information is currently unavailable.");

    const rows = data ?? [];
    let input = 0;
    let output = 0;
    let total = 0;
    let withTokens = 0;
    for (const row of rows) {
      if (row.total_tokens !== null || row.input_tokens !== null) withTokens += 1;
      input += row.input_tokens ?? 0;
      output += row.output_tokens ?? 0;
      total += row.total_tokens ?? (row.input_tokens ?? 0) + (row.output_tokens ?? 0);
    }

    return {
      responses: rows.length,
      tokensAvailable: withTokens > 0,
      inputTokens: input,
      outputTokens: output,
      totalTokens: total,
    };
  });

/* --------------------------- ask + persistence -------------------------- */

const askSchema = z.object({
  conversationId: z.string().uuid(),
  question: z.string().trim().min(1).max(2000),
});

export const askInConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => askSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id,title")
      .eq("id", data.conversationId)
      .eq("user_id", userId)
      .maybeSingle();
    if (conversationError) return { error: "We couldn't reach that conversation." } as const;
    if (!conversation) return { error: "That conversation is no longer available." } as const;

    const { data: history } = await supabase
      .from("messages")
      .select("role,content")
      .eq("conversation_id", data.conversationId)
      .in("role", ["user", "assistant"])
      .order("created_at", { ascending: true })
      .limit(20);

    const { error: userInsertError } = await supabase.from("messages").insert({
      conversation_id: data.conversationId,
      user_id: userId,
      role: "user",
      content: data.question,
    });
    if (userInsertError)
      return { error: "We couldn't save your message. Please try again." } as const;

    const { askAssistant } = await import("./govguide-chat.server");
    const { AssistantError, generateTitle } = await import("./govguide-gateway.server");

    const turns = [
      ...((history ?? []) as { role: "user" | "assistant"; content: string }[]),
      { role: "user" as const, content: data.question },
    ];

    let result;
    try {
      result = await askAssistant(turns);
    } catch (error) {
      if (error instanceof AssistantError) return { error: error.message } as const;
      console.error("askInConversation failed", error);
      return { error: "Something went wrong on our side. Please try again." } as const;
    }

    const { data: assistantRow, error: assistantError } = await supabase
      .from("messages")
      .insert({
        conversation_id: data.conversationId,
        user_id: userId,
        role: "assistant",
        content: result.answer,
        sources: result.sources,
        input_tokens: result.usage.inputTokens,
        output_tokens: result.usage.outputTokens,
        total_tokens: result.usage.totalTokens,
      })
      .select("id,created_at")
      .single();
    if (assistantError) {
      console.error("saving assistant message failed", assistantError);
      return { error: "The answer couldn't be saved. Please try again." } as const;
    }

    let title = conversation.title;
    if (!history || history.length === 0) {
      title = await generateTitle(data.question);
      await supabase
        .from("conversations")
        .update({ title })
        .eq("id", data.conversationId)
        .eq("user_id", userId);
    } else {
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", data.conversationId)
        .eq("user_id", userId);
    }

    return {
      answer: result.answer,
      sources: result.sources,
      messageId: assistantRow.id,
      title,
    } as const;
  });

/* ----------------------- guest conversation import ---------------------- */

export const importGuestConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().trim().min(1).max(8000),
            }),
          )
          .min(1)
          .max(60),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const firstQuestion =
      data.messages.find((m) => m.role === "user")?.content ?? "Saved conversation";
    const { generateTitle } = await import("./govguide-gateway.server");
    const title = await generateTitle(firstQuestion);

    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert({ user_id: userId, title })
      .select("id")
      .single();
    if (error) fail("We couldn't save that conversation to your account.");

    const base = Date.now();
    const { error: messageError } = await supabase.from("messages").insert(
      data.messages.map((message, index) => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: message.role,
        content: message.content,
        created_at: new Date(base + index * 1000).toISOString(),
      })),
    );
    if (messageError) fail("We couldn't save the messages from that conversation.");

    return { id: conversation.id as string } as const;
  });
