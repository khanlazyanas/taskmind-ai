"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface Task {
  status: string;
  priority: string;
}

interface TaskAnalyticsProps {
  tasks: Task[];
}

export default function TaskAnalytics({ tasks }: TaskAnalyticsProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration error se bachne ke liye aur loading state
  if (!mounted) return <div className="h-64 animate-pulse bg-zinc-100 dark:bg-zinc-900 rounded-3xl mt-6" />;
  
  // Agar tasks nahi hain toh charts chhupa do
  if (tasks.length === 0) return null;

  // 1. Bar Chart Data (Tasks by Status)
  const statusData = [
    { name: "To Do", count: tasks.filter(t => t.status === "TODO").length },
    { name: "In Progress", count: tasks.filter(t => t.status === "IN_PROGRESS").length },
    { name: "Done", count: tasks.filter(t => t.status === "DONE").length },
  ];

  // 2. Pie Chart Data (Tasks by Priority)
  const priorityData = [
    { name: "High", value: tasks.filter(t => t.priority === "HIGH").length, color: "#ef4444" },   // Red
    { name: "Medium", value: tasks.filter(t => t.priority === "MEDIUM").length, color: "#f59e0b" }, // Amber
    { name: "Low", value: tasks.filter(t => t.priority === "LOW").length, color: "#22c55e" },     // Green
  ].filter(d => d.value > 0); // Jo priority 0 hai usko hide kardo

  const textColor = theme === "dark" ? "#a1a1aa" : "#71717a"; 
  const tooltipBg = theme === "dark" ? "#18181b" : "#ffffff";
  const tooltipText = theme === "dark" ? "#f4f4f5" : "#18181b";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Bar Chart: Tasks By Status */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-200/60 dark:border-zinc-800 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Tasks Workflow</h3>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: theme === 'dark' ? '#27272a' : '#f4f4f5' }}
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: tooltipBg, color: tooltipText }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 6, 6]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart: Tasks By Priority */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-200/60 dark:border-zinc-800 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50">
            <PieChartIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Priority Breakdown</h3>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: tooltipBg, color: tooltipText }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: '500', color: textColor }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}