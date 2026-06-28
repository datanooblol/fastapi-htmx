import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ConnectionCard } from "./ConnectionCard";

const meta: Meta<typeof ConnectionCard> = {
  title: "Organisms/ConnectionCard",
  component: ConnectionCard,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof ConnectionCard>;

const baseSuggestion = {
  node_a_id: "a1",
  node_a_type: "note" as const,
  node_b_id: "b1",
  node_b_type: "note" as const,
  node_b_title: "RNN Limitations in Long Sequences",
  relationship_type: "problem → solution",
  reason: "The attention mechanism directly addresses the vanishing gradient problem described in this note.",
  already_connected: false,
};

export const Strong: Story = {
  args: {
    focusTitle: "Attention mechanism details",
    suggestion: { ...baseSuggestion, strength: "strong" },
    status: "pending",
  },
};

export const Moderate: Story = {
  args: {
    focusTitle: "Attention mechanism details",
    suggestion: { ...baseSuggestion, strength: "moderate", node_b_title: "BERT Pre-training", relationship_type: "prerequisite → application" },
    status: "pending",
  },
};

export const Weak: Story = {
  args: {
    focusTitle: "Attention mechanism details",
    suggestion: { ...baseSuggestion, strength: "weak", node_b_title: "GPU Memory Optimization", relationship_type: "practical consideration" },
    status: "pending",
  },
};

export const Accepted: Story = {
  args: {
    focusTitle: "Attention mechanism details",
    suggestion: { ...baseSuggestion, strength: "strong" },
    status: "accepted",
  },
};

export const Rejected: Story = {
  args: {
    focusTitle: "Attention mechanism details",
    suggestion: { ...baseSuggestion, strength: "moderate" },
    status: "rejected",
  },
};

export const AlreadyConnected: Story = {
  args: {
    focusTitle: "Attention mechanism details",
    suggestion: { ...baseSuggestion, strength: "strong", already_connected: true },
  },
};
