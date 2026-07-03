"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit2, Loader2, Sparkles, Calendar } from "lucide-react"; 

interface EditTaskModalProps {
  taskId: string;
  initialTitle: string;
  initialDescription: string;
  initialDueDate?: string; // NAYA: Purani date receive karne ke liye
  onSuccess: () => void;
}

export default function EditTaskModal({ taskId, initialTitle, initialDescription, initialDueDate, onSuccess }: EditTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  
  // Date ko YYYY-MM-DD format mein convert karna input field ke liye
  const formatDateForInput = (isoString?: string) => {
    if (!isoString) return "";
    return new Date(isoString).toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState(formatDateForInput(initialDueDate)); 
  const [regenerateAI, setRegenerateAI] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);

  // Agar initial prop change ho toh state update karo
  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setDueDate(formatDateForInput(initialDueDate));
  }, [initialTitle, initialDescription, initialDueDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // NAYA: dueDate ko bhi bhej rahe hain
        body: JSON.stringify({ title, description, regenerateAI, dueDate: dueDate || null }), 
      });

      if (res.ok) {
        setOpen(false);
        setRegenerateAI(false);
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to update task", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-zinc-400 dark:text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 bg-white dark:bg-zinc-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-xl transition-all duration-300 shadow-sm border border-zinc-100 dark:border-zinc-700/50 hover:border-blue-200 dark:hover:border-blue-800" title="Edit Task">
          <Edit2 className="w-4 h-4" />
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Edit Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Task Title</Label>
            <Input 
              placeholder="E.g., Fix navbar responsiveness" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="rounded-xl border-zinc-200 dark:border-zinc-700 focus-visible:ring-blue-500 h-11 bg-transparent dark:text-zinc-100"
              required 
            />
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Description <span className="text-zinc-400 dark:text-zinc-600 font-normal">(Optional)</span></Label>
            <Textarea 
              placeholder="Add more details about this task..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="rounded-xl border-zinc-200 dark:border-zinc-700 focus-visible:ring-blue-500 resize-none min-h-[100px] bg-transparent dark:text-zinc-100"
            />
          </div>

          {/* NAYA: Edit modal mein date field add kar diya */}
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-500" /> Due Date <span className="text-zinc-400 dark:text-zinc-600 font-normal">(Optional)</span>
            </Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-xl border-zinc-200 dark:border-zinc-700 focus-visible:ring-blue-500 h-11 text-zinc-700 dark:text-zinc-200 bg-transparent dark:[color-scheme:dark]"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <input
              type="checkbox"
              id={`ai-regen-${taskId}`}
              checked={regenerateAI}
              onChange={(e) => setRegenerateAI(e.target.checked)}
              className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded focus:ring-blue-500 dark:focus:ring-blue-400 border-zinc-300 dark:border-zinc-700 cursor-pointer bg-transparent"
            />
            <label htmlFor={`ai-regen-${taskId}`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer flex-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              Regenerate AI Action Plan
            </label>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 rounded-xl h-11 font-bold text-zinc-600 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 rounded-xl h-11 font-bold bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-md">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}