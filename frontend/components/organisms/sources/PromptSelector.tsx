"use client";

import { useState } from "react";
import { PromptTemplate } from "@/lib/types";
import { Button } from "@/components/atoms/Button/Button";
import { Input } from "@/components/atoms/Input/Input";
import { Textarea } from "@/components/atoms/Textarea/Textarea";
import { FormGroup } from "@/components/molecules/FormGroup/FormGroup";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface PromptSelectorProps {
  prompts: PromptTemplate[];
  onSummarize: (promptTemplateId: string | null, promptText: string) => Promise<void>;
  onBack: () => void;
  onSkip: () => void;
}

export function PromptSelector({ prompts: initialPrompts, onSummarize, onBack, onSkip }: PromptSelectorProps) {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [selectedId, setSelectedId] = useState(prompts.find((p) => p.is_default)?.id || prompts[0]?.id || "");
  const [previewText, setPreviewText] = useState(prompts.find((p) => p.is_default)?.prompt_text || prompts[0]?.prompt_text || "");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPromptText, setNewPromptText] = useState("");
  const [formError, setFormError] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const selectedPrompt = prompts.find((p) => p.id === selectedId);

  const handleSelectChange = (id: string) => {
    setSelectedId(id);
    const prompt = prompts.find((p) => p.id === id);
    if (prompt) setPreviewText(prompt.prompt_text);
  };

  const handleCreatePrompt = async () => {
    setFormError("");
    try {
      const res = await fetch(`${API_BASE}/prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, prompt_text: newPromptText }),
      });
      if (res.status === 409) {
        const err = await res.json();
        setFormError(err.detail);
        return;
      }
      if (!res.ok) throw new Error("Failed to create prompt");

      const template = await res.json();
      setPrompts([...prompts, template]);
      setSelectedId(template.id);
      setPreviewText(template.prompt_text);
      setShowNewForm(false);
      setNewName("");
      setNewPromptText("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create prompt");
    }
  };

  const handleDeletePrompt = async () => {
    if (!selectedPrompt || selectedPrompt.is_default) return;
    if (!confirm(`Delete prompt "${selectedPrompt.name}"?`)) return;

    await fetch(`${API_BASE}/prompts/${selectedId}`, { method: "DELETE" });
    const remaining = prompts.filter((p) => p.id !== selectedId);
    setPrompts(remaining);
    if (remaining.length > 0) {
      setSelectedId(remaining[0].id);
      setPreviewText(remaining[0].prompt_text);
    }
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    setSummaryError("");
    try {
      await onSummarize(selectedId, previewText);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : "Summarization failed");
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div>
      {/* Prompt selector */}
      <FormGroup label="Choose a Summary Prompt">
        <div className="flex gap-2 items-center">
          <select
            value={selectedId}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="flex-1 px-3 py-2.5 bg-bg-input border border-sb-border rounded-md text-text-primary text-base font-sans focus:outline-none focus:border-sb-primary"
          >
            {prompts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.is_default ? " (default)" : ""}
              </option>
            ))}
          </select>
          <Button variant="secondary" size="md" onClick={() => setShowNewForm(!showNewForm)}>
            + New Prompt
          </Button>
          {selectedPrompt && !selectedPrompt.is_default && (
            <Button variant="danger" size="sm" onClick={handleDeletePrompt}>
              Delete
            </Button>
          )}
        </div>
      </FormGroup>

      {/* New prompt form */}
      {showNewForm && (
        <div className="bg-bg-card border border-sb-primary rounded-lg p-5 mb-5">
          <h4 className="text-md font-semibold text-sb-primary mb-4">Create New Prompt Template</h4>
          {formError && <p className="text-sm text-sb-danger mb-3">{formError}</p>}
          <FormGroup label="Prompt Name">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Bullet Point Summary"
            />
          </FormGroup>
          <FormGroup label="Prompt Text" hint="Use {source_text} as a placeholder for the source content">
            <Textarea
              value={newPromptText}
              onChange={(e) => setNewPromptText(e.target.value)}
              placeholder="Write your prompt here..."
              className="min-h-28"
            />
          </FormGroup>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setShowNewForm(false); setFormError(""); }}>Cancel</Button>
            <Button onClick={handleCreatePrompt}>Save Prompt</Button>
          </div>
        </div>
      )}

      {/* Prompt preview */}
      <div className="bg-bg-input border border-sb-border rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-secondary">Prompt Preview</span>
          <span className="text-hint text-text-muted italic">Edit below to customize (won&apos;t change the saved template)</span>
        </div>
        <textarea
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          className="w-full min-h-24 p-3 bg-bg-primary border border-sb-border rounded-md text-text-primary text-base font-sans leading-relaxed resize-y focus:outline-none focus:border-sb-primary"
        />
      </div>

      {/* Summary error */}
      {summaryError && (
        <div className="p-4 bg-bg-card border border-sb-danger rounded-lg mb-4">
          <div className="text-sm text-sb-danger font-medium mb-1">Summary Failed</div>
          <div className="text-sm text-text-secondary">{summaryError}</div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onBack}>← Back</Button>
        <Button variant="secondary" onClick={onSkip}>Skip to Notes</Button>
        <Button onClick={handleSummarize} loading={summarizing}>
          Run Summary →
        </Button>
      </div>
    </div>
  );
}
