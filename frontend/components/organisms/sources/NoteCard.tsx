"use client";

import { Note } from "@/lib/types";
import { Button } from "@/components/atoms/Button/Button";

interface NoteCardProps {
  note: Note;
  active?: boolean;
  onClick?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
}

export function NoteCard({ note, active, onClick, onDelete }: NoteCardProps) {
  return (
    <div
      onClick={() => onClick?.(note)}
      className={`
        p-3 bg-bg-primary border rounded-md mb-2 transition-all cursor-pointer
        ${active ? "border-sb-primary bg-bg-input" : "border-sb-border hover:border-sb-primary"}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="font-medium text-sm">{note.title}</div>
        {onDelete && (
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this note?")) onDelete(note.id);
            }}
          >
            Delete
          </Button>
        )}
      </div>
      <div className="text-hint text-text-muted mt-1 line-clamp-2">
        {note.content}
      </div>
      <div className="flex gap-3 text-label text-text-muted mt-2">
        <span>{new Date(note.created_at).toLocaleDateString()}</span>
        <span>{note.word_count} words</span>
      </div>
    </div>
  );
}
