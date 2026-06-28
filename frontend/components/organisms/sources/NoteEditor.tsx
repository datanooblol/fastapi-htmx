"use client";

import { useState } from "react";
import { Note } from "@/lib/types";
import { Button } from "@/components/atoms/Button/Button";
import { Input } from "@/components/atoms/Input/Input";
import { NoteCard } from "./NoteCard";

interface NoteEditorProps {
  notes: Note[];
  onSave: (title: string, content: string) => Promise<void>;
  onUpdate: (noteId: string, title: string, content: string) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
}

export function NoteEditor({ notes, onSave, onUpdate, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);

    if (editingId) {
      await onUpdate(editingId, title, content);
    } else {
      await onSave(title, content);
    }

    setTitle("");
    setContent("");
    setEditingId(null);
    setSaving(false);
  };

  const handleEditClick = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
  };

  return (
    <div className="bg-bg-card border border-sb-border rounded-lg flex flex-col overflow-hidden min-h-0">
      <div className="flex justify-between items-center px-4.5 py-3.5 border-b border-sb-border shrink-0">
        <h3 className="text-md font-semibold">Your Notes</h3>
        {editingId && (
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            + New Note
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4.5 min-h-0">
        <form onSubmit={handleSubmit}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="bg-transparent border-0 border-b border-sb-border rounded-none px-0 py-1 text-lg font-semibold mb-3"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your notes here..."
            className="w-full min-h-48 p-0 bg-transparent border-none text-text-primary text-base font-sans leading-relaxed resize-none focus:outline-none placeholder:text-text-muted"
            required
          />
          <div className="flex justify-end gap-2 mt-3">
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" size="sm" loading={saving}>
              {editingId ? "Update Note" : "Save Note"}
            </Button>
          </div>
        </form>

        {notes.length > 0 && (
          <div className="mt-5 pt-3 border-t border-sb-border">
            <h4 className="text-sm font-semibold text-text-secondary mb-3">Previous Notes</h4>
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                active={note.id === editingId}
                onClick={handleEditClick}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 px-4.5 py-2.5 border-t border-sb-border text-hint text-text-muted shrink-0">
        <span>{editingId ? "Editing note" : "Markdown supported"}</span>
        <span>{notes.length} notes</span>
      </div>
    </div>
  );
}
