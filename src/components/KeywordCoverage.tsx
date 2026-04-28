import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Search } from "lucide-react";
import { findKeyword, extractMissingKeywords } from "@/lib/keyword-match";
import { ResumeAnalysis } from "@/types/analysis";

interface Props {
  analysis: ResumeAnalysis;
  resumeText: string;
}

export const KeywordCoverage = ({ analysis, resumeText }: Props) => {
  // Combine: skills + AI-suggested keyword improvements
  const candidates = Array.from(
    new Set([
      ...extractMissingKeywords(analysis.improvements),
      ...analysis.basic_info.skills.slice(0, 12),
    ])
  ).filter((k) => k.length > 1);

  const checked = candidates.map((kw) => ({ kw, ...findKeyword(resumeText, kw) }));
  const present = checked.filter((c) => c.found);
  const missing = checked.filter((c) => !c.found);

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Search className="h-4 w-4 text-primary" />
        <h3 className="font-semibold uppercase tracking-wider text-sm">Keyword Coverage</h3>
        <Badge variant="outline" className="ml-auto font-mono text-xs">
          {present.length}/{checked.length} present
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-[hsl(var(--success))] font-semibold mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Found in resume ({present.length})
          </div>
          {present.length === 0 ? (
            <p className="text-xs text-muted-foreground">No matches detected.</p>
          ) : (
            <div className="space-y-2">
              {present.map((c, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30 hover:bg-[hsl(var(--success))]/15">
                      {c.kw}
                    </Badge>
                  </div>
                  {c.snippet && (
                    <div className="text-xs text-muted-foreground font-mono mt-2 italic break-words">
                      {c.snippet}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-destructive font-semibold mb-3 flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5" /> Missing — consider adding ({missing.length})
          </div>
          {missing.length === 0 ? (
            <p className="text-xs text-muted-foreground">Great coverage — nothing flagged as missing.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {missing.map((c, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="border-destructive/40 text-destructive bg-destructive/10"
                >
                  {c.kw}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
