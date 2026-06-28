import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "danger", "success"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary", children: "Save Source" } };
export const Secondary: Story = { args: { variant: "secondary", children: "Cancel" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Skip" } };
export const Danger: Story = { args: { variant: "danger", children: "Delete" } };
export const Success: Story = { args: { variant: "success", children: "Publish" } };
export const Loading: Story = { args: { variant: "primary", loading: true, children: "Summarizing..." } };
export const Disabled: Story = { args: { variant: "primary", disabled: true, children: "Disabled" } };
export const Small: Story = { args: { variant: "primary", size: "sm", children: "Small" } };
export const Large: Story = { args: { variant: "success", size: "lg", children: "Publish Now →" } };
