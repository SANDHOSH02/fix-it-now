import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { chatApi, ChatMessage } from "@/lib/api";

const GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi! I'm your Fix It Now assistant. I can help you report issues, track complaints, or answer questions about the platform. How can I help you today?",
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);

  const mutation = useMutation({
    mutationFn: (msgs: ChatMessage[]) => chatApi.send(msgs),
  });

  async function sendMessage(text: string) {
    const userMsg: ChatMessage = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);

    try {
      const res = await mutation.mutateAsync(
        // Send conversation without the initial greeting (it's handled server-side via system prompt)
        next.filter((m) => m !== GREETING),
      );
      setMessages([...next, { role: "assistant", content: res.data.message }]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting to the AI service right now. Please make sure Ollama is running.",
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
