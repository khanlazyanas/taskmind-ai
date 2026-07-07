"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Bot, LayoutGrid, Loader2, ArrowRight, ArrowLeft, CheckCircle, Trash2, ListTodo, TrendingUp, CheckCircle2, Search, AlertCircle, Download, Calendar as CalendarIcon, Kanban } from "lucide-react"; 
import CreateTaskModal from "@/components/CreateTaskModal";
import EditTaskModal from "@/components/EditTaskModal";
import ChatAssistant from "@/components/ChatAssistant"; 
import TaskAnalytics from "@/components/TaskAnalytics"; 
import TaskCalendar from "@/components/TaskCalendar"; 
import PushNotificationManager from "@/components/PushNotificationManager"; 
import { UserButton } from "@clerk/nextjs";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tags: string[];
  subtasks?: { _id: string, title: string, completed: boolean }[];
  dueDate?: string;
  createdAt: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [currentView, setCurrentView] = useState<"KANBAN" | "CALENDAR">("KANBAN"); 

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks", { cache: "no-store" });
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

  const toggleSubtask = async (taskId: string, subtaskIndex: number) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || !task.subtasks) return;

    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex].completed = !updatedSubtasks[subtaskIndex].completed;

    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, subtasks: updatedSubtasks } : t))
    );

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtasks: updatedSubtasks }),
      });
    } catch (error) {
      console.error("Error updating subtask:", error);
      fetchTasks(); 
    }
  };

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

  const exportTasksToCSV = () => {
    if (tasks.length === 0) return;

    const headers = ["Title", "Description", "Status", "Priority", "Due Date", "Tags"];
    const csvRows = [headers.join(",")];

    tasks.forEach((task) => {
      const row = [
        `"${task.title.replace(/"/g, '""')}"`,
        `"${(task.description || "").replace(/"/g, '""')}"`,
        task.status,
        task.priority,
        task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date",
        `"${task.tags.join(", ")}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TaskMind_Export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const totalTasks = tasks.length;
  const globalDoneTasks = tasks.filter((t) => t.status === "DONE");
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((globalDoneTasks.length / totalTasks) * 100);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === "TODO");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = filteredTasks.filter((t) => t.status === "DONE");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20";
      case "MEDIUM": return "bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20";
      case "LOW": return "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20";
      default: return "bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:ring-white/10";
    }
  };

  const getDueDateDetails = (dueDateStr?: string, status?: string) => {
    if (!dueDateStr) return { text: null, className: "text-zinc-400 dark:text-zinc-500" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const formattedDate = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    if (status === "DONE") {
      return { text: `Due: ${formattedDate}`, className: "text-zinc-400 dark:text-zinc-600" };
    }

    if (due < today) {
      return { text: `Overdue: ${formattedDate}`, className: "text-red-600 dark:text-red-400 font-bold flex items-center gap-1 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-md ring-1 ring-red-200/50 dark:ring-red-500/20", isOverdue: true };
    } else if (due.getTime() === today.getTime()) {
      return { text: `Due Today`, className: "text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md ring-1 ring-amber-200/50 dark:ring-amber-500/20" };
    }

    return { text: `Due: ${formattedDate}`, className: "text-zinc-500 dark:text-zinc-400 font-semibold" };
  };

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-zinc-900 dark:text-zinc-50 font-sans selection:bg-teal-500/30 overflow-x-hidden relative transition-colors duration-300 pb-20">
      
      {/* ================= ULTRA PREMIUM BACKGROUND EFFECTS ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center overflow-hidden hidden dark:flex">
        <div className="absolute top-[-10%] w-[100%] max-w-[1200px] h-[50%] bg-gradient-to-b from-teal-500/10 via-blue-600/5 to-transparent blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto p-4 sm:p-6 md:p-10 space-y-8 md:space-y-10">
        
        {/* ================= HEADER DASHBOARD ================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/70 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl p-6 md:px-8 md:py-6 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-teal-500/20 blur-md rounded-full dark:block hidden" />
                <div className="bg-zinc-950 dark:bg-white/10 border border-transparent dark:border-white/20 p-2.5 rounded-xl shadow-lg relative z-10">
                  <Bot className="w-6 h-6 text-white dark:text-teal-400" />
                </div>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">TaskMind<span className="text-teal-500 dark:text-teal-400">.</span></h1>
              <Badge variant="secondary" className="bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20 font-bold rounded-full px-3 py-0.5 shadow-sm uppercase tracking-widest text-[10px]">
                Workspace
              </Badge>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium md:ml-[4.2rem] text-sm md:text-base">Intelligent environment & automated workflow routing.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none">
              <CreateTaskModal onSuccess={fetchTasks} />
            </div>
            <ThemeToggle />
            <div className="h-12 w-12 flex items-center justify-center bg-white dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
              <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
            </div>
          </div>
        </div>

        <PushNotificationManager />

        {!isLoading && tasks.length > 0 && (
          <>
            {/* ================= STATS CARDS ================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-white/70 dark:bg-[#0a0a0a]/60 backdrop-blur-xl rounded-3xl p-6 border border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex items-center gap-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-200/50 dark:bg-white/5 blur-[40px] rounded-full group-hover:bg-zinc-300/50 dark:group-hover:bg-white/10 transition-colors duration-500 pointer-events-none" />
                <div className="p-3.5 bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 rounded-2xl border border-transparent dark:border-white/10 relative z-10">
                  <ListTodo className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                  <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Total Tasks</p>
                  <h3 className="text-3xl font-black text-zinc-900 dark:text-white leading-none">{totalTasks}</h3>
                </div>
              </div>
              
              <div className="bg-white/70 dark:bg-[#0a0a0a]/60 backdrop-blur-xl rounded-3xl p-6 border border-blue-100 dark:border-blue-500/20 shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex items-center gap-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-500/10 blur-[40px] rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-500/20 transition-colors duration-500 pointer-events-none" />
                <div className="p-3.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-transparent dark:border-blue-500/20 relative z-10">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                  <p className="text-[11px] font-bold text-blue-400/80 dark:text-blue-400/60 uppercase tracking-widest mb-1">In Progress</p>
                  <h3 className="text-3xl font-black text-zinc-900 dark:text-white leading-none">{tasks.filter(t => t.status === "IN_PROGRESS").length}</h3>
                </div>
              </div>
              
              <div className="bg-white/70 dark:bg-[#0a0a0a]/60 backdrop-blur-xl rounded-3xl p-6 border border-emerald-100 dark:border-teal-500/20 shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col justify-center gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 dark:bg-teal-500/10 blur-[40px] rounded-full group-hover:bg-emerald-200 dark:group-hover:bg-teal-500/20 transition-colors duration-500 pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-teal-400" />
                    <p className="text-[11px] font-bold text-emerald-600/80 dark:text-teal-400/60 uppercase tracking-widest">Completion</p>
                  </div>
                  <span className="text-xl font-black text-emerald-600 dark:text-teal-400">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-white/5 rounded-full h-2 overflow-hidden relative z-10 border border-transparent dark:border-white/5">
                  <div 
                    className="bg-emerald-500 dark:bg-teal-400 h-2 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(20,184,166,0.5)]" 
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <TaskAnalytics tasks={tasks} />
          </>
        )}

        {!isLoading && tasks.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md p-2 pl-5 rounded-full border border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 w-full md:w-1/3">
              <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Search database..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none text-sm font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-700 dark:text-zinc-200 h-10"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar pr-2">
              {["ALL", "HIGH", "MEDIUM", "LOW"].map((priority) => (
                <button
                  key={priority}
                  onClick={() => setPriorityFilter(priority)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                    priorityFilter === priority 
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-transparent shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                      : "bg-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 border-transparent dark:hover:border-white/10"
                  }`}
                >
                  {priority === "ALL" ? "All Tasks" : `${priority}`}
                </button>
              ))}
              
              <div className="h-6 w-[1px] bg-zinc-200 dark:bg-white/10 mx-2 hidden md:block"></div>
              <button
                onClick={exportTasksToCSV}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-40 space-y-6 animate-in fade-in duration-700">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full dark:block hidden animate-pulse" />
              <Loader2 className="w-12 h-12 animate-spin text-teal-600 dark:text-teal-400 relative z-10" />
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm tracking-widest uppercase animate-pulse">Syncing Secure Workspace...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            
            {/* ================= TODO COLUMN ================= */}
            <div 
              className="flex flex-col gap-5 bg-zinc-50/50 dark:bg-white/[0.02] p-5 rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-sm transition-colors hover:bg-zinc-100/50 dark:hover:bg-white/[0.04] min-h-[400px] backdrop-blur-xl"
              onDrop={(e) => handleDrop(e, "TODO")}
              onDragOver={handleDragOver}
            >
              <div className="flex items-center justify-between pb-4 px-1 border-b border-zinc-200 dark:border-white/10 pointer-events-none">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white dark:bg-white/5 rounded-xl shadow-sm border border-zinc-200 dark:border-white/10 backdrop-blur-md">
                    <LayoutGrid className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  </div>
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">To Do</h2>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold rounded-full bg-white dark:bg-white/5 shadow-sm px-3 dark:text-zinc-300 border-zinc-200 dark:border-white/10">{todoTasks.length}</Badge>
              </div>
              
              <div className="flex flex-col gap-4">
                {todoTasks.map((task) => {
                  const dateDetails = getDueDateDetails(task.dueDate, task.status);
                  return (
                    <Card 
                      key={task._id} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      className="group bg-white dark:bg-[#0a0a0a]/80 backdrop-blur-md rounded-[1.5rem] border-0 ring-1 ring-zinc-200 dark:ring-white/10 shadow-sm hover:shadow-xl hover:ring-zinc-300 dark:hover:ring-white/30 dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:-translate-y-1 transition-all duration-300 cursor-grab active:cursor-grabbing animate-in fade-in slide-in-from-bottom-4"
                    >
                      <CardContent className="p-6 space-y-5 pointer-events-none">
                        <div className="flex justify-between items-start pointer-events-auto">
                          <div className="flex gap-2 flex-wrap">
                            {task.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-white/10 font-bold rounded-md px-2.5 py-1 text-[10px] uppercase tracking-wider">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all lg:translate-x-2 lg:group-hover:translate-x-0">
                            <EditTaskModal 
                              taskId={task._id} 
                              initialTitle={task.title} 
                              initialDescription={task.description || ""} 
                              initialDueDate={task.dueDate}
                              onSuccess={fetchTasks} 
                            />
                            <button onClick={() => updateTaskStatus(task._id, "IN_PROGRESS")} className="text-blue-500 dark:text-blue-400 hover:text-white bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-600 dark:hover:bg-blue-500 p-2 rounded-lg transition-all duration-300 shadow-sm border border-transparent dark:border-blue-500/20 lg:hidden" title="Start Task">
                              <ArrowRight className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteTask(task._id)} className="text-red-500 dark:text-red-400 hover:text-white bg-red-50 dark:bg-red-500/10 hover:bg-red-500 dark:hover:bg-red-500 p-2 rounded-lg transition-all duration-300 shadow-sm border border-transparent dark:border-red-500/20" title="Delete Task">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="pointer-events-auto">
                          <h3 className="text-[1.1rem] font-bold text-zinc-900 dark:text-white leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                            {task.title}
                          </h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                            {task.description}
                          </p>
                          
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-5 space-y-2.5">
                              <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <Bot className="w-3.5 h-3.5 text-blue-500 dark:text-teal-400" /> AI Action Plan
                              </h4>
                              {task.subtasks.map((sub, idx) => (
                                <div key={idx} className="flex items-start gap-3 group/subtask cursor-pointer" onClick={() => toggleSubtask(task._id, idx)}>
                                  <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-[4px] border transition-all duration-200 flex items-center justify-center
                                    ${sub.completed ? 'bg-blue-500 dark:bg-teal-500 border-blue-500 dark:border-teal-500 text-white' : 'border-zinc-300 dark:border-zinc-600 hover:border-blue-400 dark:hover:border-teal-400 bg-white dark:bg-white/5'}`}>
                                    {sub.completed && <CheckCircle className="w-3 h-3" />}
                                  </div>
                                  <span className={`text-[13px] font-medium leading-tight transition-all duration-200 ${sub.completed ? 'text-zinc-400 dark:text-zinc-600 line-through' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                    {sub.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/10 mt-2 pointer-events-auto">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-black ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0)}
                            </div>
                            <span className={`text-xs flex items-center gap-1.5 ${dateDetails.className}`}>
                              {dateDetails.isOverdue ? <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 animate-pulse" /> : <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />}
                              {dateDetails.text || new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2.5 py-1 rounded-md ring-1 ring-teal-200/50 dark:ring-teal-500/20 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Sparkles className="w-3 h-3" /> AI
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* ================= IN PROGRESS COLUMN ================= */}
            <div 
              className="flex flex-col gap-5 bg-blue-50/40 dark:bg-blue-500/[0.02] p-5 rounded-[2rem] border border-blue-100/60 dark:border-blue-500/10 shadow-sm transition-colors hover:bg-blue-50/60 dark:hover:bg-blue-500/[0.04] min-h-[400px] backdrop-blur-xl relative overflow-hidden"
              onDrop={(e) => handleDrop(e, "IN_PROGRESS")}
              onDragOver={handleDragOver}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between pb-4 px-1 border-b border-blue-100 dark:border-blue-500/20 pointer-events-none relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white dark:bg-blue-500/10 rounded-xl shadow-sm border border-blue-200/60 dark:border-blue-500/20 flex items-center justify-center backdrop-blur-md">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                  </div>
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-blue-700 dark:text-blue-400">In Progress</h2>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold rounded-full bg-white dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30 shadow-sm px-3">{inProgressTasks.length}</Badge>
              </div>
              
              <div className="flex flex-col gap-4 relative z-10">
                {inProgressTasks.map((task) => {
                  const dateDetails = getDueDateDetails(task.dueDate, task.status);
                  return (
                    <Card 
                      key={task._id}
                      draggable 
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      className="group bg-white dark:bg-[#0a0a0a]/90 backdrop-blur-md rounded-[1.5rem] border-0 ring-1 ring-blue-200/60 dark:ring-blue-500/30 shadow-sm hover:shadow-xl hover:ring-blue-300 dark:hover:ring-blue-500/50 dark:hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-grab active:cursor-grabbing animate-in fade-in slide-in-from-bottom-4"
                    >
                      <CardContent className="p-6 space-y-5 pointer-events-none">
                        <div className="flex justify-between items-start pointer-events-auto">
                          <div className="flex gap-2 flex-wrap">
                            {task.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-white/10 font-bold rounded-md px-2.5 py-1 text-[10px] uppercase tracking-wider">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all lg:translate-x-2 lg:group-hover:translate-x-0">
                            <EditTaskModal 
                              taskId={task._id} 
                              initialTitle={task.title} 
                              initialDescription={task.description || ""} 
                              initialDueDate={task.dueDate}
                              onSuccess={fetchTasks} 
                            />
                            <button onClick={() => updateTaskStatus(task._id, "TODO")} className="text-zinc-500 dark:text-zinc-400 hover:text-white bg-zinc-100 dark:bg-white/10 hover:bg-zinc-800 p-2 rounded-lg transition-all duration-300 shadow-sm border border-transparent dark:border-white/20 lg:hidden">
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => updateTaskStatus(task._id, "DONE")} className="text-emerald-600 dark:text-teal-400 hover:text-white bg-emerald-50 dark:bg-teal-500/10 hover:bg-emerald-500 dark:hover:bg-teal-500 p-2 rounded-lg transition-all duration-300 shadow-sm border border-transparent dark:border-teal-500/20 lg:hidden">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteTask(task._id)} className="text-red-500 dark:text-red-400 hover:text-white bg-red-50 dark:bg-red-500/10 hover:bg-red-500 dark:hover:bg-red-500 p-2 rounded-lg transition-all duration-300 shadow-sm border border-transparent dark:border-red-500/20" title="Delete Task">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="pointer-events-auto">
                          <h3 className="text-[1.1rem] font-bold text-zinc-900 dark:text-white leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {task.title}
                          </h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                            {task.description}
                          </p>

                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-5 space-y-2.5">
                              <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <Bot className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> AI Action Plan
                              </h4>
                              {task.subtasks.map((sub, idx) => (
                                <div key={idx} className="flex items-start gap-3 group/subtask cursor-pointer" onClick={() => toggleSubtask(task._id, idx)}>
                                  <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-[4px] border transition-all duration-200 flex items-center justify-center
                                    ${sub.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-zinc-300 dark:border-zinc-600 hover:border-blue-400 dark:hover:border-blue-400 bg-white dark:bg-white/5'}`}>
                                    {sub.completed && <CheckCircle className="w-3 h-3" />}
                                  </div>
                                  <span className={`text-[13px] font-medium leading-tight transition-all duration-200 ${sub.completed ? 'text-zinc-400 dark:text-zinc-600 line-through' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                    {sub.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/10 mt-2 pointer-events-auto">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-black ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0)}
                            </div>
                            
                            <span className={`text-xs flex items-center gap-1.5 ${dateDetails.className}`}>
                              {dateDetails.isOverdue ? <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 animate-pulse" /> : <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />}
                              {dateDetails.text || new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* ================= DONE COLUMN ================= */}
            <div 
              className="flex flex-col gap-5 bg-emerald-50/40 dark:bg-teal-500/[0.02] p-5 rounded-[2rem] border border-emerald-100/60 dark:border-teal-500/10 shadow-sm transition-colors hover:bg-emerald-50/60 dark:hover:bg-teal-500/[0.04] min-h-[400px] backdrop-blur-xl relative overflow-hidden"
              onDrop={(e) => handleDrop(e, "DONE")}
              onDragOver={handleDragOver}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[80px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between pb-4 px-1 border-b border-emerald-100 dark:border-teal-500/20 pointer-events-none relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white dark:bg-teal-500/10 rounded-xl shadow-sm border border-emerald-200/60 dark:border-teal-500/20 flex items-center justify-center backdrop-blur-md">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-teal-400" />
                  </div>
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-emerald-700 dark:text-teal-400">Completed</h2>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold rounded-full bg-white dark:bg-teal-500/10 text-emerald-700 dark:text-teal-400 border-emerald-200 dark:border-teal-500/30 shadow-sm px-3">{doneTasks.length}</Badge>
              </div>
              
              <div className="flex flex-col gap-4 relative z-10">
                {doneTasks.map((task) => {
                  const dateDetails = getDueDateDetails(task.dueDate, task.status);
                  return (
                    <Card 
                      key={task._id}
                      draggable 
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      className="group bg-white/60 dark:bg-[#0a0a0a]/50 backdrop-blur-md rounded-[1.5rem] border-0 ring-1 ring-emerald-200/50 dark:ring-teal-500/20 shadow-sm opacity-70 hover:opacity-100 hover:bg-white dark:hover:bg-[#0a0a0a]/90 hover:shadow-xl hover:ring-emerald-300 dark:hover:ring-teal-500/40 dark:hover:shadow-[0_0_30px_rgba(20,184,166,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-grab active:cursor-grabbing animate-in fade-in slide-in-from-bottom-4"
                    >
                      <CardContent className="p-6 space-y-5 pointer-events-none">
                        <div className="flex justify-between items-start pointer-events-auto">
                          <div className="flex gap-2 flex-wrap opacity-100 lg:opacity-60 lg:group-hover:opacity-100 transition-opacity">
                            {task.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border-zinc-200/80 dark:border-white/10 font-bold rounded-md px-2.5 py-1 text-[10px] uppercase tracking-wider">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all lg:translate-x-2 lg:group-hover:translate-x-0">
                            <EditTaskModal 
                              taskId={task._id} 
                              initialTitle={task.title} 
                              initialDescription={task.description || ""} 
                              initialDueDate={task.dueDate}
                              onSuccess={fetchTasks} 
                            />
                            <button onClick={() => updateTaskStatus(task._id, "IN_PROGRESS")} className="text-blue-500 dark:text-blue-400 hover:text-white bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-500 dark:hover:bg-blue-500 p-2 rounded-lg transition-all duration-300 shadow-sm border border-transparent dark:border-blue-500/20 lg:hidden">
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteTask(task._id)} className="text-red-500 dark:text-red-400 hover:text-white bg-red-50 dark:bg-red-500/10 hover:bg-red-500 dark:hover:bg-red-500 p-2 rounded-lg transition-all duration-300 shadow-sm border border-transparent dark:border-red-500/20" title="Delete Task">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="pointer-events-auto">
                          <h3 className="text-[1.1rem] font-bold text-zinc-500 dark:text-zinc-500 line-through leading-snug mb-2 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                            {task.title}
                          </h3>

                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-5 space-y-2.5 opacity-60">
                              <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <Bot className="w-3.5 h-3.5" /> Action Plan
                              </h4>
                              {task.subtasks.map((sub, idx) => (
                                <div key={idx} className="flex items-start gap-3 group/subtask">
                                  <div className="mt-0.5 flex items-center justify-center w-4 h-4 rounded-[4px] bg-emerald-100 dark:bg-teal-500/20 text-emerald-600 dark:text-teal-400 flex-shrink-0 border border-emerald-200 dark:border-teal-500/30">
                                    <CheckCircle className="w-3 h-3" />
                                  </div>
                                  <span className="text-[13px] font-medium text-zinc-400 dark:text-zinc-600 line-through leading-tight">
                                    {sub.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/5 mt-2 pointer-events-auto">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs flex items-center gap-1.5 ${dateDetails.className}`}>
                              <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
                              {dateDetails.text || new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {!isLoading && tasks.length > 0 && (
          <div className="pt-6">
            <div className="flex justify-end mb-4 px-2">
              <div className="bg-white/50 dark:bg-[#0a0a0a]/60 backdrop-blur-md p-1.5 rounded-full flex items-center gap-1 border border-zinc-200 dark:border-white/10 shadow-sm">
                <button 
                  onClick={() => setCurrentView("KANBAN")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                    currentView === "KANBAN" 
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-md" 
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Kanban className="w-4 h-4" /> Kanban Flow
                </button>
                <button 
                  onClick={() => setCurrentView("CALENDAR")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                    currentView === "CALENDAR" 
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-md" 
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5"
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" /> Grid View
                </button>
              </div>
            </div>

            {currentView === "CALENDAR" && (
              <TaskCalendar tasks={filteredTasks} onSuccess={fetchTasks} />
            )}
          </div>
        )}

      </div>

      <ChatAssistant />
      
    </main>
  );
}