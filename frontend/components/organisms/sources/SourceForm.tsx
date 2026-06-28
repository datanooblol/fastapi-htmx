"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { Input } from "@/components/atoms/Input/Input";
import { Textarea } from "@/components/atoms/Textarea/Textarea";
import { FormGroup } from "@/components/molecules/FormGroup/FormGroup";
import { UploadZone } from "./UploadZone";

type SourceTab = "write" | "paste" | "upload";

interface SourceFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  loading?: boolean;
}

export function SourceForm({ onSubmit, loading }: SourceFormProps) {
  const [activeTab, setActiveTab] = useState<SourceTab>("write");
  const [file, setFile] = useState<File | null>(null);

  const tabs: { key: SourceTab; label: string }[] = [
    { key: "write", label: "Write Note" },
    { key: "paste", label: "Paste Text" },
    { key: "upload", label: "Upload File" },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("source_type", activeTab);

    if (activeTab === "upload" && file) {
      formData.set("file", file);
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Tab switcher */}
      <div className="flex gap-0 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`
              px-5 py-2.5 text-base border cursor-pointer transition-all
              first:rounded-l-md last:rounded-r-md not-first:border-l-0
              ${activeTab === tab.key
                ? "bg-sb-primary border-sb-primary text-white font-medium"
                : "bg-bg-card border-sb-border text-text-secondary hover:text-text-primary"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Write tab */}
      {activeTab === "write" && (
        <>
          <FormGroup label="Title">
            <Input name="title" placeholder="What is this about?" required />
          </FormGroup>
          <FormGroup label="Content">
            <Textarea name="content" placeholder="Write your thoughts..." required />
          </FormGroup>
        </>
      )}

      {/* Paste tab */}
      {activeTab === "paste" && (
        <>
          <FormGroup label="Title">
            <Input name="title" placeholder="Name this source" required />
          </FormGroup>
          <FormGroup label="Source URL (optional)">
            <Input name="source_url" placeholder="https://..." />
          </FormGroup>
          <FormGroup label="Pasted Content">
            <Textarea name="content" placeholder="Paste text from a website, article, paper..." required />
          </FormGroup>
        </>
      )}

      {/* Upload tab */}
      {activeTab === "upload" && (
        <>
          <FormGroup label="Title">
            <Input name="title" placeholder="Name this source" required />
          </FormGroup>
          <FormGroup label="File">
            <UploadZone onFileSelect={setFile} />
          </FormGroup>
        </>
      )}

      {/* Tags (shared) */}
      <FormGroup label="Tags" hint="Separate tags with commas">
        <Input name="tags" placeholder="AI, Research, Machine Learning" />
      </FormGroup>

      <div className="flex justify-end mt-6">
        <Button type="submit" loading={loading}>Save Source →</Button>
      </div>
    </form>
  );
}
