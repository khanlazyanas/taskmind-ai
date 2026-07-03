"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from "lucide-react";

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
      {/* Premium Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 sm:w-96 h-[500px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
          
          {/* Glassmorphism Header */}
          <div className="bg-transparent p-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide">TaskMind AI</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-zinc-50/50 dark:bg-zinc-900/30 text-sm">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-zinc-900 dark:text-white" />
                  </div>
                )}
                
                <div className={`p-3.5 rounded-2xl max-w-[80%] whitespace-pre-wrap leading-relaxed shadow-sm ${
                  msg.role === "user" 
                    ? "bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-tr-sm font-medium" 
                    : "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
                
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-zinc-900 dark:text-white" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 rounded-tl-sm shadow-sm flex items-center gap-2.5">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-4 bg-transparent border-t border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100 focus-within:border-transparent transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI anything..."
                className="flex-1 bg-transparent px-4 py-2 text-sm font-medium focus:outline-none dark:text-white placeholder:text-zinc-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 w-9 h-9 flex justify-center items-center rounded-full transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4 -ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Premium Floating Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.1)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 border border-zinc-200/50 dark:border-zinc-700/50 z-50 relative ${
            isOpen 
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rotate-12" 
              : "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:shadow-2xl"
          }`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
        
        {/* Floating Sparkle Badge for AI feel */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-1.5 shadow-sm animate-bounce z-50 border-2 border-white dark:border-zinc-950">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}