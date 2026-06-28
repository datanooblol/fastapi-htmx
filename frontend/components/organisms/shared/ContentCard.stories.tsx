import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ContentCard } from "./ContentCard";

const meta: Meta<typeof ContentCard> = {
  title: "Organisms/ContentCard",
  component: ContentCard,
  tags: ["autodocs"],
  argTypes: {
    viewMode: { control: "radio", options: ["list", "card"] },
  },
};
export default meta;

type Story = StoryObj<typeof ContentCard>;

export const NoteListView: Story = {
  args: {
    id: "1",
    title: "Attention mechanism details",
    typeBadge: { label: "note", variant: "note" },
    meta: "from: transformer-paper.pdf · 6/28/2026 · 89 words · 3 connections",
    preview: "Multi-head attention runs several attention operations in parallel, each learning different relationship patterns.",
    tags: ["AI", "Architecture"],
    viewMode: "list",
    actions: [
      { label: "Open", href: "#" },
      { label: "Synapse" },
      { label: "Delete", variant: "danger" },
    ],
  },
};

export const NoteCardView: Story = {
  args: {
    ...NoteListView.args,
    viewMode: "card",
  },
};

export const SourceListView: Story = {
  args: {
    id: "2",
    title: "transformer-paper.pdf",
    typeBadge: { label: "source", variant: "source" },
    meta: "PDF upload · 6/28/2026 · 1247 words",
    preview: "Attention Is All You Need — Vaswani et al., 2017. Original paper introducing the Transformer architecture.",
    tags: ["AI", "Research"],
    viewMode: "list",
    actions: [{ label: "Open", href: "#" }],
  },
};

export const SummaryCardView: Story = {
  args: {
    id: "3",
    title: "Default Summary — Transformer Paper",
    typeBadge: { label: "summary", variant: "summary" },
    meta: "from: transformer-paper.pdf · 6/28/2026 · 502 words",
    preview: "The Transformer architecture replaced RNN/CNN-based models with a pure attention mechanism.",
    viewMode: "card",
    actions: [{ label: "Open", href: "#" }],
  },
};

export const ArticleWithProgress: Story = {
  args: {
    id: "4",
    title: "Understanding Attention Mechanisms",
    subtitle: "How self-attention replaced recurrence",
    statusBadge: { label: "draft", color: "" },
    meta: "Last edited 6/28/2026 · 4 sections · ~230 words",
    progress: {
      dots: ["written", "ai_drafted", "outline", "outline"] as ("outline" | "writing" | "written" | "ai_drafted")[],
      label: "1 / 4 written",
      percent: 25,
    },
    viewMode: "list",
    actions: [
      { label: "Edit", href: "#" },
      { label: "Delete", variant: "danger" },
    ],
  },
};

export const ArticlePublished: Story = {
  args: {
    id: "5",
    title: "Getting Started with DuckDB",
    statusBadge: { label: "published", color: "" },
    meta: "Published 6/20/2026 · 3 sections · 980 words",
    progress: {
      dots: ["written", "written", "written"] as ("written")[],
      label: "3 / 3 written",
      percent: 100,
    },
    viewMode: "card",
    actions: [
      { label: "Edit", href: "#" },
      { label: "View", href: "#" },
    ],
  },
};

export const Selected: Story = {
  args: {
    ...NoteListView.args,
    selected: true,
    onSelect: () => {},
  },
};
