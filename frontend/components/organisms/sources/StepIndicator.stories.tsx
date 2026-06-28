import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StepIndicator } from "./StepIndicator";

const meta: Meta<typeof StepIndicator> = {
  title: "Organisms/StepIndicator",
  component: StepIndicator,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof StepIndicator>;

const steps = [
  { number: 1, label: "Add Source" },
  { number: 2, label: "Summarize" },
  { number: 3, label: "Read & Note" },
];

export const Step1: Story = { args: { steps, currentStep: 1 } };
export const Step2: Story = { args: { steps, currentStep: 2 } };
export const Step3: Story = { args: { steps, currentStep: 3 } };
