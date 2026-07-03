import Link from "next/link";
import { ArrowRight, Bot, Sparkles, LayoutGrid, Calendar as CalendarIcon, Download } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server"; // NAYA: Direct auth check

export default async function LandingPage() {
  const { userId } = await auth(); // Check kar rahe hain ki user logged in hai ya nahi

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 selection:bg-blue-500/30 font-sans overflow-hidden">
      
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/20 blur-[120px] rounded-full mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/20 blur-[120px] rounded-full mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-50" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-8 pb-20">
        
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl px-6 py-4 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-950 dark:bg-white p-2 rounded-xl shadow-md">
              <Bot className="w-5 h-5 text-white dark:text-zinc-950" />
            </div>
            <span className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">TaskMind</span>
          </div>
          
          <div className="flex items-center gap-4">
            {!userId ? (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Log in
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg">
                    Get Started
                  </button>
                </SignInButton>
              </>
            ) : (
              <Link href="/dashboard" className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md flex items-center gap-2 group">
                Go to Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="mt-24 md:mt-32 text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Introducing TaskMind AI Beta
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.1] mb-8">
            The intelligent workspace that <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              thinks for you.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Stop managing your tasks manually. Let our advanced AI automatically tag, prioritize, and generate action plans for everything you need to do.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!userId ? (
              <SignInButton mode="modal">
                <button className="w-full sm:w-auto bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group">
                  Start for free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignInButton>
            ) : (
              <Link href="/dashboard" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group">
                Open Workspace <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          
          <div className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm p-8 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 dark:border-blue-800/50">
              <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">AI Task Assistant</h3>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
              Chat with your workspace. Ask for high-priority tasks, get auto-generated subtasks, and let AI organize your day.
            </p>
          </div>

          <div className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm p-8 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-100 dark:border-purple-800/50">
              <LayoutGrid className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">Kanban & Calendar</h3>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
              Drag and drop tasks on a premium Kanban board, or instantly toggle to a calendar view to map out your monthly deadlines.
            </p>
          </div>

          <div className="bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm p-8 rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mb-6 border border-green-100 dark:border-green-800/50">
              <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">One-Click Export</h3>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
              Take your data anywhere. Export your entire workspace into a clean, formatted CSV file with a single click.
            </p>
          </div>

        </section>

      </div>
    </main>
  );
}