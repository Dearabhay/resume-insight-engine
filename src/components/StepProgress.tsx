import { Check, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type Step = { id: string; label: string };
export type StepState = "pending" | "active" | "done";

interface Props {
  steps: Step[];
  currentIndex: number; // -1 idle, length = all done
}

export const StepProgress = ({ steps, currentIndex }: Props) => {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-3">
      {steps.map((step, i) => {
        const state: StepState = i < currentIndex ? "done" : i === currentIndex ? "active" : "pending";
        return (
          <div key={step.id} className="flex items-center gap-3">
            <div
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center border transition-all",
                state === "done" && "bg-primary border-primary text-primary-foreground",
                state === "active" && "border-primary text-primary glow-primary",
                state === "pending" && "border-border text-muted-foreground"
              )}
            >
              {state === "done" && <Check className="h-4 w-4" />}
              {state === "active" && <Loader2 className="h-4 w-4 animate-spin" />}
              {state === "pending" && <Circle className="h-3 w-3" />}
            </div>
            <span
              className={cn(
                "text-sm font-mono uppercase tracking-wider",
                state === "active" && "text-primary",
                state === "done" && "text-foreground",
                state === "pending" && "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
            {state === "active" && (
              <span className="ml-auto text-xs text-muted-foreground animate-pulse">processing...</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
