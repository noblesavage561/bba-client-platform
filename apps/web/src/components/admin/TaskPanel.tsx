"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "DONE";
  dueDate?: string;
  assignedTo?: string;
}

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

export function TaskPanel({ clientId }: { clientId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "MEDIUM", dueDate: "" });

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/tasks?clientId=${clientId}`);
        if (!response.ok) return;
        const data = await response.json();
        const mapped: Task[] = data.map((task: {
          id: string;
          title: string;
          description?: string | null;
          priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
          status: "OPEN" | "IN_PROGRESS" | "DONE";
          dueDate?: string | null;
          assignedTo?: { name?: string | null } | null;
        }) => ({
          id: task.id,
          title: task.title,
          description: task.description ?? undefined,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : undefined,
          assignedTo: task.assignedTo?.name ?? undefined,
        }));
        setTasks(mapped);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [clientId]);

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          title: newTask.title,
          priority: newTask.priority,
          dueDate: newTask.dueDate || null,
        }),
      });

      if (!response.ok) return;
      const task = await response.json();
      setTasks((prev) => [{
        id: task.id,
        title: task.title,
        description: task.description ?? undefined,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : undefined,
        assignedTo: undefined,
      }, ...prev]);
      setNewTask({ title: "", priority: "MEDIUM", dueDate: "" });
      setShowAddDialog(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string) => {
    const existing = tasks.find((task) => task.id === id);
    if (!existing) return;

    const nextStatus = existing.status === "DONE"
      ? "OPEN"
      : existing.status === "OPEN"
      ? "IN_PROGRESS"
      : "DONE";

    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status: nextStatus } : task))
    );

    const response = await fetch("/api/admin/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus }),
    });

    if (!response.ok) {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, status: existing.status } : task))
      );
      return;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: nextStatus,
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
        {loading && (
          <div className="text-sm text-gray-400">Loading tasks...</div>
        )}

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
            {loading ? "" : "No tasks yet. Add one to get started."}
          </div>
        )}
      </div>

      <Dialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        title="Add New Task"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={saving}>Cancel</Button>
            <Button variant="secondary" onClick={addTask} loading={saving}>Add Task</Button>
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
