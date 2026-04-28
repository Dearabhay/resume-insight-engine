import { ResumeAnalysis } from "@/types/analysis";

export type Weights = {
  ats_compatibility: number;
  clarity: number;
  impact: number;
  keyword_optimization: number;
};

export const DEFAULT_WEIGHTS: Weights = {
  ats_compatibility: 25,
  clarity: 25,
  impact: 25,
  keyword_optimization: 25,
};

export function computeOverall(score: ResumeAnalysis["score"], w: Weights): number {
  const total = w.ats_compatibility + w.clarity + w.impact + w.keyword_optimization;
  if (total === 0) return 0;
  const sum =
    score.ats_compatibility * w.ats_compatibility +
    score.clarity * w.clarity +
    score.impact * w.impact +
    score.keyword_optimization * w.keyword_optimization;
  return Math.round(sum / total);
}
