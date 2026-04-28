import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Weights } from "@/lib/scoring";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_WEIGHTS } from "@/lib/scoring";

interface Props {
  weights: Weights;
  onChange: (w: Weights) => void;
}

const KEYS: { key: keyof Weights; label: string }[] = [
  { key: "ats_compatibility", label: "ATS Compatibility" },
  { key: "clarity", label: "Clarity" },
  { key: "impact", label: "Impact" },
  { key: "keyword_optimization", label: "Keyword Optimization" },
];

export const WeightTuner = ({ weights, onChange }: Props) => {
  const total = KEYS.reduce((sum, k) => sum + weights[k.key], 0);

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <SlidersHorizontal className="h-4 w-4 text-primary" />
        <h3 className="font-semibold uppercase tracking-wider text-sm">Score Weights</h3>
        <span className="ml-auto text-xs font-mono text-muted-foreground">
          weights normalized · sum {total}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(DEFAULT_WEIGHTS)}
          className="h-7 px-2 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" /> Reset
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {KEYS.map(({ key, label }) => {
          const v = weights[key];
          const pct = total > 0 ? Math.round((v / total) * 100) : 0;
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
                <span className="font-mono text-primary">{v} <span className="text-muted-foreground">({pct}%)</span></span>
              </div>
              <Slider
                value={[v]}
                min={0}
                max={50}
                step={1}
                onValueChange={(val) => onChange({ ...weights, [key]: val[0] })}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
};
