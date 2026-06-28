"use client";
import { PageContainer } from "@/components/organisms/layout/PageContainer";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Source, Note, Summary, PromptTemplate } from "@/lib/types";
import { StepIndicator } from "@/components/organisms/sources/StepIndicator";
import { SourceReader } from "@/components/organisms/sources/SourceReader";
import { NoteEditor } from "@/components/organisms/sources/NoteEditor";
import { PromptSelector } from "@/components/organisms/sources/PromptSelector";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const steps = [
  { number: 1, label: "Add Source" },
  { number: 2, label: "Summarize" },
  { number: 3, label: "Read & Note" },
];

interface SourceData {
  source: Source;
  notes: Note[];
  summaries: Summary[];
  prompts: PromptTemplate[];
}

export default function SourcePage() {
  const params = useParams();
  const sourceId = params.id as string;

  const [data, setData] = useState<SourceData | null>(null);
  const [currentStep, setCurrentStep] = useState(3);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/sources/${sourceId}`);
      if (!res.ok) throw new Error("Source not found");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sourceId]);

  const handleSaveNote = async (title: string, content: string) => {
    const formData = new FormData();
    formData.set("title", title);
    formData.set("content", content);

    const res = await fetch(`${API_BASE}/sources/${sourceId}/notes`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      await fetchData();
    }
  };

  const handleUpdateNote = async (noteId: string, title: string, content: string) => {
    const formData = new FormData();
    formData.set("title", title);
    formData.set("content", content);

    await fetch(`${API_BASE}/sources/${sourceId}/notes/${noteId}`, {
      method: "PUT",
      body: formData,
    });
    await fetchData();
  };

  const handleDeleteNote = async (noteId: string) => {
    await fetch(`${API_BASE}/sources/${sourceId}/notes/${noteId}`, {
      method: "DELETE",
    });
    await fetchData();
  };

  const handleDeleteSummary = async (summaryId: string) => {
    await fetch(`${API_BASE}/sources/${sourceId}/summaries/${summaryId}`, {
      method: "DELETE",
    });
    await fetchData();
  };

  const handleSummarize = async (promptTemplateId: string | null, promptText: string) => {
    const formData = new FormData();
    if (promptTemplateId) formData.set("prompt_template_id", promptTemplateId);
    formData.set("prompt_text", promptText);

    const res = await fetch(`${API_BASE}/sources/${sourceId}/summarize`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Summarization failed");
    }

    await fetchData();
  };

  if (loading) {
    return <div className="text-text-muted text-center py-12">Loading...</div>;
  }

  if (!data) {
    return <div className="text-text-muted text-center py-12">Source not found</div>;
  }

  return (
    <PageContainer>
      <div className="text-sm text-text-muted mb-1">
        <a href="/">Dashboard</a> / <a href="/notes">Notes</a> / {data.source.title}
      </div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Source Workspace</h2>
      </div>

      <StepIndicator steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />

      {/* Step 1: Add Source (completed — show info) */}
      {currentStep === 1 && (
        <div className="bg-bg-card border border-sb-border rounded-lg p-5">
          <div className="text-sm text-text-muted mb-2">Source already created:</div>
          <div className="text-lg font-semibold">{data.source.title}</div>
          <div className="text-sm text-text-muted mt-1">
            {data.source.source_type} · {data.source.word_count} words
          </div>
        </div>
      )}

      {/* Step 2: Summarize */}
      {currentStep === 2 && (
        <PromptSelector
          prompts={data.prompts}
          onSummarize={handleSummarize}
          onBack={() => setCurrentStep(1)}
          onSkip={() => setCurrentStep(3)}
        />
      )}

      {/* Step 3: Read & Note */}
      {currentStep === 3 && (
        <>
          <div className="grid grid-cols-2 gap-5 h-[70vh]">
            <SourceReader
              source={data.source}
              summaries={data.summaries}
              onDeleteSummary={handleDeleteSummary}
            />
            <NoteEditor
              notes={data.notes}
              onSave={handleSaveNote}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 rounded-md bg-bg-card border border-sb-border text-text-secondary text-base font-medium cursor-pointer transition-all hover:text-text-primary hover:border-text-muted"
            >
              ← Back to Summary
            </button>
            <a
              href="/graph"
              className="px-6 py-2.5 rounded-md bg-sb-success text-white text-base font-medium cursor-pointer transition-all hover:brightness-110"
            >
              View Graph →
            </a>
          </div>
        </>
      )}
    </PageContainer>
  );
}
