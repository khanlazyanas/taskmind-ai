import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MoreHorizontal, Clock, Bot, LayoutGrid } from "lucide-react";
import CreateTaskModal from "@/components/CreateTaskModal";

export default function Home() {
  return (
    // Premium dotted background with smooth gradients
    <main className="min-h-screen bg-[#FAFAFA] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] text-zinc-950 font-sans selection:bg-zinc-900 selection:text-white">
      <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-10">
        
        {/* Premium Header Section with Glassmorphism */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-zinc-950 p-2.5 rounded-2xl shadow-md">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">TaskMind</h1>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/50 font-semibold rounded-full px-3">
                AI Beta
              </Badge>
            </div>
            <p className="text-zinc-500 font-medium ml-[3.25rem]">Intelligent workspace and automated workflow routing.</p>
          </div>
          
          {/* YAHAN CHANGE HUA HAI: Purana Button hatakar humara naya Modal component laga diya */}
          <CreateTaskModal />

        </div>

        {/* Premium Kanban Board Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* TODO Column */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-100">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-600">To Do</h2>
              </div>
              <Badge variant="outline" className="text-xs font-mono rounded-full bg-white shadow-sm">3</Badge>
            </div>
            
            {/* Ultra-Premium Task Card */}
            <Card className="group bg-white rounded-3xl border border-zinc-200/80 shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all duration-300 cursor-grab hover:-translate-y-1">
              <CardContent className="p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-zinc-50 text-zinc-600 border-zinc-200 font-semibold rounded-lg px-2.5 py-1">Backend</Badge>
                  <button className="text-zinc-400 hover:text-zinc-900 transition-colors p-1 rounded-md hover:bg-zinc-100">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                    Implement MongoDB Schema
                  </h3>
                  <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed font-medium">
                    Establish the database connection and define the Task model with AI-injected priority fields.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-5 border-t border-zinc-100 mt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-600 text-xs font-bold ring-1 ring-red-200">
                      H
                    </div>
                    <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> 2h ago
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full ring-1 ring-amber-200/50 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-3 h-3" /> AI Tagged
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* IN PROGRESS Column */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600">In Progress</h2>
              </div>
              <Badge variant="outline" className="text-xs font-mono rounded-full bg-blue-50 text-blue-700 border-blue-200 shadow-sm">1</Badge>
            </div>
             {/* Premium Empty State */}
             <div className="h-40 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                <p className="text-sm font-semibold text-zinc-400">Drag tasks here</p>
             </div>
          </div>

          {/* DONE Column */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-green-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-green-600">Completed</h2>
              </div>
              <Badge variant="outline" className="text-xs font-mono rounded-full bg-green-50 text-green-700 border-green-200 shadow-sm">0</Badge>
            </div>
             <div className="h-40 border-2 border-dashed border-zinc-200 rounded-3xl flex items-center justify-center bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                <p className="text-sm font-semibold text-zinc-400">Drag tasks here</p>
             </div>
          </div>

        </div>
      </div>
    </main>
  );
}