"use client";

import { useState } from "react";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "DONE";
  dueDate?: string;
  assignedTo?: string;
}

const mockTasks: Task[] = [
  { id: "t1", title: "Review business tax returns", priority: "HIGH", status: "OPEN", dueDate: "Jan 20, 2024" },
  { id: "t2", title: "Request updated bank statement", priority: "MEDIUM", status: "IN_PROGRESS", assignedTo: "Bruce B." },
  { id: "t3", title: "Verify EIN letter authenticity", priority: "MEDIUM", status: "DONE", dueDate: "Jan 10, 2024" },
];

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

export function TaskPanel({ clientId }: { clientId: string }) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "MEDIUM", dueDate: "" });

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = {
      id: `t${Date.now()}`,
      title: newTask.title,
      priority: newTask.priority as Task["priority"],
      status: "OPEN",
      dueDate: newTask.dueDate || undefined,
    };
    setTasks((prev) => [task, ...prev]);
    setNewTask({ title: "", priority: "MEDIUM", dueDate: "" });
    setShowAddDialog(false);
  };

  const toggleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === "DONE" ? "OPEN" : t.status === "OPEN" ? "IN_PROGRESS" : "DONE",
            }
          : t
      )
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{tasks.filter(t => t.status !== "DONE").length} open tasks</span>
        <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)}>
          + Add Task
        </Button>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors
              ${task.status === "DONE" ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-200"}`}
          >
            <button
              onClick={() => toggleStatus(task.id)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                ${task.status === "DONE"
                  ? "bg-green-500 border-green-500 text-white"
                  : task.status === "IN_PROGRESS"
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300"}`}
            >
              {task.status === "DONE" && <span className="text-xs">✓</span>}
              {task.status === "IN_PROGRESS" && <span className="text-xs text-blue-500">●</span>}
            </button>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${task.status === "DONE" ? "line-through text-gray-400" : "text-gray-800"}`}>
                {task.title}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-gray-400">Due: {task.dueDate}</span>
                )}
                {task.assignedTo && (
                  <span className="text-xs text-gray-400">→ {task.assignedTo}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">
            No tasks yet. Add one to get started.
          </div>
        )}
      </div>

      <Dialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        title="Add New Task"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button variant="secondary" onClick={addTask}>Add Task</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Task Title"
            required
            placeholder="e.g., Request updated bank statements"
            value={newTask.title}
            onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
          />
          <Select
            label="Priority"
            options={["LOW", "MEDIUM", "HIGH", "URGENT"]}
            value={newTask.priority}
            onChange={(e) => setNewTask((prev) => ({ ...prev, priority: e.target.value }))}
          />
          <Input
            label="Due Date"
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
          />
        </div>
      </Dialog>
    </div>
  );
}
