import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, isLoading } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage(text);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="flex flex-col w-80 sm:w-96 h-[480px] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot size={18} />
              <span className="font-semibold text-sm">Fix It Now Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-3 py-3">
            <div className="flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2 max-w-[90%]",
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto",
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Bot size={14} className="text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm",
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-2 mr-auto max-w-[90%]">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Bot size={14} className="text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-border bg-background">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              disabled={isLoading}
              className="flex-1 text-sm rounded-xl"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="shrink-0 rounded-xl"
              aria-label="Send message"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <Button
        size="icon"
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full shadow-lg"
        aria-label={open ? "Close chat" : "Open chat assistant"}
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </Button>
    </div>
  );
}
