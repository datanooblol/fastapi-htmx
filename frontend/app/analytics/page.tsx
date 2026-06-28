"use client";
import { PageContainer } from "@/components/organisms/layout/PageContainer";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/molecules/StatCard/StatCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface ArticleStat {
  id: string;
  title: string;
  slug: string;
  published_at: string;
  word_count: number;
  views: number;
  likes: number;
  saves: number;
  shares: number;
  downloads: number;
}

interface ActivityItem {
  type: string;
  format: string | null;
  platform: string | null;
  article_title: string;
  created_at: string;
}

interface AnalyticsData {
  stats: { views: number; likes: number; saves: number; shares: number; downloads: number };
  articles: ArticleStat[];
  recent_activity: ActivityItem[];
}

const dateRanges = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
  { label: "All", value: null },
];

const activityIcons: Record<string, { icon: string; color: string }> = {
  view: { icon: "👁", color: "text-text-muted" },
  like: { icon: "♡", color: "text-sb-success" },
  save: { icon: "★", color: "text-sb-warning" },
  share: { icon: "↗", color: "text-sb-primary" },
  download: { icon: "↓", color: "text-node-article" },
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const params = range ? `?days=${range}` : "";
    const res = await fetch(`${API_BASE}/analytics${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [range]);

  if (loading) return <div className="text-center py-12 text-text-muted">Loading...</div>;
  if (!data) return <div className="text-center py-12 text-text-muted">No data</div>;

  const maxViews = Math.max(...data.articles.map((a) => a.views), 1);

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Analytics</h2>
        <div className="flex gap-0">
          {dateRanges.map((dr) => (
            <button
              key={dr.label}
              onClick={() => setRange(dr.value)}
              className={`px-3.5 py-1.5 text-xs border cursor-pointer transition-all
                first:rounded-l-md last:rounded-r-md not-first:border-l-0
                ${range === dr.value
                  ? "bg-sb-primary border-sb-primary text-white"
                  : "bg-transparent border-sb-border text-text-muted hover:text-text-secondary"}`}
            >
              {dr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <StatCard label="Total Views" value={data.stats.views} />
        <StatCard label="Likes" value={data.stats.likes} />
        <StatCard label="Saves" value={data.stats.saves} />
        <StatCard label="Shares" value={data.stats.shares} />
        <StatCard label="Downloads" value={data.stats.downloads} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Top Articles bar chart */}
        <div className="bg-bg-card border border-sb-border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center px-4.5 py-3.5 border-b border-sb-border">
            <h3 className="text-md font-semibold">Top Articles</h3>
            <span className="text-hint text-text-muted">by views</span>
          </div>
          <div className="p-4.5">
            {data.articles.length === 0 ? (
              <div className="text-center py-6 text-text-muted text-sm">No published articles yet</div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {data.articles.slice(0, 5).map((a, i) => (
                  <div key={a.id} className="flex items-center gap-2.5">
                    <span className="text-xs text-text-muted min-w-28 truncate">{a.title}</span>
                    <div className="flex-1 h-4.5 bg-bg-input rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm flex items-center pl-2"
                        style={{
                          width: `${(a.views / maxViews) * 100}%`,
                          backgroundColor: ["#4fc3f7", "#66bb6a", "#ffa726", "#ab47bc", "#ec407a"][i % 5],
                        }}
                      >
                        <span className="text-label text-white font-semibold">{a.views}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Engagement breakdown */}
        <div className="bg-bg-card border border-sb-border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center px-4.5 py-3.5 border-b border-sb-border">
            <h3 className="text-md font-semibold">Engagement Breakdown</h3>
            <span className="text-hint text-text-muted">all actions</span>
          </div>
          <div className="p-4.5">
            {(() => {
              const total = data.stats.views + data.stats.likes + data.stats.saves + data.stats.shares + data.stats.downloads;
              if (total === 0) return <div className="text-center py-6 text-text-muted text-sm">No engagement data yet</div>;
              const items = [
                { label: "Views", value: data.stats.views, color: "#4fc3f7" },
                { label: "Likes", value: data.stats.likes, color: "#66bb6a" },
                { label: "Saves", value: data.stats.saves, color: "#ffa726" },
                { label: "Shares", value: data.stats.shares, color: "#ab47bc" },
                { label: "Downloads", value: data.stats.downloads, color: "#ec407a" },
              ];
              return (
                <div className="flex items-center gap-6">
                  {/* Donut chart (CSS) */}
                  <div className="relative w-32 h-32 shrink-0">
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        background: `conic-gradient(${items.map((item, i) => {
                          const start = items.slice(0, i).reduce((s, x) => s + x.value, 0) / total * 100;
                          const end = start + (item.value / total) * 100;
                          return `${item.color} ${start}% ${end}%`;
                        }).join(", ")})`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[70px] h-[70px] rounded-full bg-bg-card flex flex-col items-center justify-center">
                        <span className="text-xl font-bold">{total}</span>
                        <span className="text-label text-text-muted">total</span>
                      </div>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-col gap-1.5">
                    {items.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-xs text-text-secondary">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                        {item.label}
                        <span className="ml-auto font-semibold text-text-primary min-w-6 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-bg-card border border-sb-border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center px-4.5 py-3.5 border-b border-sb-border">
            <h3 className="text-md font-semibold">Recent Activity</h3>
            <span className="text-hint text-text-muted">latest</span>
          </div>
          <div className="p-4.5">
            {data.recent_activity.length === 0 ? (
              <div className="text-center py-6 text-text-muted text-sm">No activity yet</div>
            ) : (
              <div className="flex flex-col gap-2">
                {data.recent_activity.map((a, i) => {
                  const config = activityIcons[a.type] || { icon: "•", color: "text-text-muted" };
                  const timeAgo = getTimeAgo(a.created_at);
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={`text-md ${config.color}`}>{config.icon}</span>
                      <span className="text-text-secondary flex-1">
                        {a.type === "download" ? "Downloaded" : a.type === "view" ? "Viewed" : `${a.type.charAt(0).toUpperCase() + a.type.slice(1)}d`}
                        {" "}<strong>{a.article_title}</strong>
                        {a.format && ` as ${a.format}`}
                        {a.platform && ` for ${a.platform}`}
                      </span>
                      <span className="text-label text-text-muted">{timeAgo}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Placeholder for export usage */}
        <div className="bg-bg-card border border-sb-border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center px-4.5 py-3.5 border-b border-sb-border">
            <h3 className="text-md font-semibold">Export & Cross-post</h3>
            <span className="text-hint text-text-muted">usage</span>
          </div>
          <div className="p-4.5">
            {data.stats.downloads === 0 ? (
              <div className="text-center py-6 text-text-muted text-sm">No exports yet</div>
            ) : (
              <div className="text-center py-6 text-text-secondary text-sm">
                {data.stats.downloads} total downloads
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article Performance Table */}
      <div className="bg-bg-card border border-sb-border rounded-lg overflow-hidden">
        <div className="px-4.5 py-3.5 border-b border-sb-border">
          <h3 className="text-md font-semibold">Article Performance</h3>
        </div>
        {data.articles.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-sm">No published articles yet</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-2.5 text-left text-label uppercase tracking-wide text-text-muted font-medium border-b border-sb-border">Article</th>
                <th className="px-4 py-2.5 text-right text-label uppercase tracking-wide text-text-muted font-medium border-b border-sb-border">Views</th>
                <th className="px-4 py-2.5 text-right text-label uppercase tracking-wide text-text-muted font-medium border-b border-sb-border">Likes</th>
                <th className="px-4 py-2.5 text-right text-label uppercase tracking-wide text-text-muted font-medium border-b border-sb-border">Saves</th>
                <th className="px-4 py-2.5 text-right text-label uppercase tracking-wide text-text-muted font-medium border-b border-sb-border">Shares</th>
                <th className="px-4 py-2.5 text-right text-label uppercase tracking-wide text-text-muted font-medium border-b border-sb-border">Downloads</th>
              </tr>
            </thead>
            <tbody>
              {data.articles.map((a) => (
                <tr key={a.id} className="hover:bg-bg-input transition-colors">
                  <td className="px-4 py-3 border-b border-sb-border">
                    <Link href={`/p/${a.slug}`} className="font-semibold text-sm hover:text-sb-primary">
                      {a.title}
                    </Link>
                    <div className="text-label text-text-muted mt-0.5">
                      Published {new Date(a.published_at).toLocaleDateString()} · {a.word_count} words
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium tabular-nums border-b border-sb-border">{a.views}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium tabular-nums border-b border-sb-border">{a.likes}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium tabular-nums border-b border-sb-border">{a.saves}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium tabular-nums border-b border-sb-border">{a.shares}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium tabular-nums border-b border-sb-border">{a.downloads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageContainer>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
