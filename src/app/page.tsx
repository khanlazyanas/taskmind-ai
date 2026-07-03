"use client";

import Link from "next/link";
import { ArrowRight, Bot, Sparkles, LayoutGrid, Calendar as CalendarIcon, Download, CheckCircle2, Zap, BarChart3, Database, Lock, Code } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth, SignInButton } from "@clerk/nextjs";

export default function LandingPage() {
  const { userId } = useAuth();

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 selection:bg-blue-500/30 overflow-x-hidden relative font-sans">
      
      {/* Ultra-Premium Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center">
        <div className="absolute top-[-20%] w-[80%] h-[50%] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent dark:from-blue-500/20 dark:via-purple-500/10 blur-[120px] rounded-full mix-blend-normal" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Floating Glassmorphism Navbar */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between w-full max-w-[1200px] bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl px-6 py-4 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]"
        >
          <div className="flex items-center gap-3">
            <div className="bg-zinc-950 dark:bg-white p-2 rounded-xl shadow-md">
              <Bot className="w-5 h-5 text-white dark:text-zinc-950" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white">TaskMind</span>
          </div>
          
          <div className="flex items-center gap-3">
            {!userId ? (
              <SignInButton mode="modal">
                <button className="px-6 py-2.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-sm font-bold hover:scale-105 transition-transform shadow-lg">
                  Sign In
                </button>
              </SignInButton>
            ) : (
              <Link href="/dashboard" className="px-6 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 hover:scale-105 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2">
                Workspace <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </motion.div>
      </nav>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        
        {/* Hero Section */}
        <section className="pt-40 md:pt-52 pb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-300 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-500" /> Powered by Gemini 2.5 Flash
            </div>
            
            <h1 className="text-6xl md:text-[5.5rem] font-black tracking-tighter mb-8 leading-[1.1]">
              <span className="text-zinc-900 dark:text-white">Your ultimate</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                AI Project Manager.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              TaskMind isn't just a to-do list. It's an intelligent workspace that auto-tags, categorizes, and breaks down your work using advanced AI, giving you total control.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!userId ? (
                <SignInButton mode="modal">
                  <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-lg hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-2">
                    Start Building for Free <ArrowRight className="w-5 h-5" />
                  </button>
                </SignInButton>
              ) : (
                <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2">
                  Launch TaskMind <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold text-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2">
                <Code className="w-5 h-5" /> View Source
              </a>
            </div>

          </motion.div>
        </section>

        {/* The "Everything Inside TaskMind" Bento Grid */}
        <section className="pb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">Everything you need, supercharged by AI.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-2 bg-gradient-to-br from-zinc-100 to-white dark:from-zinc-900 dark:to-zinc-950 rounded-[2.5rem] p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 blur-[80px] rounded-full group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center border border-blue-200 dark:border-blue-800/50">
                  <Bot className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-3">TaskMind AI Assistant</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed max-w-md">
                    Stop typing, start asking. Chat with your live workspace to find high-priority tasks, get status updates, and auto-generate detailed subtask action plans in seconds.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-zinc-950 dark:bg-white rounded-[2.5rem] p-10 border border-zinc-800 dark:border-zinc-200 shadow-xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-14 h-14 bg-zinc-800 dark:bg-zinc-100 rounded-2xl flex items-center justify-center">
                  <LayoutGrid className="w-7 h-7 text-white dark:text-zinc-950" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white dark:text-zinc-900 mb-2">Kanban Flow</h3>
                  <p className="text-zinc-400 dark:text-zinc-600 font-medium">Drag, drop, and conquer. A buttery-smooth board to visualize your entire workflow.</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white mb-2">Live Analytics</h3>
                  <p className="text-blue-100 font-medium">Real-time dynamic Recharts displaying your completion rate and priority breakdown.</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center border border-amber-200 dark:border-amber-800/50">
                  <CalendarIcon className="w-7 h-7 text-amber-600 dark:text-amber-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">Smart Calendar</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 font-medium">Seamlessly toggle to a grid view. Tasks map directly to their deadlines.</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="md:col-span-2 bg-white dark:bg-zinc-950 rounded-[2.5rem] p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <BadgeIcon icon={<Download />} text="1-Click CSV Export" color="green" />
                  <BadgeIcon icon={<Lock />} text="Clerk Auth" color="zinc" />
                  <BadgeIcon icon={<Database />} text="MongoDB" color="blue" />
                </div>
                <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-3">Enterprise-Grade Infrastructure.</h3>
                <p className="text-zinc-600 dark:text-zinc-400 font-medium max-w-md">
                  Built on Next.js App Router with secure Clerk authentication and a scalable MongoDB backend. Take your data with you anytime via direct CSV exports.
                </p>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800 py-10 flex flex-col md:flex-row items-center justify-between text-zinc-500 dark:text-zinc-400 text-sm font-medium">
          <p>© {new Date().getFullYear()} TaskMind AI. Built for the modern web.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Portfolio</a>
          </div>
        </footer>

      </div>
    </main>
  );
}

// Helper Component for the Tech Stack Badges
function BadgeIcon({ icon, text, color }: { icon: React.ReactNode, text: string, color: string }) {
  const colorStyles: Record<string, string> = {
    green: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50",
    zinc: "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/50",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
  };

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${colorStyles[color]}`}>
      <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
      {text}
    </div>
  );
}