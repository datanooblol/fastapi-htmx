"use client";
import { PageContainer } from "@/components/organisms/layout/PageContainer";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StepIndicator } from "@/components/organisms/sources/StepIndicator";
import { SourceForm } from "@/components/organisms/sources/SourceForm";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const steps = [
  { number: 1, label: "Add Source" },
  { number: 2, label: "Summarize" },
  { number: 3, label: "Read & Note" },
];

export default function NewSourcePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sources`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to create source");
      const source = await res.json();
      router.push(`/sources/${source.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create source");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="text-sm text-text-muted mb-1">
        <a href="/">Dashboard</a> / <a href="/notes">Notes</a> / New Source
      </div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Source Workspace</h2>
      </div>

      <StepIndicator steps={steps} currentStep={1} />

      <SourceForm onSubmit={handleSubmit} loading={loading} />
    </PageContainer>
  );
}
