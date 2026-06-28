import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ViewToggle } from "./ViewToggle";

const meta: Meta<typeof ViewToggle> = {
  title: "Organisms/ViewToggle",
  component: ViewToggle,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof ViewToggle>;

export const ListView: Story = { args: { mode: "list", onChange: () => {} } };
export const CardView: Story = { args: { mode: "card", onChange: () => {} } };
