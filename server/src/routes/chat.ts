import { Router, Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { createError } from "../middleware/errorHandler";

const router = Router();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL    = process.env.OLLAMA_MODEL    ?? "llama3.2";

const SYSTEM_PROMPT = {
  role: "system",
  content:
    "You are a helpful support assistant for Fix It Now, a civic complaint management platform " +
    "in Tamil Nadu, India. You help citizens report infrastructure issues (roads, water, garbage, " +
    "lighting, drainage), track their complaint status, and understand how the platform works. " +
    "Be concise, friendly, and practical. If asked about something outside the platform, politely " +
    "redirect the conversation back to civic issues and the Fix It Now app.",
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// ─── POST /chat ───────────────────────────────────────────────────────────────
// Public endpoint — no auth required.
// Body: { messages: { role: "user" | "assistant", content: string }[] }
router.post(
  "/",
  [
    body("messages")
      .isArray({ min: 1 })
      .withMessage("messages must be a non-empty array"),
    body("messages.*.role")
      .isIn(["user", "assistant"])
      .withMessage("Each message role must be 'user' or 'assistant'"),
    body("messages.*.content")
      .isString()
      .notEmpty()
      .withMessage("Each message must have non-empty content"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const details = errors.array().reduce<Record<string, string[]>>((acc, e) => {
        const field = (e as { path: string }).path;
        acc[field] = [...(acc[field] ?? []), e.msg];
        return acc;
      }, {});
      return next(createError("Validation failed", 422, details));
    }

    const { messages } = req.body as { messages: ChatMessage[] };

    try {
      const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [SYSTEM_PROMPT, ...messages],
          stream: false,
        }),
      });

      if (!ollamaRes.ok) {
        const text = await ollamaRes.text().catch(() => "");
        console.error(`[Ollama] HTTP ${ollamaRes.status}: ${text}`);
        return next(createError("AI service returned an error", 502));
      }

      const data = (await ollamaRes.json()) as {
        message?: { content?: string };
      };

      const reply = data?.message?.content ?? "";
      res.json({ success: true, data: { message: reply } });
    } catch (err: unknown) {
      const isConnectionError =
        err instanceof Error &&
        (err.message.includes("ECONNREFUSED") || err.message.includes("fetch failed"));

      if (isConnectionError) {
        return next(createError("AI service unavailable. Make sure Ollama is running.", 503));
      }
      next(err);
    }
  },
);

export default router;
