import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { ChatMessage } from "@/lib/api";

const GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi! I'm your Fix It Now assistant. I can help you report issues, track complaints, or answer questions about the platform. How can I help you today?",
};

const STATIC_REPLIES = [
  "You can report a civic issue by navigating to the 'Report Issue' page from the menu. Fill in the details like category, location, and description.",
  "To track your complaints, visit the Dashboard page. You'll see all your submitted issues and their current status.",
  "Fix It Now covers issues like roads, water supply, sanitation, electricity, and public health across Tamil Nadu.",
  "Your complaint will be automatically assigned to the relevant department based on the category you select.",
  "You can upvote existing complaints to help prioritize them. Higher upvoted issues get faster attention.",
  "The map view shows all reported issues across Tamil Nadu. You can filter by category and status.",
];

let replyIndex = 0;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);

  const mutation = useMutation({
    mutationFn: async (_msgs: ChatMessage[]) => {
      // Simulate a short delay
      await new Promise((r) => setTimeout(r, 800));
      const reply = STATIC_REPLIES[replyIndex % STATIC_REPLIES.length];
      replyIndex++;
      return { success: true as const, data: { message: reply } };
    },
  });

  async function sendMessage(text: string) {
    const userMsg: ChatMessage = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);

    try {
      const res = await mutation.mutateAsync(next);
      setMessages([...next, { role: "assistant", content: res.data.message }]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble right now. Please try again later.",
        },
      ]);
    }
  }

  return {
    messages,
    sendMessage,
    isLoading: mutation.isPending,
  };
}
