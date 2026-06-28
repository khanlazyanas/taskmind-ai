"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MoreHorizontal, Clock, Bot, LayoutGrid, Loader2 } from "lucide-react";
import CreateTaskModal from "@/components/CreateTaskModal";

// TypeScript interface task ke liye
interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tags: string[];
  createdAt: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // API se tasks fetch karne ka function
  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Component load hote hi tasks fetch honge
  useEffect(() => {
    fetchTasks();
  }, []);

  // Tasks ko status ke hisaab se alag-alag columns mein filter karna
  const todoTasks = tasks.filter((t) => t.status === "TODO");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  // Priority ke hisaab se color set karne ka helper function
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-50 text-red-600 ring-red-200";
      case "MEDIUM": return "bg-amber-50 text-amber-600 ring-amber-200";
      case "LOW": return "bg-green-50 text-green-600 ring-green-200";
      default: return "bg-zinc-50 text-zinc-600 ring-zinc-200";
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] text-zinc-950 font-sans selection:bg-zinc-900 selection:text-white">
      <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-10">
        
        {/* Header Section */}
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
          
          <CreateTaskModal />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Kanban Board Layout */}
            
            {/* TODO Column */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-100">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-600">To Do</h2>
                </div>
                <Badge variant="outline" className="text-xs font-mono rounded-full bg-white shadow-sm">{todoTasks.length}</Badge>
              </div>
              
              {todoTasks.map((task) => (
                <Card key={task._id} className="group bg-white rounded-3xl border border-zinc-200/80 shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all duration-300 cursor-grab hover:-translate-y-1">
                  <CardContent className="p-6 space-y-5">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2 flex-wrap">
                        {task.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="bg-zinc-50 text-zinc-600 border-zinc-200 font-semibold rounded-lg px-2.5 py-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <button className="text-zinc-400 hover:text-zinc-900 transition-colors p-1 rounded-md hover:bg-zinc-100">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed font-medium">
                        {task.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-5 border-t border-zinc-100 mt-2">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ring-1 ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> 
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full ring-1 ring-amber-200/50 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="w-3 h-3" /> AI Tagged
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {todoTasks.length === 0 && (
                 <div className="h-40 border-2 border-dashed border-zinc-200 rounded-3xl flex items-center justify-center bg-zinc-50/50">
                    <p className="text-sm font-semibold text-zinc-400">No tasks here</p>
                 </div>
              )}
            </div>

            {/* IN PROGRESS Column */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b-2 border-blue-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600">In Progress</h2>
                </div>
                <Badge variant="outline" className="text-xs font-mono rounded-full bg-blue-50 text-blue-700 border-blue-200 shadow-sm">{inProgressTasks.length}</Badge>
              </div>
              
              {inProgressTasks.length === 0 && (
                <div className="h-40 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                  <p className="text-sm font-semibold text-zinc-400">Drag tasks here</p>
                </div>
              )}
            </div>

            {/* DONE Column */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b-2 border-green-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-green-600">Completed</h2>
                </div>
                <Badge variant="outline" className="text-xs font-mono rounded-full bg-green-50 text-green-700 border-green-200 shadow-sm">{doneTasks.length}</Badge>
              </div>
              
              {doneTasks.length === 0 && (
                <div className="h-40 border-2 border-dashed border-zinc-200 rounded-3xl flex items-center justify-center bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                  <p className="text-sm font-semibold text-zinc-400">Drag tasks here</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </main>
  );
}