"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/atoms/Button/Button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface MuseMessage {
  role: "user" | "assistant";
  content: string;
  action?: string;
}

interface MusePanelProps {
  articleId: string;
  isOpen: boolean;
  onClose: () => void;
  sectionId?: string | null;
  sectionTitle?: string | null;
  sectionStatus?: string | null;
  sectionWordCount?: number;
  sectionRefCount?: number;
  totalSections?: number;
  onApplyToSection?: (sectionId: string, content: string) => void;
}

const quickActions = [
  { action: "review-full", label: "Review article" },
  { action: "cohesion", label: "Check cohesion" },
  { action: "gen-title", label: "Better title" },
  { action: "transitions", label: "Improve transitions" },
];

const sectionActions = [
  { action: "draft", label: "Draft" },
  { action: "revise", label: "Revise" },
  { action: "shorten", label: "Shorten" },
  { action: "expand", label: "Expand" },
  { action: "review", label: "Review" },
  { action: "factcheck", label: "Fact check" },
];

export function MusePanel({ articleId, isOpen, onClose, sectionId, sectionTitle, sectionStatus, sectionWordCount, sectionRefCount, totalSections, onApplyToSection }: MusePanelProps) {
  const [messages, setMessages] = useState<MuseMessage[]>([
    { role: "assistant", content: "I'm Muse, your writing companion. I can see your article outline, content, and attached references.\n\nAsk me to review, revise, draft, or critique. Use the quick actions or type below." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const actionLabels: Record<string, string> = {
    draft: "Draft this section using brief + refs",
    revise: "Revise current content for clarity",
    shorten: "Shorten current content, keep key points",
    expand: "Expand current content using refs",
    rephrase: "Rephrase current content differently",
    continue: "Continue from where I stopped",
    review: "Review current content for quality",
    factcheck: "Fact-check against attached refs",
    consistency: "Check consistency across sections",
    "review-full": "Review full article",
    cohesion: "Check cohesion across sections",
    transitions: "Improve transitions between sections",
    "gen-title": "Suggest better titles",
  };

  const handleSend = () => {
    const action = selectedAction || "chat";
    const userMsg = input.trim();

    if (action === "chat" && !userMsg) return;

    sendMessage(action, userMsg || undefined);
    setSelectedAction(null);
    setInput("");
  };

  const sendMessage = async (action: string, message?: string) => {
    let displayMsg: string;
    if (action === "chat") {
      displayMsg = message || "";
    } else {
      const label = actionLabels[action] || action;
      const section = sectionTitle ? ` — § ${sectionTitle}` : "";
      displayMsg = message
        ? `[${label}${section}]\n${message}`
        : `${label}${section}`;
    }

    setMessages((prev) => [...prev, { role: "user", content: displayMsg, action }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/articles/${articleId}/muse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          section_id: sectionId,
          message: message || null,
          history: messages.filter(m => m.content !== messages[0]?.content).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err.detail}` }]);
      } else {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.response, action }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Failed to reach Muse. Check if the backend is running." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage("chat");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-85 border-l border-sb-border bg-bg-secondary flex flex-col shrink-0 h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3.5 border-b border-sb-border shrink-0">
        <h3 className="text-md font-semibold whitespace-nowrap">Muse</h3>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <button
              onClick={() => setMessages([messages[0]])}
              className="text-hint text-text-muted hover:text-sb-danger cursor-pointer bg-transparent border border-sb-border rounded px-2 py-0.5 transition-all"
              title="Clear chat history"
            >
              Clear
            </button>
          )}
          <button onClick={onClose} className="text-text-muted hover:text-text-primary cursor-pointer bg-transparent border-none text-lg">✕</button>
        </div>
      </div>

      {/* Context bar */}
      <div className="px-4 py-2 border-b border-sb-border text-hint bg-bg-input shrink-0">
        <div className="text-text-muted">
          Context: <strong className="text-text-secondary">
            {sectionTitle ? `§ ${sectionTitle}` : "Full Article"}
          </strong>
        </div>
        <div className="text-label text-text-muted mt-0.5">
          {sectionId ? (
            <>
              {sectionStatus?.replace("_", " ") || "outline"}
              {sectionWordCount ? ` · ${sectionWordCount} words` : " · empty"}
              {sectionRefCount ? ` · ${sectionRefCount} refs attached` : " · no refs"}
            </>
          ) : (
            <>{totalSections || 0} sections</>
          )}
        </div>
      </div>

      {/* Quick actions — click to select mode, then type context + send */}
      <div className="flex gap-1.5 px-4 py-2.5 border-b border-sb-border flex-wrap shrink-0">
        {(sectionId ? sectionActions : quickActions).map((qa) => (
          <button
            key={qa.action}
            onClick={() => setSelectedAction(selectedAction === qa.action ? null : qa.action)}
            disabled={loading}
            className={`px-2.5 py-1 border rounded-full text-label cursor-pointer transition-all whitespace-nowrap disabled:opacity-50
              ${selectedAction === qa.action
                ? "bg-sb-primary border-sb-primary text-white"
                : "bg-bg-card border-sb-border text-text-secondary hover:border-sb-primary hover:text-sb-primary"}`}
          >
            {qa.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`px-3.5 py-2.5 rounded-lg text-sm leading-relaxed max-w-[95%] whitespace-pre-wrap
              ${msg.role === "user"
                ? "bg-tag-bg self-end rounded-br-sm"
                : "bg-bg-input self-start rounded-bl-sm"}`}
          >
            {msg.content}

            {/* Apply button for AI responses with draft/revise actions */}
            {msg.role === "assistant" && sectionId && onApplyToSection &&
              ["draft", "revise", "shorten", "expand", "continue", "rephrase"].includes(msg.action || "") && (
              <div className="flex gap-1.5 mt-2.5 justify-end">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => onApplyToSection(sectionId, msg.content)}
                >
                  Apply to section
                </Button>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="self-start px-3.5 py-2.5 bg-bg-input rounded-lg text-sm text-text-muted flex items-center gap-2">
            <span className="inline-block w-3 h-3 border-2 border-sb-border border-t-sb-primary rounded-full animate-spin" />
            Muse is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-sb-border shrink-0">
        {selectedAction && (
          <div className="mb-2">
            <div className="flex items-center gap-2 text-hint">
              <span className="px-2 py-0.5 bg-sb-primary text-white rounded-full text-label font-medium">
                {actionLabels[selectedAction] || selectedAction}
              </span>
              <button
                onClick={() => setSelectedAction(null)}
                className="text-text-muted hover:text-sb-danger bg-transparent border-none cursor-pointer text-xs"
              >✕ cancel</button>
            </div>
            <div className="text-label text-text-muted mt-1">
              {sectionId ? (
                <>
                  on <strong className="text-text-secondary">§ {sectionTitle}</strong>
                  {["draft", "expand", "suggest-outline", "suggest-angles"].includes(selectedAction)
                    ? <> · reading brief{sectionRefCount ? ` + ${sectionRefCount} refs` : ""}</>
                    : ["shorten", "revise", "rephrase", "continue"].includes(selectedAction)
                    ? <> · editing current content ({sectionWordCount || 0} words)</>
                    : ["review", "factcheck"].includes(selectedAction)
                    ? <> · checking content{sectionRefCount ? ` against ${sectionRefCount} refs` : ""}</>
                    : null
                  }
                </>
              ) : (
                <>on <strong className="text-text-secondary">full article</strong> · {totalSections || 0} sections</>
              )}
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={selectedAction
              ? `Add context... (optional, press Enter to run)`
              : "Ask Muse about your article..."}
            disabled={loading}
            className="flex-1 px-3 py-2 bg-bg-input border border-sb-border rounded-md text-text-primary text-sm font-sans focus:outline-none focus:border-sb-primary disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || (!selectedAction && !input.trim())}
            className="px-3.5 py-2 bg-sb-primary border-none rounded-md text-white text-sm cursor-pointer transition-all hover:bg-sb-primary-hover disabled:opacity-50"
          >
            Send
          </button>
        </div>
        <div className="text-label text-text-muted mt-1.5 text-center">
          {selectedAction ? "Press Enter to run, or add context first" : "Muse sees your outline, content, and attached references"}
        </div>
      </div>
    </div>
  );
}
