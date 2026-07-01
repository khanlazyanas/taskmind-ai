"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Bot, LayoutGrid, Loader2, ArrowRight, ArrowLeft, CheckCircle, Trash2 } from "lucide-react";
import CreateTaskModal from "@/components/CreateTaskModal";
import { UserButton } from "@clerk/nextjs";

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

  // 1. Fetch Tasks API
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

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. Update Task Status API
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task._id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) fetchTasks();
    } catch (error) {
      console.error("Error updating status:", error);
      fetchTasks();
    }
  };

  // 3. Delete Task API
  const deleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task._id !== taskId));
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      fetchTasks();
    }
  };

  // --- DRAG AND DROP LOGIC (FIXED) ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      updateTaskStatus(taskId, newStatus);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };
  // -----------------------------------

  const todoTasks = tasks.filter((t) => t.status === "TODO");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-50 text-red-600 ring-1 ring-red-200 shadow-sm";
      case "MEDIUM": return "bg-amber-50 text-amber-600 ring-1 ring-amber-200 shadow-sm";
      case "LOW": return "bg-green-50 text-green-600 ring-1 ring-green-200 shadow-sm";
      default: return "bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200 shadow-sm";
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] text-zinc-950 font-sans selection:bg-zinc-900 selection:text-white pb-20">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 md:p-10 space-y-8 md:space-y-12">
        
        {/* Premium Glassmorphic Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/70 backdrop-blur-2xl p-6 md:px-8 md:py-6 rounded-[2.5rem] border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <div className="bg-zinc-950 p-2.5 rounded-2xl shadow-lg ring-1 ring-black/5">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">TaskMind</h1>
              <Badge variant="secondary" className="bg-blue-50/80 text-blue-700 border border-blue-200/50 font-bold rounded-full px-3 py-0.5 shadow-sm">
                AI Beta
              </Badge>
            </div>
            <p className="text-zinc-500 font-medium md:ml-[3.5rem] text-sm md:text-base">Intelligent workspace & automated workflow routing.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none">
              <CreateTaskModal onSuccess={fetchTasks} />
            </div>
            <div className="h-12 w-12 flex items-center justify-center bg-white rounded-full border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32 space-y-4 animate-in fade-in duration-700">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 drop-shadow-md" />
            <p className="text-zinc-500 font-medium text-sm animate-pulse">Syncing workspace...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            
            {/* TODO Column Drop Zone */}
            <div 
              className="flex flex-col gap-5 bg-zinc-50/50 p-4 rounded-[2rem] border border-zinc-100/80 shadow-sm transition-colors hover:bg-zinc-50 min-h-[300px]"
              onDrop={(e) => handleDrop(e, "TODO")}
              onDragOver={handleDragOver}
            >
              <div className="flex items-center justify-between pb-3 px-2 border-b-2 border-zinc-100 pointer-events-none">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm border border-zinc-200/60">
                    <LayoutGrid className="w-4 h-4 text-zinc-500" />
                  </div>
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-700">To Do</h2>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold rounded-full bg-white shadow-sm px-2.5">{todoTasks.length}</Badge>
              </div>
              
              <div className="flex flex-col gap-4">
                {todoTasks.map((task) => (
                  <Card 
                    key={task._id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    className="group bg-white rounded-3xl border-0 ring-1 ring-zinc-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-grab active:cursor-grabbing animate-in fade-in slide-in-from-bottom-4"
                  >
                    <CardContent className="p-6 space-y-5 pointer-events-none">
                      <div className="flex justify-between items-start pointer-events-auto">
                        <div className="flex gap-2 flex-wrap">
                          {task.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="bg-zinc-50 text-zinc-600 border-zinc-200/80 font-bold rounded-lg px-2.5 py-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <button onClick={() => updateTaskStatus(task._id, "IN_PROGRESS")} className="text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 p-2.5 rounded-xl transition-all duration-300 shadow-sm lg:hidden" title="Start Task">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="pointer-events-auto">
                        <h3 className="text-[1.1rem] font-bold text-zinc-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {task.title}
                        </h3>
                        <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed font-medium">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-100/80 mt-2 pointer-events-auto">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-extrabold ${getPriorityColor(task.priority)}`}>
                            {task.priority.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> 
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold tracking-wide text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-full ring-1 ring-amber-200/50 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Sparkles className="w-3 h-3" /> AI Tagged
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* IN PROGRESS Column Drop Zone */}
            <div 
              className="flex flex-col gap-5 bg-blue-50/30 p-4 rounded-[2rem] border border-blue-100/50 shadow-sm transition-colors hover:bg-blue-50/50 min-h-[300px]"
              onDrop={(e) => handleDrop(e, "IN_PROGRESS")}
              onDragOver={handleDragOver}
            >
              <div className="flex items-center justify-between pb-3 px-2 border-b-2 border-blue-100 pointer-events-none">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm border border-blue-200/60 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  </div>
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-blue-700">In Progress</h2>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold rounded-full bg-white text-blue-700 border-blue-200 shadow-sm px-2.5">{inProgressTasks.length}</Badge>
              </div>
              
              <div className="flex flex-col gap-4">
                {inProgressTasks.map((task) => (
                  <Card 
                    key={task._id}
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    className="group bg-white rounded-3xl border-0 ring-1 ring-blue-200/60 shadow-[0_2px_10px_rgb(59,130,246,0.04)] hover:shadow-[0_20px_40px_rgb(59,130,246,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-grab active:cursor-grabbing animate-in fade-in slide-in-from-bottom-4"
                  >
                    <CardContent className="p-6 space-y-5 pointer-events-none">
                      <div className="flex justify-between items-start pointer-events-auto">
                        <div className="flex gap-2 flex-wrap">
                          {task.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="bg-zinc-50 text-zinc-600 border-zinc-200/80 font-bold rounded-lg px-2.5 py-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2 lg:hidden">
                          <button onClick={() => updateTaskStatus(task._id, "TODO")} className="text-zinc-500 hover:text-white bg-zinc-100 hover:bg-zinc-800 p-2.5 rounded-xl transition-all duration-300 shadow-sm">
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <button onClick={() => updateTaskStatus(task._id, "DONE")} className="text-green-600 hover:text-white bg-green-50 hover:bg-green-500 p-2.5 rounded-xl transition-all duration-300 shadow-sm">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="pointer-events-auto">
                        <h3 className="text-[1.1rem] font-bold text-zinc-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {task.title}
                        </h3>
                        <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed font-medium">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-100/80 mt-2 pointer-events-auto">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-extrabold ${getPriorityColor(task.priority)}`}>
                            {task.priority.charAt(0)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* DONE Column Drop Zone */}
            <div 
              className="flex flex-col gap-5 bg-green-50/30 p-4 rounded-[2rem] border border-green-100/50 shadow-sm transition-colors hover:bg-green-50/50 min-h-[300px]"
              onDrop={(e) => handleDrop(e, "DONE")}
              onDragOver={handleDragOver}
            >
              <div className="flex items-center justify-between pb-3 px-2 border-b-2 border-green-100 pointer-events-none">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm border border-green-200/60 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-green-700">Completed</h2>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold rounded-full bg-white text-green-700 border-green-200 shadow-sm px-2.5">{doneTasks.length}</Badge>
              </div>
              
              <div className="flex flex-col gap-4">
                {doneTasks.map((task) => (
                  <Card 
                    key={task._id}
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    className="group bg-white/60 rounded-3xl border-0 ring-1 ring-green-200/50 shadow-sm opacity-80 hover:opacity-100 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-grab active:cursor-grabbing animate-in fade-in slide-in-from-bottom-4"
                  >
                    <CardContent className="p-6 space-y-5 pointer-events-none">
                      <div className="flex justify-between items-start pointer-events-auto">
                        {/* FIX: Tags ab hamesha dikhenge mobile par */}
                        <div className="flex gap-2 flex-wrap opacity-100 lg:opacity-60 lg:group-hover:opacity-100 transition-opacity">
                          {task.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="bg-zinc-50 text-zinc-500 border-zinc-200/80 font-bold rounded-lg px-2.5 py-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* FIX: Mobile par button hamesha dikhega (opacity-100), desktop par hover par (lg:opacity-0) */}
                        <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all lg:translate-x-2 lg:group-hover:translate-x-0">
                          <button onClick={() => updateTaskStatus(task._id, "IN_PROGRESS")} className="text-blue-500 hover:text-white bg-blue-50 hover:bg-blue-500 p-2.5 rounded-xl transition-all duration-300 shadow-sm lg:hidden" title="Reopen Task">
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteTask(task._id)} className="text-red-500 hover:text-white bg-red-50 hover:bg-red-500 p-2.5 rounded-xl transition-all duration-300 shadow-sm" title="Delete Task">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="pointer-events-auto">
                        <h3 className="text-[1.1rem] font-bold text-zinc-500 line-through leading-snug mb-2 group-hover:text-zinc-700 transition-colors">
                          {task.title}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}