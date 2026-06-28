import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatCard } from "./StatCard";

const meta: Meta<typeof StatCard> = {
  title: "Molecules/StatCard",
  component: StatCard,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof StatCard>;

export const Default: Story = { args: { label: "Total Notes", value: 12 } };
export const WithChangeUp: Story = { args: { label: "Total Views", value: 142, change: "+22 this week", changeDirection: "up" } };
export const WithChangeDown: Story = { args: { label: "Shares", value: 3, change: "-2 this week", changeDirection: "down" } };
export const Zero: Story = { args: { label: "Connections", value: 0 } };
