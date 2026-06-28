"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/atoms/Button/Button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface PublicArticle {
  article: {
    id: string;
    title: string;
    subtitle: string | null;
    slug: string;
    published_at: string | null;
    created_at: string;
  };
  sections: { title: string; content: string }[];
  total_words: number;
  reading_time: number;
  engagement: { views: number; likes: number; saves: number; shares: number };
}

export default function PublicArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<PublicArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [engagement, setEngagement] = useState({ views: 0, likes: 0, saves: 0, shares: 0 });
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/p/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => {
        setData(d);
        setEngagement(d.engagement);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const engage = async (type: string) => {
    const res = await fetch(`${API_BASE}/p/${slug}/engage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    if (res.ok) {
      const stats = await res.json();
      setEngagement(stats);
    }
  };

  const handleLike = () => {
    if (!liked) {
      engage("like");
      setLiked(true);
    }
  };

  const handleSave = () => {
    if (!saved) {
      engage("save");
      setSaved(true);
    }
  };

  const handleShare = () => {
    engage("share");
    navigator.clipboard?.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const handleExport = async (format: string) => {
    setExportOpen(false);
    if (format === "markdown" || format === "html") {
      window.open(`${API_BASE}/p/${slug}/export/${format}`, "_blank");
    } else {
      const res = await fetch(`${API_BASE}/p/${slug}/export/${format}`);
      if (res.ok) {
        const result = await res.json();
        await navigator.clipboard?.writeText(result.content);
        alert(`Copied for ${result.platform}! Paste into your editor.`);
      }
    }
  };

  const handleUnpublish = async () => {
    if (!confirm("Unpublish this article? It will return to draft status.")) return;
    await fetch(`${API_BASE}/articles/${data.article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "draft" }),
    });
    window.location.href = `/articles/${data.article.id}/edit`;
  };

  if (loading) return <div className="text-center py-20 text-text-muted">Loading...</div>;
  if (!data) return <div className="text-center py-20 text-text-muted">Article not found</div>;

  const { article, sections, total_words, reading_time } = data;

  return (
    <div className="-ml-60 min-h-screen">
      {/* Top nav (minimal, no sidebar) */}
      <nav className="flex justify-between items-center px-8 py-3.5 border-b border-sb-border">
        <a href="/" className="text-lg font-bold text-sb-primary">SecondBrain</a>
        <div className="flex items-center gap-4">
          <a href="/articles" className="text-sm text-text-muted hover:text-text-primary">Browse Articles</a>
        </div>
      </nav>

      {/* Article */}
      <article className="max-w-170 mx-auto px-6 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold leading-tight mb-2" style={{ fontFamily: "Georgia, serif" }}>
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-xl text-text-secondary italic mb-5">{article.subtitle}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-text-muted pb-6 border-b border-sb-border">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-sb-primary flex items-center justify-center text-white text-sm font-bold">U</div>
              <div>
                <div className="font-semibold text-text-primary">Your Name</div>
                <div>{new Date(article.published_at || article.created_at).toLocaleDateString()} · {reading_time} min read</div>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="mb-8" style={{ fontFamily: "Georgia, serif" }}>
          {sections.map((s, i) => (
            <div key={i} className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "-apple-system, sans-serif" }}>
                {s.title}
              </h2>
              <div className="text-base leading-loose text-text-secondary whitespace-pre-wrap">
                {s.content}
              </div>
            </div>
          ))}
        </div>

        {/* Engagement bar */}
        <div className="flex items-center gap-1.5 py-4 my-8 border-t border-b border-sb-border">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs border cursor-pointer transition-all
              ${liked ? "border-sb-primary text-sb-primary bg-tag-bg" : "border-sb-border text-text-muted hover:border-sb-primary hover:text-sb-primary"}`}
          >
            ♡ <span className="font-medium">{engagement.likes}</span>
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs border cursor-pointer transition-all
              ${saved ? "border-sb-primary text-sb-primary bg-tag-bg" : "border-sb-border text-text-muted hover:border-sb-primary hover:text-sb-primary"}`}
          >
            ★ Save
          </button>
          <div className="flex gap-1.5 ml-auto">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs border border-sb-border text-text-muted cursor-pointer transition-all hover:border-sb-primary hover:text-sb-primary"
            >
              ↗ Share
            </button>

            {/* Export dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs border border-sb-border text-text-muted cursor-pointer transition-all hover:border-sb-primary hover:text-sb-primary"
              >
                ↓ Export
              </button>
              {exportOpen && (
                <div className="absolute bottom-full right-0 mb-2 bg-bg-card border border-sb-border rounded-lg p-1.5 min-w-52 shadow-lg z-50">
                  <div className="text-label uppercase tracking-wide text-text-muted px-2.5 py-1.5">Download</div>
                  <button onClick={() => handleExport("markdown")} className="flex items-center gap-2 w-full px-2.5 py-2 rounded text-xs text-text-secondary cursor-pointer transition-all hover:bg-bg-input hover:text-sb-primary text-left bg-transparent border-none">
                    📄 Markdown (.md)
                  </button>
                  <button onClick={() => handleExport("html")} className="flex items-center gap-2 w-full px-2.5 py-2 rounded text-xs text-text-secondary cursor-pointer transition-all hover:bg-bg-input hover:text-sb-primary text-left bg-transparent border-none">
                    &lt;/&gt; HTML
                  </button>
                  <div className="h-px bg-sb-border my-1" />
                  <div className="text-label uppercase tracking-wide text-text-muted px-2.5 py-1.5">Copy for platform</div>
                  <button onClick={() => handleExport("medium")} className="flex items-center gap-2 w-full px-2.5 py-2 rounded text-xs text-text-secondary cursor-pointer transition-all hover:bg-bg-input hover:text-sb-primary text-left bg-transparent border-none">
                    M Medium
                  </button>
                  <button onClick={() => handleExport("devto")} className="flex items-center gap-2 w-full px-2.5 py-2 rounded text-xs text-text-secondary cursor-pointer transition-all hover:bg-bg-input hover:text-sb-primary text-left bg-transparent border-none">
                    D Dev.to
                  </button>
                  <button onClick={() => handleExport("linkedin")} className="flex items-center gap-2 w-full px-2.5 py-2 rounded text-xs text-text-secondary cursor-pointer transition-all hover:bg-bg-input hover:text-sb-primary text-left bg-transparent border-none">
                    in LinkedIn
                  </button>
                </div>
              )}
            </div>

            {/* Unpublish */}
            <button
              onClick={handleUnpublish}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs border border-sb-border text-text-muted cursor-pointer transition-all hover:border-sb-danger hover:text-sb-danger"
            >
              Unpublish
            </button>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-sb-border text-xs text-text-muted">
        Published on <a href="/" className="text-sb-primary">SecondBrain</a> · Built with FastAPI + Next.js
      </footer>
    </div>
  );
}
