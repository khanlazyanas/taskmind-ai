"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Bot, LayoutGrid, Loader2, ArrowRight, ArrowLeft, CheckCircle, Trash2, ListTodo, TrendingUp, CheckCircle2, Search, AlertCircle } from "lucide-react";
import CreateTaskModal from "@/components/CreateTaskModal";
import EditTaskModal from "@/components/EditTaskModal";
import { UserButton } from "@clerk/nextjs";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tags: string[];
  subtasks?: { _id: string, title: string, completed: boolean }[];
  dueDate?: string; // NAYA: Interface mein add kiya
  createdAt: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

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
      case "HIGH": return "bg-red-50 text-red-600 ring-1 ring-red-200 shadow-sm";
      case "MEDIUM": return "bg-amber-50 text-amber-600 ring-1 ring-amber-200 shadow-sm";
      case "LOW": return "bg-green-50 text-green-600 ring-1 ring-green-200 shadow-sm";
      default: return "bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200 shadow-sm";
    }
  };

  // NAYA: Due Date Status aur Color nikalne ka logic
  const getDueDateDetails = (dueDateStr?: string, status?: string) => {
    if (!dueDateStr) return { text: null, className: "text-zinc-400" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const formattedDate = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    if (status === "DONE") {
      return { text: `Due: ${formattedDate}`, className: "text-zinc-400" };
    }

    if (due < today) {
      return { text: `Overdue: ${formattedDate}`, className: "text-red-600 font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-lg ring-1 ring-red-200/50", isOverdue: true };
    } else if (due.getTime() === today.getTime()) {
      return { text: `Due Today`, className: "text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-lg ring-1 ring-amber-200/50" };
    }

    return { text: `Due: ${formattedDate}`, className: "text-zinc-500 font-semibold" };
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] text-zinc-950 font-sans selection:bg-zinc-900 selection:text-white pb-20">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 md:p-10 space-y-8 md:space-y-10">
        
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

        {!isLoading && tasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-3xl p-5 border border-zinc-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-zinc-100/80 text-zinc-600 rounded-2xl">
                <ListTodo className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Total Tasks</p>
                <h3 className="text-2xl font-extrabold text-zinc-900">{totalTasks}</h3>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-5 border border-blue-50 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">In Progress</p>
                <h3 className="text-2xl font-extrabold text-zinc-900">{tasks.filter(t => t.status === "IN_PROGRESS").length}</h3>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-5 border border-green-50 shadow-sm flex flex-col justify-center gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Completion</p>
                </div>
                <span className="text-lg font-extrabold text-green-600">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {!isLoading && tasks.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 pl-4 rounded-3xl border border-zinc-200/60 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 w-full md:w-1/3">
              <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none text-sm font-medium placeholder:text-zinc-400 text-zinc-700 h-10"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar pr-2">
              {["ALL", "HIGH", "MEDIUM", "LOW"].map((priority) => (
                <button
                  key={priority}
                  onClick={() => setPriorityFilter(priority)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                    priorityFilter === priority 
                      ? "bg-zinc-900 text-white shadow-md" 
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  }`}
                >
                  {priority === "ALL" ? "All Tasks" : `${priority} Priority`}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32 space-y-4 animate-in fade-in duration-700">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 drop-shadow-md" />
            <p className="text-zinc-500 font-medium text-sm animate-pulse">Syncing workspace...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            
            {/* TODO Column */}
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
                {todoTasks.map((task) => {
                  const dateDetails = getDueDateDetails(task.dueDate, task.status);
                  return (
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
                          
                          <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all lg:translate-x-2 lg:group-hover:translate-x-0">
                            <EditTaskModal 
                              taskId={task._id} 
                              initialTitle={task.title} 
                              initialDescription={task.description || ""} 
                              onSuccess={fetchTasks} 
                            />
                            <button onClick={() => updateTaskStatus(task._id, "IN_PROGRESS")} className="text-blue-500 hover:text-white bg-blue-50 hover:bg-blue-600 p-2.5 rounded-xl transition-all duration-300 shadow-sm lg:hidden" title="Start Task">
                              <ArrowRight className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteTask(task._id)} className="text-red-500 hover:text-white bg-red-50 hover:bg-red-500 p-2.5 rounded-xl transition-all duration-300 shadow-sm" title="Delete Task">
                              <Trash2 className="w-4 h-4" />
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
                          
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Bot className="w-3.5 h-3.5 text-blue-500" /> AI Action Plan
                              </h4>
                              {task.subtasks.map((sub, idx) => (
                                <div key={idx} className="flex items-start gap-2.5 group/subtask cursor-pointer" onClick={() => toggleSubtask(task._id, idx)}>
                                  <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-[4px] border transition-all duration-200 flex items-center justify-center
                                    ${sub.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-zinc-300 hover:border-blue-400 bg-white'}`}>
                                    {sub.completed && <CheckCircle className="w-3 h-3" />}
                                  </div>
                                  <span className={`text-[13px] font-medium leading-tight transition-all duration-200 ${sub.completed ? 'text-zinc-400 line-through' : 'text-zinc-600'}`}>
                                    {sub.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-zinc-100/80 mt-2 pointer-events-auto">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-extrabold ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0)}
                            </div>
                            
                            {/* NAYA: Due Date Display Section */}
                            <span className={`text-xs flex items-center gap-1.5 ${dateDetails.className}`}>
                              {dateDetails.isOverdue ? <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" /> : <Clock className="w-3.5 h-3.5 text-zinc-400" />}
                              {dateDetails.text || new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold tracking-wide text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-full ring-1 ring-amber-200/50 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Sparkles className="w-3 h-3" /> AI Tagged
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* IN PROGRESS Column */}
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
                {inProgressTasks.map((task) => {
                  const dateDetails = getDueDateDetails(task.dueDate, task.status);
                  return (
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
                          
                          <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all lg:translate-x-2 lg:group-hover:translate-x-0">
                            <EditTaskModal 
                              taskId={task._id} 
                              initialTitle={task.title} 
                              initialDescription={task.description || ""} 
                              onSuccess={fetchTasks} 
                            />
                            <button onClick={() => updateTaskStatus(task._id, "TODO")} className="text-zinc-500 hover:text-white bg-zinc-100 hover:bg-zinc-800 p-2.5 rounded-xl transition-all duration-300 shadow-sm lg:hidden">
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => updateTaskStatus(task._id, "DONE")} className="text-green-600 hover:text-white bg-green-50 hover:bg-green-500 p-2.5 rounded-xl transition-all duration-300 shadow-sm lg:hidden">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteTask(task._id)} className="text-red-500 hover:text-white bg-red-50 hover:bg-red-500 p-2.5 rounded-xl transition-all duration-300 shadow-sm" title="Delete Task">
                              <Trash2 className="w-4 h-4" />
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

                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Bot className="w-3.5 h-3.5 text-blue-500" /> AI Action Plan
                              </h4>
                              {task.subtasks.map((sub, idx) => (
                                <div key={idx} className="flex items-start gap-2.5 group/subtask cursor-pointer" onClick={() => toggleSubtask(task._id, idx)}>
                                  <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-[4px] border transition-all duration-200 flex items-center justify-center
                                    ${sub.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-zinc-300 hover:border-blue-400 bg-white'}`}>
                                    {sub.completed && <CheckCircle className="w-3 h-3" />}
                                  </div>
                                  <span className={`text-[13px] font-medium leading-tight transition-all duration-200 ${sub.completed ? 'text-zinc-400 line-through' : 'text-zinc-600'}`}>
                                    {sub.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-zinc-100/80 mt-2 pointer-events-auto">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-extrabold ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0)}
                            </div>
                            
                            {/* NAYA: Due Date Display Section */}
                            <span className={`text-xs flex items-center gap-1.5 ${dateDetails.className}`}>
                              {dateDetails.isOverdue ? <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" /> : <Clock className="w-3.5 h-3.5 text-zinc-400" />}
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

            {/* DONE Column */}
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
                {doneTasks.map((task) => {
                  const dateDetails = getDueDateDetails(task.dueDate, task.status);
                  return (
                    <Card 
                      key={task._id}
                      draggable 
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      className="group bg-white/60 rounded-3xl border-0 ring-1 ring-green-200/50 shadow-sm opacity-80 hover:opacity-100 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-grab active:cursor-grabbing animate-in fade-in slide-in-from-bottom-4"
                    >
                      <CardContent className="p-6 space-y-5 pointer-events-none">
                        <div className="flex justify-between items-start pointer-events-auto">
                          <div className="flex gap-2 flex-wrap opacity-100 lg:opacity-60 lg:group-hover:opacity-100 transition-opacity">
                            {task.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="bg-zinc-50 text-zinc-500 border-zinc-200/80 font-bold rounded-lg px-2.5 py-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all lg:translate-x-2 lg:group-hover:translate-x-0">
                            <EditTaskModal 
                              taskId={task._id} 
                              initialTitle={task.title} 
                              initialDescription={task.description || ""} 
                              onSuccess={fetchTasks} 
                            />
                            <button onClick={() => updateTaskStatus(task._id, "IN_PROGRESS")} className="text-blue-500 hover:text-white bg-blue-50 hover:bg-blue-500 p-2.5 rounded-xl transition-all duration-300 shadow-sm lg:hidden">
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

                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-4 space-y-2 opacity-70">
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Bot className="w-3.5 h-3.5 text-zinc-400" /> Action Plan
                              </h4>
                              {task.subtasks.map((sub, idx) => (
                                <div key={idx} className="flex items-start gap-2 group/subtask">
                                  <div className="mt-0.5 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-green-100 text-green-600 flex-shrink-0">
                                    <CheckCircle className="w-2.5 h-2.5" />
                                  </div>
                                  <span className="text-[13px] font-medium text-zinc-400 line-through leading-tight">
                                    {sub.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-zinc-100/80 mt-2 pointer-events-auto">
                          <div className="flex items-center gap-3">
                            {/* NAYA: Due date completion display */}
                            <span className={`text-xs flex items-center gap-1.5 ${dateDetails.className}`}>
                              <Clock className="w-3.5 h-3.5 text-zinc-400" />
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
      </div>
    </main>
  );
}