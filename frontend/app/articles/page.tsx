"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/atoms/Button/Button";
import { DotStatus } from "@/components/atoms/StatusDot/StatusDot";
import { PageContainer } from "@/components/organisms/layout/PageContainer";
import { ContentCard, ViewMode } from "@/components/organisms/shared/ContentCard";
import { ViewToggle } from "@/components/organisms/shared/ViewToggle";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface ArticleItem {
  id: string;
  title: string;
  subtitle: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  sections: { id: string; title: string; status: string; word_count: number }[];
  section_count: number;
  total_word_count: number;
}

export default function ArticlesListPage() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [counts, setCounts] = useState({ total: 0, outline: 0, draft: 0, review: 0, published: 0 });
  const [filter, setFilter] = useState<string | null>(searchParams.get("status"));
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : "";
    const res = await fetch(`${API_BASE}/articles${params}`);
    const data = await res.json();
    setArticles(data.articles);
    setCounts(data.counts);
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, [filter]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const res = await fetch(`${API_BASE}/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    const article = await res.json();
    setNewTitle("");
    setShowCreate(false);
    window.location.href = `/articles/${article.id}/edit`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    await fetch(`${API_BASE}/articles/${id}`, { method: "DELETE" });
    fetchArticles();
  };

  const tabs = [
    { key: null, label: "All", count: counts.total },
    { key: "outline", label: "Outline", count: counts.outline },
    { key: "draft", label: "Drafts", count: counts.draft },
    { key: "review", label: "In Review", count: counts.review },
    { key: "published", label: "Published", count: counts.published },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-3xl font-bold mb-1">Articles</h2>
          <div className="flex gap-4 text-xs text-text-muted">
            <span><strong className="text-text-secondary">{counts.total}</strong> total</span>
            <span><strong className="text-text-secondary">{counts.draft}</strong> drafts</span>
            <span><strong className="text-text-secondary">{counts.review}</strong> in review</span>
            <span><strong className="text-text-secondary">{counts.published}</strong> published</span>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Article</Button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="bg-bg-card border border-sb-primary rounded-lg p-5 mb-5">
          <h3 className="text-md font-semibold text-sb-primary mb-3">New Article</h3>
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Article title..."
            className="w-full px-3.5 py-2.5 bg-bg-input border border-sb-border rounded-md text-text-primary text-base font-sans mb-3 focus:outline-none focus:border-sb-primary"
            autoFocus onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setShowCreate(false); setNewTitle(""); }}>Cancel</Button>
            <Button onClick={handleCreate}>Create & Edit →</Button>
          </div>
        </div>
      )}

      {/* Filter tabs + View toggle */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button key={tab.key ?? "all"} onClick={() => setFilter(tab.key)}
              className={`px-5 py-2 text-sm border cursor-pointer transition-all flex items-center gap-1.5
                first:rounded-l-md last:rounded-r-md not-first:border-l-0
                ${filter === tab.key
                  ? "bg-sb-primary border-sb-primary text-white font-medium"
                  : "bg-transparent border-sb-border text-text-muted hover:text-text-secondary"}`}>
              {tab.label}
              <span className={`text-label px-1.5 rounded-lg font-semibold ${filter === tab.key ? "bg-white/20" : "bg-tag-bg text-text-muted"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Articles */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <p className="text-base mb-2">No articles yet</p>
          <Button onClick={() => setShowCreate(true)}>Create your first article</Button>
        </div>
      ) : (
        <div className={viewMode === "card" ? "grid grid-cols-3 gap-3" : "flex flex-col gap-2.5"}>
          {articles.map((a) => {
            const writtenCount = a.sections.filter((s) => s.status === "written").length;
            const progressPct = a.section_count > 0 ? (writtenCount / a.section_count) * 100 : 0;

            return (
              <ContentCard
                key={a.id}
                id={a.id}
                title={a.title}
                subtitle={a.subtitle}
                href={`/articles/${a.id}/edit`}
                statusBadge={{ label: a.status, color: "" }}
                meta={`Last edited ${new Date(a.updated_at).toLocaleDateString()} · ${a.section_count} sections · ~${a.total_word_count} words`}
                progress={a.sections.length > 0 ? {
                  dots: a.sections.map((s) => s.status as DotStatus),
                  label: `${writtenCount} / ${a.section_count} written`,
                  percent: progressPct,
                } : undefined}
                viewMode={viewMode}
                actions={[
                  { label: "Edit", href: `/articles/${a.id}/edit` },
                  { label: "Delete", variant: "danger", onClick: () => handleDelete(a.id) },
                ]}
              />
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
