"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/atoms/Button/Button";
import { Input } from "@/components/atoms/Input/Input";
import { SectionBlock } from "@/components/organisms/articles/SectionBlock";
import { MusePanel } from "@/components/organisms/muse/MusePanel";
import { Article, ArticleSection } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface SectionRef {
  id: string;
  ref_id: string;
  ref_type: string;
  name: string;
}

interface SectionData extends ArticleSection {
  refs: SectionRef[];
}

interface AvailableRef {
  id: string;
  title: string;
  type: string;
}

export default function ArticleEditPage() {
  const params = useParams();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [availableRefs, setAvailableRefs] = useState<{ notes: AvailableRef[]; sources: AvailableRef[] }>({ notes: [], sources: [] });
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [refPickerSection, setRefPickerSection] = useState<string | null>(null);
  const [refSearch, setRefSearch] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [dirty, setDirty] = useState(false);
  const [museOpen, setMuseOpen] = useState(false);
  const [museSectionId, setMuseSectionId] = useState<string | null>(null);
  const [museSectionTitle, setMuseSectionTitle] = useState<string | null>(null);
  const [museSectionStatus, setMuseSectionStatus] = useState<string | null>(null);
  const [museSectionWordCount, setMuseSectionWordCount] = useState(0);
  const [museSectionRefCount, setMuseSectionRefCount] = useState(0);

  const showSaved = () => {
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const fetchData = async () => {
    const res = await fetch(`${API_BASE}/articles/${articleId}`);
    if (!res.ok) return;
    const data = await res.json();
    setArticle(data.article);
    setSections(data.sections);
    setAvailableRefs(data.available_refs);
    setTitle(data.article.title);
    setSubtitle(data.article.subtitle || "");
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [articleId]);

  const updateArticle = async (updates: Record<string, string>) => {
    setSaveStatus("saving");
    await fetch(`${API_BASE}/articles/${articleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setDirty(false);
    showSaved();
  };

  const addSection = async () => {
    if (!newSectionTitle.trim()) return;
    await fetch(`${API_BASE}/articles/${articleId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newSectionTitle }),
    });
    setNewSectionTitle("");
    fetchData();
  };

  const updateSection = async (sectionId: string, data: Record<string, string | undefined>) => {
    setSaveStatus("saving");
    await fetch(`${API_BASE}/articles/${articleId}/sections/${sectionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    showSaved();
    fetchData();
  };

  const deleteSection = async (sectionId: string) => {
    await fetch(`${API_BASE}/articles/${articleId}/sections/${sectionId}`, { method: "DELETE" });
    fetchData();
  };

  const openMuse = (sectionId?: string, sectionTitle?: string) => {
    setMuseSectionId(sectionId || null);
    setMuseSectionTitle(sectionTitle || null);
    if (sectionId) {
      const sec = sections.find(s => s.id === sectionId);
      setMuseSectionStatus(sec?.status || null);
      setMuseSectionWordCount(sec?.word_count || 0);
      setMuseSectionRefCount(sec?.refs?.length || 0);
    } else {
      setMuseSectionStatus(null);
      setMuseSectionWordCount(0);
      setMuseSectionRefCount(0);
    }
    setMuseOpen(true);
  };

  const applyMuseToSection = async (sectionId: string, content: string) => {
    await updateSection(sectionId, { content, status: "ai_drafted" });
  };

  const addRef = async (sectionId: string, refId: string, refType: string) => {
    await fetch(`${API_BASE}/articles/${articleId}/sections/${sectionId}/refs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref_id: refId, ref_type: refType }),
    });
    setRefPickerSection(null);
    setRefSearch("");
    fetchData();
  };

  const removeRef = async (sectionId: string, refLinkId: string) => {
    await fetch(`${API_BASE}/articles/${articleId}/sections/${sectionId}/refs/${refLinkId}`, { method: "DELETE" });
    fetchData();
  };

  const allRefs = [...availableRefs.notes, ...availableRefs.sources];
  const filteredRefs = refSearch
    ? allRefs.filter((r) => r.title.toLowerCase().includes(refSearch.toLowerCase()))
    : allRefs;

  const totalWords = sections.reduce((sum, s) => sum + s.word_count, 0);

  if (loading) return <div className="text-center py-12 text-text-muted">Loading...</div>;
  if (!article) return <div className="text-center py-12 text-text-muted">Article not found</div>;

  return (
    <div className="flex h-screen">
      {/* Main editor area */}
      <div className="flex-1 overflow-y-auto p-8">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-text-muted">
          <a href="/">Dashboard</a> / <a href="/articles">Articles</a> / Edit
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-hint transition-opacity ${saveStatus === "idle" ? "opacity-0" : "opacity-100"}`}>
            {saveStatus === "saving" && (
              <span className="text-text-muted flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 border-2 border-sb-border border-t-sb-primary rounded-full animate-spin" />
                Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-sb-success">✓ Saved</span>
            )}
          </span>
          {dirty && (
            <Button size="sm" onClick={() => updateArticle({ title, subtitle })}>
              Save Changes
            </Button>
          )}
          <button
            onClick={() => openMuse()}
            className={`px-3 py-1.5 rounded text-sm border cursor-pointer transition-all flex items-center gap-1.5
              ${museOpen ? "bg-bg-card border-sb-primary text-sb-primary" : "border-sb-border text-text-secondary hover:text-sb-primary hover:border-sb-primary"}`}
          >
            ◈ Muse
          </button>
        </div>
      </div>

      {/* Title + subtitle */}
      <div className="mb-6 max-w-[720px] mx-auto">
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
          onBlur={() => { if (dirty) updateArticle({ title, subtitle }); }}
          placeholder="Article title..."
          className="w-full p-0 mb-2 bg-transparent border-none text-3xl font-bold font-sans text-text-primary focus:outline-none placeholder:text-text-muted"
        />
        <input
          value={subtitle}
          onChange={(e) => { setSubtitle(e.target.value); setDirty(true); }}
          onBlur={() => { if (dirty) updateArticle({ title, subtitle }); }}
          placeholder="Subtitle (optional)..."
          className="w-full p-0 bg-transparent border-none text-lg text-text-secondary font-sans focus:outline-none placeholder:text-text-muted"
        />
      </div>

      {/* Sections */}
      <div className="max-w-[720px] mx-auto">
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            onUpdate={updateSection}
            onDelete={deleteSection}
            onAddRef={(sectionId) => setRefPickerSection(sectionId)}
            onRemoveRef={removeRef}
            onOpenMuse={(sectionId, title) => openMuse(sectionId, title)}
          />
        ))}

        {/* Add section */}
        <div className="flex gap-2 items-center mt-2 mb-4">
          <input
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="New section title..."
            className="flex-1 px-3.5 py-2.5 bg-transparent border-2 border-dashed border-sb-border rounded-lg text-text-primary text-base font-sans focus:outline-none focus:border-sb-primary placeholder:text-text-muted"
            onKeyDown={(e) => e.key === "Enter" && addSection()}
          />
          <Button variant="secondary" onClick={addSection}>+ Add Section</Button>
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex justify-between items-center px-6 py-2.5 border-t border-sb-border mt-8 text-hint text-text-muted">
        <div className="flex gap-4">
          <span>{sections.length} sections</span>
          <span>~{totalWords} words</span>
        </div>
        <div className="flex gap-2">
          <a href={`/articles/${articleId}/publish`}>
            <Button variant="success" size="sm">Preview & Publish →</Button>
          </a>
        </div>
      </div>

      {/* Ref picker modal */}
      {refPickerSection && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setRefPickerSection(null)}>
          <div className="bg-bg-card border border-sb-border rounded-xl w-[420px] max-h-[60vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 py-3.5 border-b border-sb-border">
              <h3 className="text-md font-semibold">Attach Reference</h3>
              <button onClick={() => setRefPickerSection(null)} className="text-text-muted hover:text-text-primary cursor-pointer bg-transparent border-none text-lg">✕</button>
            </div>
            <div className="px-5 py-3 border-b border-sb-border">
              <input
                value={refSearch}
                onChange={(e) => setRefSearch(e.target.value)}
                placeholder="Search notes, sources..."
                className="w-full px-3 py-2 bg-bg-input border border-sb-border rounded-md text-text-primary text-sm font-sans focus:outline-none focus:border-sb-primary"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {filteredRefs.map((r) => (
                <div
                  key={`${r.type}-${r.id}`}
                  onClick={() => addRef(refPickerSection, r.id, r.type)}
                  className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all hover:bg-bg-input text-sm"
                >
                  <span className={`text-label px-1.5 py-0.5 rounded-sm ${r.type === "note" ? "bg-tag-bg text-sb-primary" : "bg-tag-bg text-sb-success"}`}>
                    {r.type}
                  </span>
                  <span className="text-text-secondary">{r.title}</span>
                </div>
              ))}
              {filteredRefs.length === 0 && (
                <div className="text-center py-6 text-text-muted text-sm">No references found</div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Muse Panel */}
      <MusePanel
        articleId={articleId}
        isOpen={museOpen}
        onClose={() => setMuseOpen(false)}
        sectionId={museSectionId}
        sectionTitle={museSectionTitle}
        sectionStatus={museSectionStatus}
        sectionWordCount={museSectionWordCount}
        sectionRefCount={museSectionRefCount}
        totalSections={sections.length}
        onApplyToSection={applyMuseToSection}
      />
    </div>
  );
}
