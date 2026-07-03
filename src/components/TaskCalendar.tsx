"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import EditTaskModal from "@/components/EditTaskModal";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string;
}

interface TaskCalendarProps {
  tasks: Task[];
  onSuccess: () => void;
}

export default function TaskCalendar({ tasks, onSuccess }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month ke saare days nikalne ka logic
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Purane mahine ke khali slots fill karne ke liye
  const blanks = Array(firstDayOfMonth).fill(null);
  // Is mahine ke saare din
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...days];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Kisi specific date ke tasks filter karne ka function
  const getTasksForDate = (day: number) => {
    if (!day) return [];
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === month &&
        taskDate.getFullYear() === year
      );
    });
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "HIGH": return "border-l-4 border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400";
      case "MEDIUM": return "border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400";
      case "LOW": return "border-l-4 border-green-500 bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-400";
      default: return "border-l-4 border-zinc-500 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300";
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 border border-zinc-200/60 dark:border-zinc-800 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-950 dark:bg-zinc-800 rounded-2xl shadow-md">
            <CalendarIcon className="w-5 h-5 text-white dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {monthNames[month]} {year}
          </h2>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of the Week Row */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      {/* Calendar Grid cells */}
      <div className="grid grid-cols-7 gap-2">
        {calendarCells.map((day, index) => {
          const dayTasks = day ? getTasksForDate(day) : [];
          const isToday = day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

          return (
            <div
              key={index}
              className={`min-h-[110px] p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                day 
                  ? "bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800/60" 
                  : "bg-transparent border-transparent pointer-events-none"
              } ${isToday ? "ring-2 ring-blue-500 bg-white dark:bg-zinc-900" : ""}`}
            >
              {/* Date Number */}
              {day && (
                <span className={`text-sm font-extrabold block mb-2 ${
                  isToday ? "text-blue-600 dark:text-blue-400" : "text-zinc-700 dark:text-zinc-400"
                }`}>
                  {day}
                </span>
              )}

              {/* Tasks List for this day */}
              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[80px] hide-scrollbar">
                {dayTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`p-1.5 rounded-lg text-[11px] font-bold tracking-tight flex items-center justify-between group/item ${getPriorityClass(task.priority)}`}
                  >
                    <span className="truncate max-w-[75%]">{task.title}</span>
                    <div className="opacity-0 group-hover/item:opacity-100 transition-opacity scale-75 -mr-1">
                      <EditTaskModal
                        taskId={task._id}
                        initialTitle={task.title}
                        initialDescription={task.description || ""}
                        initialDueDate={task.dueDate}
                        onSuccess={onSuccess}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}