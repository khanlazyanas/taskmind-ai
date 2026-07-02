"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Sparkles, Loader2, Calendar } from "lucide-react"; // NAYA: Calendar icon import kiya

interface CreateTaskModalProps {
  onSuccess: () => void | Promise<void>;
}

export default function CreateTaskModal({ onSuccess }: CreateTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(""); // NAYA: Due date ka state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // NAYA: dueDate ko API mein bhej rahe hain (agar khali hai toh undefined jayega)
        body: JSON.stringify({ title, description, dueDate: dueDate || undefined }),
      });

      if (res.ok) {
        setOpen(false);
        setTitle("");
        setDescription("");
        setDueDate(""); // Form reset par date clear kardi
        await onSuccess(); 
      }
    } catch (error) {
      console.error("Failed to create task", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full px-6 py-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-zinc-950 text-white hover:bg-zinc-800 hover:-translate-y-0.5">
          <Plus className="w-5 h-5 mr-2" /> New Initiative
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8 border-zinc-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold flex items-center gap-2 text-zinc-900">
            Create Initiative <Sparkles className="w-5 h-5 text-amber-500" />
          </DialogTitle>
          <DialogDescription className="text-zinc-500 mt-2 font-medium">
            Describe your task. Soon, our AI will automatically assign priority and tags based on this.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-zinc-700 font-bold">Initiative Title</Label>
            <Input
              id="title"
              placeholder="e.g. Setup payment webhook integration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border-zinc-200 shadow-sm focus-visible:ring-zinc-900 px-4 py-6"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-zinc-700 font-bold">Context (for AI)</Label>
            <Textarea
              id="description"
              placeholder="Provide details so AI can accurately tag and prioritize..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border-zinc-200 shadow-sm focus-visible:ring-zinc-900 min-h-[120px] p-4"
            />
          </div>

          {/* NAYA: Due Date Input Field */}
          <div className="space-y-3">
            <Label htmlFor="dueDate" className="text-zinc-700 font-bold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-zinc-500" /> Due Date <span className="text-zinc-400 font-normal">(Optional)</span>
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-xl border-zinc-200 shadow-sm focus-visible:ring-zinc-900 px-4 py-5 text-zinc-700"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl py-6 bg-zinc-950 hover:bg-zinc-800 text-white font-bold transition-all shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              "Create & Auto-Tag"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}