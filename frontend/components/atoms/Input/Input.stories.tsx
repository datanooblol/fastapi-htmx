import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = { args: { placeholder: "What is this about?" } };
export const WithValue: Story = { args: { value: "Transformer Architecture", readOnly: true } };
export const Error: Story = { args: { placeholder: "Title", error: "Title is required" } };
export const Disabled: Story = { args: { placeholder: "Disabled", disabled: true } };
