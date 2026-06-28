import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusDot } from "./StatusDot";

const meta: Meta<typeof StatusDot> = {
  title: "Atoms/StatusDot",
  component: StatusDot,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof StatusDot>;

export const Outline: Story = { args: { status: "outline" } };
export const Writing: Story = { args: { status: "writing" } };
export const Written: Story = { args: { status: "written" } };
export const AIDrafted: Story = { args: { status: "ai_drafted" } };

export const AllStates: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <StatusDot status="outline" /> Outline
      <StatusDot status="writing" /> Writing
      <StatusDot status="written" /> Written
      <StatusDot status="ai_drafted" /> AI Drafted
    </div>
  ),
};
