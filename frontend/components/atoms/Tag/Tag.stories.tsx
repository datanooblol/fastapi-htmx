import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tag } from "./Tag";

const meta: Meta<typeof Tag> = {
  title: "Atoms/Tag",
  component: Tag,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Tag>;

export const Default: Story = { args: { label: "AI" } };
export const Removable: Story = { args: { label: "Architecture", onRemove: () => {} } };
export const Clickable: Story = { args: { label: "Web Dev", onClick: () => {} } };
