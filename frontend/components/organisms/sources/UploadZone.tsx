"use client";

import { useRef, useState } from "react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export function UploadZone({ onFileSelect }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const clear = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-sb-border rounded-lg p-12 text-center cursor-pointer transition-all hover:border-sb-primary hover:bg-bg-card"
      >
        <div className="text-4xl mb-3 text-text-muted">⇧</div>
        <div className="text-md text-text-secondary mb-1">Drop file here or click to browse</div>
        <div className="text-xs text-text-muted">PDF, DOCX, TXT, HTML, PPTX — max 20MB</div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt,.html,.pptx,.md"
          onChange={handleChange}
        />
      </div>

      {selectedFile && (
        <div className="flex items-center gap-3 mt-3 p-3 bg-bg-card border border-sb-border rounded-md text-base">
          <span className="text-xl">📄</span>
          <div className="flex-1">
            <div className="font-medium text-sm">{selectedFile.name}</div>
            <div className="text-hint text-text-muted">
              {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
            </div>
          </div>
          <button
            onClick={clear}
            className="text-sb-danger bg-transparent border-none cursor-pointer text-lg"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
