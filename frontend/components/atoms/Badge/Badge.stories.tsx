import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Note: Story = { args: { variant: "note", children: "Note" } };
export const Source: Story = { args: { variant: "source", children: "Source" } };
export const Summary: Story = { args: { variant: "summary", children: "Summary" } };
export const Article: Story = { args: { variant: "article", children: "Article" } };
export const Concept: Story = { args: { variant: "concept", children: "Concept" } };
export const Default: Story = { args: { variant: "default", children: "Default" } };
