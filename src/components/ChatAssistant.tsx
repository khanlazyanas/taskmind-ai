"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I am TaskMind AI. How can I help you with your tasks today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Naya message aane par auto-scroll down karne ke liye
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!res.ok) throw new Error("Failed to get response");
      
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { role: "ai", content: "Oops! Something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-zinc-950 dark:bg-zinc-950 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Bot className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm">TaskMind AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-900/50 text-sm">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "ai" && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <div className={`p-3 rounded-2xl max-w-[80%] whitespace-pre-wrap ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-tr-sm" 
                    : "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-tl-sm shadow-sm"
                }`}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-tl-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  <span className="text-zinc-400 text-xs">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your tasks..."
                className="flex-1 bg-transparent px-3 py-1.5 text-sm focus:outline-none dark:text-white"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen ? "bg-zinc-800 text-white rotate-12" : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}