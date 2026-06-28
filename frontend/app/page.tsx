"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/molecules/StatCard/StatCard";
import { PageContainer } from "@/components/organisms/layout/PageContainer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface DashboardData {
  stats: { total_notes: number; total_sources: number; total_connections: number; total_articles: number };
  recent_notes: { id: string; title: string; source_id: string | null; word_count: number; created_at: string }[];
  draft_articles: { id: string; title: string; status: string; section_count: number; written_count: number; updated_at: string }[];
}

const statusStyles: Record<string, string> = {
  outline: "bg-bg-input text-text-muted border border-sb-border",
  draft: "bg-tag-bg text-sb-warning",
  review: "bg-tag-bg text-sb-primary",
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/dashboard`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const stats = data?.stats || { total_notes: 0, total_sources: 0, total_connections: 0, total_articles: 0 };

  return (
    <PageContainer>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-1">Dashboard</h2>
        <p className="text-text-secondary text-md">Welcome back. Here&apos;s your knowledge at a glance.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Notes" value={stats.total_notes} />
        <StatCard label="Sources" value={stats.total_sources} />
        <StatCard label="Connections" value={stats.total_connections} />
        <StatCard label="Articles" value={stats.total_articles} />
      </div>

      {/* Quick Actions */}
      <div className="bg-bg-card border border-sb-border rounded-lg overflow-hidden mb-6">
        <div className="flex justify-between items-center px-5 py-4 border-b border-sb-border">
          <h3 className="text-md font-semibold">Quick Actions</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-3">
            <Link
              href="/sources/new"
              className="flex flex-col items-center gap-2 p-5 bg-bg-card border border-sb-border rounded-lg text-text-secondary text-sm cursor-pointer transition-all hover:border-sb-primary hover:text-sb-primary hover:-translate-y-0.5"
            >
              <span className="text-2xl">+</span>
              New Source
            </Link>
            <Link
              href="/sources/new"
              className="flex flex-col items-center gap-2 p-5 bg-bg-card border border-sb-border rounded-lg text-text-secondary text-sm cursor-pointer transition-all hover:border-sb-primary hover:text-sb-primary hover:-translate-y-0.5"
            >
              <span className="text-2xl">↑</span>
              Upload Source
            </Link>
            <Link
              href="/articles"
              className="flex flex-col items-center gap-2 p-5 bg-bg-card border border-sb-border rounded-lg text-text-secondary text-sm cursor-pointer transition-all hover:border-sb-primary hover:text-sb-primary hover:-translate-y-0.5"
            >
              <span className="text-2xl">✎</span>
              Write Article
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column: Recent Notes + Graph Preview */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-bg-card border border-sb-border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b border-sb-border">
            <h3 className="text-md font-semibold">Recent Notes</h3>
            <Link href="/notes" className="text-sm text-sb-primary">View all</Link>
          </div>
          <div className="p-5">
            {data?.recent_notes && data.recent_notes.length > 0 ? (
              <div className="flex flex-col gap-0">
                {data.recent_notes.map((note) => (
                  <div key={note.id} className="flex justify-between items-start py-3 border-b border-sb-border last:border-b-0">
                    <div>
                      <Link href={note.source_id ? `/sources/${note.source_id}` : "/notes"} className="text-base font-medium hover:text-sb-primary">
                        {note.title}
                      </Link>
                      <div className="text-xs text-text-muted mt-1">
                        {new Date(note.created_at).toLocaleDateString()} · {note.word_count} words
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted text-sm">
                No notes yet. Start by adding a source.
              </div>
            )}
          </div>
        </div>

        <div className="bg-bg-card border border-sb-border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b border-sb-border">
            <h3 className="text-md font-semibold">Knowledge Graph</h3>
            <Link href="/graph" className="text-sm text-sb-primary">Explore</Link>
          </div>
          <div className="p-5">
            <div className="h-70 flex items-center justify-center text-text-muted text-sm border-2 border-dashed border-sb-border rounded-lg">
              <Link href="/graph" className="hover:text-sb-primary">Explore your knowledge graph →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Draft Articles */}
      <div className="bg-bg-card border border-sb-border rounded-lg overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 border-b border-sb-border">
          <h3 className="text-md font-semibold">Article Drafts</h3>
          <Link href="/articles" className="text-sm text-sb-primary">View all</Link>
        </div>
        <div className="p-5">
          {data?.draft_articles && data.draft_articles.length > 0 ? (
            <div className="flex flex-col gap-0">
              {data.draft_articles.map((article) => (
                <div key={article.id} className="flex justify-between items-center py-3 border-b border-sb-border last:border-b-0">
                  <div>
                    <Link href={`/articles/${article.id}/edit`} className="text-base font-medium hover:text-sb-primary">
                      {article.title}
                    </Link>
                    <div className="text-xs text-text-muted mt-1">
                      {article.written_count} / {article.section_count} sections written · Last edited {new Date(article.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`text-label font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${statusStyles[article.status] || "bg-tag-bg text-text-muted"}`}>
                    {article.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted text-sm">
              No articles yet. Start writing when you&apos;re ready.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
