"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button/Button";
import { Input } from "@/components/atoms/Input/Input";
import { Article } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Section {
  title: string;
  content: string;
  status: string;
  word_count: number;
}

interface ChecklistItem {
  label: string;
  passed: boolean;
  optional?: boolean;
}

export default function PublishPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    fetch(`${API_BASE}/articles/${articleId}/publish`)
      .then((r) => r.json())
      .then((data) => {
        setArticle(data.article);
        setSections(data.sections);
        setChecklist(data.checklist);
        setTotalWords(data.total_words);
        setReadingTime(data.reading_time);
        setSlug(data.article.slug || data.article.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
        setExcerpt(data.article.excerpt || "");
        setVisibility(data.article.visibility || "public");
        setLoading(false);
      });
  }, [articleId]);

  const saveSettings = async () => {
    setSaveStatus("saving");
    await fetch(`${API_BASE}/articles/${articleId}/publish/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, excerpt, visibility }),
    });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const handlePublish = async () => {
    setPublishing(true);
    await saveSettings();
    const res = await fetch(`${API_BASE}/articles/${articleId}/publish/now`, { method: "POST" });
    const published = await res.json();
    router.push(`/p/${published.slug}`);
  };

  if (loading) return <div className="text-center py-12 text-text-muted">Loading...</div>;
  if (!article) return <div className="text-center py-12 text-text-muted">Article not found</div>;

  return (
    <div className="flex h-screen">
      {/* Left: Article Preview */}
      <div className="flex-1 overflow-y-auto bg-bg-secondary">
        <div className="flex justify-between items-center px-6 py-3 border-b border-sb-border bg-bg-card sticky top-0 z-10">
          <div className="text-xs text-text-muted">
            <a href="/articles">Articles</a> / <a href={`/articles/${articleId}/edit`}>{article.title}</a> / Publish
          </div>
          <span className="text-hint px-2.5 py-1 bg-sb-warning text-white rounded-full font-medium">Preview</span>
        </div>

        <div className="max-w-170 mx-auto py-12 px-8">
          <h1 className="text-4xl font-extrabold leading-tight mb-2">{article.title}</h1>
          {article.subtitle && <p className="text-xl text-text-secondary mb-5">{article.subtitle}</p>}

          <div className="flex items-center gap-4 text-sm text-text-muted pb-6 mb-8 border-b border-sb-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-sb-primary flex items-center justify-center text-white text-xs font-bold">U</div>
              <span>Your Name</span>
            </div>
            <span>{new Date().toLocaleDateString()}</span>
            <span>{readingTime} min read</span>
            <span>{totalWords} words</span>
          </div>

          {sections.map((s, i) => (
            <div key={i} className="mb-8">
              <h2 className="text-2xl font-bold mb-3">{s.title}</h2>
              <div className="text-base leading-relaxed text-text-secondary whitespace-pre-wrap">
                {s.content || <span className="italic text-text-muted">(No content yet)</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Publish Settings */}
      <div className="w-80 border-l border-sb-border bg-bg-primary flex flex-col shrink-0 overflow-y-auto">
        <div className="px-5 py-4 border-b border-sb-border">
          <h3 className="text-md font-semibold">Publish Settings</h3>
        </div>

        <div className="px-5 py-4 flex-1">
          {/* Slug */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">URL Slug</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onBlur={saveSettings}
            />
            <div className="text-label text-text-muted mt-1">
              yoursite.com/p/<span className="text-sb-primary">{slug}</span>
            </div>
          </div>

          {/* Excerpt */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              onBlur={saveSettings}
              placeholder="Short description for search results..."
              className="w-full px-3 py-2 bg-bg-card border border-sb-border rounded-md text-text-primary text-sm font-sans leading-relaxed resize-y min-h-16 focus:outline-none focus:border-sb-primary"
            />
            <div className="text-label text-text-muted mt-1">Shown in search results and social previews</div>
          </div>

          {/* Visibility */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => { setVisibility(e.target.value); setTimeout(saveSettings, 0); }}
              className="w-full px-3 py-2 bg-bg-card border border-sb-border rounded-md text-text-primary text-sm font-sans focus:outline-none focus:border-sb-primary"
            >
              <option value="public">Public — anyone can read</option>
              <option value="unlisted">Unlisted — only with link</option>
            </select>
          </div>

          {/* Checklist */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Pre-publish Checklist</label>
            <ul className="space-y-1.5">
              {checklist.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className={`text-md ${item.passed ? "text-sb-success" : item.optional ? "text-sb-warning" : "text-sb-danger"}`}>
                    {item.passed ? "✓" : item.optional ? "●" : "✗"}
                  </span>
                  {item.label}
                  {item.optional && !item.passed && <span className="text-label text-text-muted">— optional</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Save status */}
          {saveStatus !== "idle" && (
            <div className={`text-hint mb-3 ${saveStatus === "saved" ? "text-sb-success" : "text-text-muted"}`}>
              {saveStatus === "saving" ? "Saving..." : "✓ Settings saved"}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sb-border flex flex-col gap-2">
          <Button variant="success" onClick={handlePublish} loading={publishing} className="w-full">
            Publish Now
          </Button>
          <a href={`/articles/${articleId}/edit`}>
            <Button variant="secondary" className="w-full">← Back to Editor</Button>
          </a>
          <div className="text-label text-text-muted text-center">
            Publishing makes this article publicly accessible
          </div>
        </div>
      </div>
    </div>
  );
}
