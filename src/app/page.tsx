import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">TaskMind AI 🧠</h1>
            <p className="text-slate-500 mt-2">Smart Team Assistant with AI Auto-Tagging</p>
          </div>
          <Button>+ New Task</Button>
        </div>

        {/* Kanban Board Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* TODO Column */}
          <Card className="bg-slate-100/50 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-700">To Do</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dummy Task Card (Baad mein ye API se aayega) */}
              <div className="p-4 border rounded-lg bg-white shadow-sm flex flex-col gap-2">
                <h3 className="font-semibold text-slate-800">Setup Project Database</h3>
                <p className="text-sm text-slate-500 line-clamp-2">Connect MongoDB and create the Task schema with AI priority tags.</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md">HIGH</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md">backend</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IN PROGRESS Column */}
          <Card className="bg-slate-100/50 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Khali column */}
            </CardContent>
          </Card>

          {/* DONE Column */}
          <Card className="bg-slate-100/50 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-600">Done</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Khali column */}
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  );
}