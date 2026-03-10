"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface NoteItem {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  authorName: string;
}

export function ClientNotesPanel({
  clientId,
  initialNotes,
}: {
  clientId: string;
  initialNotes: NoteItem[];
}) {
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          content: trimmed,
          isInternal,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Failed to add note" }));
        setError(payload.error ?? "Failed to add note");
        return;
      }

      const note = await response.json();
      const mapped: NoteItem = {
        id: note.id,
        content: note.content,
        isInternal: note.isInternal,
        createdAt: new Date(note.createdAt).toISOString().slice(0, 10),
        authorName: note.author?.name ?? "Unknown",
      };

      setNotes((prev) => [mapped, ...prev]);
      setContent("");
      setIsInternal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className={`p-4 rounded-lg ${note.isInternal ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"}`}>
            {note.isInternal && (
              <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full mb-2 inline-block">
                Internal
              </span>
            )}
            <p className="text-sm text-gray-700">{note.content}</p>
            <p className="text-xs text-gray-400 mt-1">{note.authorName} · {note.createdAt}</p>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="text-sm text-gray-400">No notes yet.</div>
        )}
      </div>

      <div className="mt-4 p-3 rounded-lg border border-gray-200 bg-white">
        <Textarea
          label="Add Note"
          placeholder="Write an update, client call summary, or follow-up detail..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={3}
        />

        <label className="mt-3 inline-flex items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={isInternal}
            onChange={(event) => setIsInternal(event.target.checked)}
          />
          Mark as internal note
        </label>

        {error && (
          <div className="mt-2 text-xs text-red-600">{error}</div>
        )}

        <div className="mt-3 flex justify-end">
          <Button variant="secondary" size="sm" onClick={submit} loading={saving}>
            Add Note
          </Button>
        </div>
      </div>
    </div>
  );
}