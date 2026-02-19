import { useState, useCallback, useRef, useEffect } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Button, Input, ScrollArea, cn } from "@chuk/view-ui";
import { motion, AnimatePresence } from "framer-motion";
import { listItem } from "@chuk/view-ui/animations";
import type { ChatContent, ChatMessage } from "./schema";

/* ------------------------------------------------------------------ */
/*  ChatView -- wired to MCP ext-apps                                 */
/* ------------------------------------------------------------------ */

export function ChatView() {
  const { data, content, callTool, isConnected } =
    useView<ChatContent>("chat", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <ChatRenderer data={data} onCallTool={callTool} />;
}

/* ------------------------------------------------------------------ */
/*  ChatRenderer -- pure presentation + local message state           */
/* ------------------------------------------------------------------ */

export interface ChatRendererProps {
  data: ChatContent;
  onCallTool?: (name: string, args: Record<string, unknown>) => Promise<void>;
}

export function ChatRenderer({ data, onCallTool }: ChatRendererProps) {
  const {
    title,
    messages: initialMessages,
    respondTool,
    placeholder = "Type a message...",
    suggestions,
    showTypingIndicator,
  } = data;

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Auto-scroll to bottom on new messages */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isWaiting]);

  /* Send message flow */
  const handleSend = useCallback(
    async (text?: string) => {
      const msg = (text ?? inputText).trim();
      if (!msg) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: msg,
        timestamp: new Date().toISOString(),
        status: "sending",
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
      setIsWaiting(true);

      try {
        if (onCallTool) {
          await onCallTool(respondTool, {
            message: msg,
            history: messages,
          });
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMessage.id ? { ...m, status: "sent" } : m
          )
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMessage.id ? { ...m, status: "error" } : m
          )
        );
      } finally {
        setIsWaiting(false);
        inputRef.current?.focus();
      }
    },
    [inputText, messages, onCallTool, respondTool]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      handleSend(suggestion);
    },
    [handleSend]
  );

  /* Determine if typing indicator should show */
  const showTyping =
    isWaiting ||
    (showTypingIndicator &&
      messages.length > 0 &&
      messages[messages.length - 1].role === "user");

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      {/* Header */}
      {title && (
        <div className="flex items-center p-3 border-b border-border">
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
      )}

      {/* Message area */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-4 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                variants={listItem}
                initial="hidden"
                animate="visible"
                className={cn(
                  "flex",
                  msg.role === "user" && "justify-end",
                  msg.role === "assistant" && "justify-start",
                  msg.role === "system" && "justify-center"
                )}
              >
                {msg.role === "system" ? (
                  <p className="text-xs text-muted-foreground italic max-w-[90%] text-center">
                    {msg.content}
                  </p>
                ) : (
                  <div
                    className={cn(
                      "max-w-[80%] px-3 py-2",
                      msg.role === "user" &&
                        "bg-primary text-primary-foreground rounded-2xl rounded-br-sm",
                      msg.role === "assistant" &&
                        "bg-muted text-foreground rounded-2xl rounded-bl-sm",
                      msg.status === "error" && "ring-1 ring-destructive"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {msg.timestamp && (
                        <span className="text-xs text-muted-foreground opacity-70">
                          {formatTime(msg.timestamp)}
                        </span>
                      )}
                      {msg.status === "error" && (
                        <span className="text-xs text-destructive">
                          Failed to send
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing indicator */}
            {showTyping && (
              <motion.div
                key="typing"
                variants={listItem}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex justify-start"
              >
                <div className="bg-muted text-foreground rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground [animation-delay:0.4s]" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Suggestions bar */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-3 py-2 border-t border-border">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 p-3 border-t border-border">
        <Input
          ref={inputRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isWaiting}
          className="flex-1"
        />
        <Button
          variant="default"
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isWaiting}
        >
          Send
        </Button>
      </div>

      {/* CSS for typing animation */}
      <style>{`
        .typing-dot {
          animation: typing-bounce 1.4s infinite ease-in-out;
        }
        @keyframes typing-bounce {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
