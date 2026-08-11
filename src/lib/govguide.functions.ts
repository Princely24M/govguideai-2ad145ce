import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const askGovGuide = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().trim().min(1).max(2000),
            }),
          )
          .min(1)
          .max(30),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { askAssistant } = await import("./govguide-chat.server");
    const { AssistantError } = await import("./govguide-gateway.server");
    try {
      return await askAssistant(data.messages);
    } catch (error) {
      if (error instanceof AssistantError) {
        return { error: error.message, status: error.status } as const;
      }
      console.error("askGovGuide failed", error);
      return { error: "Something went wrong on our side. Please try again.", status: 500 } as const;
    }
  });
