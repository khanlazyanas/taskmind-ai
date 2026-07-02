"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Loader2, Sparkles } from "lucide-react"; // NAYA: Sparkles icon for AI

interface EditTaskModalProps {
  taskId: string;
  initialTitle: string;
  initialDescription: string;
  onSuccess: () => void;
}

export default function EditTaskModal({ taskId, initialTitle, initialDescription, onSuccess }: EditTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [regenerateAI, setRegenerateAI] = useState(false); // NAYA: State for AI Checkbox
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // NAYA: regenerateAI flag ko backend bhej rahe hain
        body: JSON.stringify({ title, description, regenerateAI }), 
      });

      if (res.ok) {
        setOpen(false);
        setRegenerateAI(false); // Reset on success
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
        <button className="text-zinc-400 hover:text-blue-500 bg-white hover:bg-blue-50 p-2 rounded-xl transition-all duration-300 shadow-sm border border-zinc-100 hover:border-blue-200" title="Edit Task">
          <Edit2 className="w-4 h-4" />
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 bg-white/95 backdrop-blur-xl border border-zinc-200/50 shadow-2xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-extrabold text-zinc-900 tracking-tight">Edit Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-zinc-600">Task Title</label>
            <Input 
              placeholder="E.g., Fix navbar responsiveness" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="rounded-xl border-zinc-200 focus-visible:ring-blue-500 h-11"
              required 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-zinc-600">Description <span className="text-zinc-400 font-normal">(Optional)</span></label>
            <Textarea 
              placeholder="Add more details about this task..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="rounded-xl border-zinc-200 focus-visible:ring-blue-500 resize-none min-h-[100px]"
            />
          </div>

          {/* NAYA: AI Regenerate Checkbox UI */}
          <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <input
              type="checkbox"
              id={`ai-regen-${taskId}`}
              checked={regenerateAI}
              onChange={(e) => setRegenerateAI(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-zinc-300 cursor-pointer"
            />
            <label htmlFor={`ai-regen-${taskId}`} className="text-sm font-medium text-zinc-700 flex items-center gap-1.5 cursor-pointer flex-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Regenerate AI Action Plan
            </label>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 rounded-xl h-11 font-bold text-zinc-600">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 rounded-xl h-11 font-bold bg-zinc-900 hover:bg-zinc-800 text-white shadow-md">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}