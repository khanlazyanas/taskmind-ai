"use client";

import Link from "next/link";
import { ArrowRight, Bot, Sparkles, LayoutGrid, Calendar as CalendarIcon, Download, CheckCircle2, Zap, BarChart3, Database, Lock, Code, BellRing, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth, SignInButton } from "@clerk/nextjs";

export default function LandingPage() {
  const { userId } = useAuth();

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-zinc-900 dark:text-zinc-50 selection:bg-teal-500/30 overflow-x-hidden relative font-sans transition-colors duration-300">
      
      {/* ================= ULTRA-PREMIUM BACKGROUND EFFECTS ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center overflow-hidden">
        {/* Core Glow */}
        <div className="absolute top-[-20%] w-[100%] max-w-[1200px] h-[60%] bg-gradient-to-b from-teal-500/20 dark:from-teal-500/10 via-blue-600/10 dark:via-blue-600/5 to-transparent blur-[120px] rounded-full mix-blend-normal dark:mix-blend-screen transition-all" />
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 dark:bg-purple-600/5 blur-[150px] rounded-full mix-blend-normal dark:mix-blend-screen transition-all" />
        
        {/* Subtle Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-100 dark:opacity-60 transition-all" />
      </div>

      {/* ================= FLOATING GLASSMORPHISM NAVBAR ================= */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between w-full max-w-[1200px] bg-white/70 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl px-5 py-3 rounded-full border border-zinc-200 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all"
        >
          <div className="flex items-center gap-3 pl-2">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-teal-500/20 blur-md rounded-full" />
              <div className="bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/20 p-2 rounded-xl backdrop-blur-md relative z-10 transition-colors">
                <Bot className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white transition-colors">TaskMind<span className="text-teal-500">.</span></span>
          </div>
          
          <div className="flex items-center gap-3">
            {!userId ? (
              <SignInButton mode="modal">
                <button className="px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Sign In
                </button>
              </SignInButton>
            ) : (
              <Link href="/dashboard" className="group px-6 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white text-sm font-bold shadow-md hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] transition-all flex items-center gap-2 border border-transparent dark:border-white/10">
                Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </motion.div>
      </nav>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        
        {/* ================= HERO SECTION ================= */}
        <section className="pt-48 md:pt-60 pb-32 text-center flex flex-col items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center w-full">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 text-[11px] font-bold uppercase tracking-[0.2em] mb-10 backdrop-blur-md shadow-sm dark:shadow-[0_0_30px_rgba(255,255,255,0.03)] transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              Powered by Gemini 2.5 Flash
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-[6.5rem] font-extrabold tracking-tighter mb-8 leading-[1.05] max-w-5xl mx-auto">
              <span className="text-zinc-900 dark:text-white transition-colors">Your ultimate</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-blue-600 to-purple-600 dark:from-teal-400 dark:via-blue-500 dark:to-purple-500 bg-[length:200%_auto] animate-[gradient_4s_linear_infinite]">
                AI Project Manager.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium transition-colors">
              TaskMind isn't just a to-do list. It's an intelligent workspace that executes database commands, triggers background cron jobs, and manages your workflow via natural language.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
              {!userId ? (
                <SignInButton mode="modal">
                  <button className="group relative w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 overflow-hidden shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    Start Building for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignInButton>
              ) : (
                <Link href="/dashboard" className="group relative w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-lg transition-transform hover:scale-[1.02] active:scale-95 shadow-xl dark:shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
                  Launch TaskMind <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <a href="https://github.com/khanlazyanas/taskmind-ai" target="_blank" rel="noreferrer" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-white font-bold text-lg hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border border-zinc-200 dark:border-white/10 flex items-center justify-center gap-2 shadow-sm dark:shadow-xl">
                <Code className="w-5 h-5 text-zinc-500 dark:text-zinc-400" /> View Source
              </a>
            </div>

          </motion.div>
        </section>

        {/* ================= THE BENTO GRID ================= */}
        <section className="pb-40">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4 transition-colors">Engineered for the future of work.</h2>
            <p className="text-zinc-600 dark:text-zinc-500 font-medium transition-colors">A robust MERN architecture supercharged by serverless infrastructure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
            
            {/* AI Assistant Card - Span 2 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-2 bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] p-10 border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20 transition-colors shadow-sm dark:shadow-2xl relative overflow-hidden group flex flex-col justify-between cursor-default">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-50 dark:bg-teal-500/10 blur-[100px] rounded-full group-hover:bg-teal-100 dark:group-hover:bg-teal-500/20 transition-colors duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/[0.01] dark:from-white/[0.02] to-transparent pointer-events-none" />
              
              <div className="w-14 h-14 bg-teal-50 dark:bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-100 dark:border-teal-500/20 mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500">
                <Bot className="w-7 h-7 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-3 transition-colors">Context-Aware AI Chat</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed max-w-lg transition-colors">
                  Stop clicking. Chat directly with your database. The Gemini API utilizes custom function calling to create, update, and manage your tasks in real-time.
                </p>
              </div>
            </motion.div>

            {/* Kanban Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-[#0a0a0a] rounded-[2.5rem] p-10 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-colors shadow-sm dark:shadow-2xl relative overflow-hidden group flex flex-col justify-between cursor-default">
              <div className="w-14 h-14 bg-zinc-100 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-white/10 mb-6 group-hover:rotate-12 transition-transform duration-500">
                <LayoutGrid className="w-7 h-7 text-zinc-600 dark:text-zinc-300" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2 transition-colors">Kanban Flow</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed transition-colors">Powered by dnd-kit for a buttery-smooth, interactive drag-and-drop experience.</p>
              </div>
            </motion.div>

            {/* Push Notifications Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/40 dark:to-[#0a0a0a] rounded-[2.5rem] p-10 border border-blue-100 dark:border-blue-500/20 hover:border-blue-200 dark:hover:border-blue-500/40 transition-colors shadow-sm dark:shadow-2xl relative overflow-hidden group flex flex-col justify-between cursor-default">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.05)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-bg-pan opacity-50 dark:opacity-100" />
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-blue-200 dark:border-blue-500/30 mb-6 relative z-10 group-hover:-translate-y-1 transition-transform duration-500">
                <BellRing className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2 transition-colors">Native Push Alerts</h3>
                <p className="text-blue-700/70 dark:text-blue-200/70 font-medium leading-relaxed transition-colors">Integrated Web Push API with VAPID keys to deliver OS-level notifications.</p>
              </div>
            </motion.div>

            {/* Cron Jobs Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] p-10 border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20 transition-colors shadow-sm dark:shadow-2xl relative overflow-hidden group flex flex-col justify-between cursor-default">
              <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-100 dark:border-purple-500/20 mb-6 group-hover:scale-110 transition-transform duration-500">
                <Clock className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2 transition-colors">Automated Cron</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed transition-colors">Serverless Vercel Cron Jobs strictly query the database for daily due-date reminders.</p>
              </div>
            </motion.div>

            {/* Infrastructure Row - Span 2 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="md:col-span-2 bg-zinc-50 dark:bg-[#050505] rounded-[2.5rem] p-10 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 transition-all shadow-inner dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.02)] flex flex-col justify-center relative overflow-hidden">
               <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-black/[0.02] dark:from-white/[0.03] to-transparent pointer-events-none" />
               <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <BadgeIcon icon={<Lock />} text="Clerk Auth" color="zinc" />
                  <BadgeIcon icon={<Database />} text="MongoDB" color="blue" />
                  <BadgeIcon icon={<Zap />} text="Next.js App Router" color="teal" />
                  <BadgeIcon icon={<Download />} text="CSV Export" color="green" />
                </div>
                <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-3 transition-colors">Enterprise-Grade Architecture.</h3>
                <p className="text-zinc-600 dark:text-zinc-400 font-medium max-w-xl text-lg transition-colors">
                  Designed for speed, security, and scalability. Your data is isolated, protected by strict routing middleware, and accessible anywhere.
                </p>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="border-t border-zinc-200 dark:border-white/10 py-12 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-sm font-medium transition-colors">
          <p>© {new Date().getFullYear()} TaskMind AI. Built by Anas.</p>
          <div className="flex gap-8 mt-6 md:mt-0">
            <a href="https://github.com/khanlazyanas" target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2">
               GitHub
            </a>
            <a href="https://portfolio-frontend-3qay.vercel.app" target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2">
               Portfolio
            </a>
          </div>
        </footer>

      </div>
    </main>
  );
}

// ================= HELPER COMPONENT =================
function BadgeIcon({ icon, text, color }: { icon: React.ReactNode, text: string, color: string }) {
  const colorStyles: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    zinc: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-white/5 dark:text-zinc-300 dark:border-white/10",
    blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    teal: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
  };

  return (
    <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wide backdrop-blur-md transition-colors ${colorStyles[color]}`}>
      <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
      {text}
    </div>
  );
}