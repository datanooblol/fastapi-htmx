"use client";

interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex gap-0 mb-7 border-b-2 border-sb-border">
      {steps.map((step) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;

        return (
          <button
            key={step.number}
            onClick={() => onStepClick?.(step.number)}
            className={`
              relative flex items-center gap-2 px-6 py-3 text-base cursor-pointer bg-transparent border-none transition-colors
              ${isActive ? "text-sb-primary font-semibold" : ""}
              ${isCompleted ? "text-sb-success" : ""}
              ${!isActive && !isCompleted ? "text-text-muted hover:text-text-secondary" : ""}
            `}
          >
            <span
              className={`
                w-[22px] h-[22px] rounded-full flex items-center justify-center text-hint font-bold
                ${isCompleted ? "bg-sb-success border-sb-success text-white" : "border-[1.5px] border-current"}
              `}
            >
              {isCompleted ? "✓" : step.number}
            </span>
            {step.label}
            {isActive && (
              <span className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-sb-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
