import { ResumeAnalysis } from "@/types/analysis";
import { ScoreRing } from "./ScoreRing";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Sparkles,
  Target,
  CheckCircle2,
  User,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Mail,
  Phone,
  MapPin,
  Code2,
} from "lucide-react";

const sevColor = (s: string) =>
  s === "high" ? "text-destructive" : s === "medium" ? "text-[hsl(var(--warning))]" : "text-muted-foreground";

const Bar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between text-xs mb-1.5">
      <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="font-mono text-primary font-semibold">{value}</span>
    </div>
    <Progress value={value} className="h-1.5" />
  </div>
);

interface DashboardProps {
  data: ResumeAnalysis;
  overrideOverall?: number;
}

export const AnalysisDashboard = ({ data, overrideOverall }: DashboardProps) => {
  const { basic_info, score, issues, improvements, hr_summary, role_match, ats_tips } = data;
  const overall = overrideOverall ?? score.overall;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header: Identity + Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card p-8 lg:col-span-2">
          <div className="flex items-start gap-3 mb-2">
            <User className="h-5 w-5 text-primary mt-1" />
            <div>
              <h2 className="text-3xl font-bold">{basic_info.name || "Candidate"}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                {basic_info.email && (
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{basic_info.email}</span>
                )}
                {basic_info.phone && (
                  <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{basic_info.phone}</span>
                )}
                {basic_info.location && (
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{basic_info.location}</span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 p-5 rounded-xl bg-muted/40 border border-border/50">
            <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">HR Summary</div>
            <p className="text-foreground/90 leading-relaxed">{hr_summary}</p>
          </div>
        </Card>

        <Card className="glass-card p-6 flex flex-col items-center justify-center glow-primary">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Overall Score</div>
          <ScoreRing value={overall} label="/ 100" />
          <div className="w-full mt-6 space-y-3">
            <Bar label="ATS" value={score.ats_compatibility} />
            <Bar label="Clarity" value={score.clarity} />
            <Bar label="Impact" value={score.impact} />
            <Bar label="Keywords" value={score.keyword_optimization} />
          </div>
        </Card>
      </div>

      {/* Skills */}
      {basic_info.skills?.length > 0 && (
        <Card className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="h-4 w-4 text-primary" />
            <h3 className="font-semibold uppercase tracking-wider text-sm">Skills Detected</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {basic_info.skills.map((s, i) => (
              <Badge key={i} variant="secondary" className="font-mono text-xs">
                {s}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Issues + Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
            <h3 className="font-semibold uppercase tracking-wider text-sm">Issues Identified</h3>
            <Badge variant="outline" className="ml-auto font-mono">{issues.length}</Badge>
          </div>
          <div className="space-y-3">
            {issues.map((iss, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-mono uppercase ${sevColor(iss.severity)}`}>
                    ● {iss.severity}
                  </span>
                  <span className="text-xs text-muted-foreground">{iss.category.replace(/_/g, " ")}</span>
                </div>
                <p className="text-sm text-foreground/90">{iss.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold uppercase tracking-wider text-sm">Suggested Improvements</h3>
          </div>
          <div className="space-y-4">
            {improvements.map((imp, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <Badge variant="outline" className="text-xs mb-2">{imp.type}</Badge>
                {imp.original && (
                  <div className="text-xs text-muted-foreground line-through mb-1.5">{imp.original}</div>
                )}
                <div className="text-sm text-primary font-medium">→ {imp.suggestion}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Role Match */}
      <Card className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="font-semibold uppercase tracking-wider text-sm">Best Role Matches</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {role_match.map((r, i) => (
            <div key={i} className="p-5 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-baseline justify-between mb-3">
                <span className="font-semibold">{r.role}</span>
                <span className="font-mono text-2xl text-primary">{r.match_percentage}%</span>
              </div>
              <Progress value={r.match_percentage} className="h-1.5 mb-3" />
              <p className="text-xs text-muted-foreground leading-relaxed">{r.reason}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Experience + Education */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Briefcase className="h-4 w-4 text-primary" />
            <h3 className="font-semibold uppercase tracking-wider text-sm">Experience</h3>
          </div>
          <div className="space-y-5">
            {basic_info.experience.map((e, i) => (
              <div key={i} className="border-l-2 border-primary/40 pl-4">
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <span className="font-semibold">{e.role}</span>
                  <span className="text-xs font-mono text-muted-foreground">{e.duration}</span>
                </div>
                <div className="text-sm text-primary mb-2">{e.company}</div>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  {e.highlights.slice(0, 3).map((h, j) => <li key={j}>{h}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <GraduationCap className="h-4 w-4 text-primary" />
            <h3 className="font-semibold uppercase tracking-wider text-sm">Education</h3>
          </div>
          <div className="space-y-4">
            {basic_info.education.map((ed, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="font-semibold">{ed.degree}</div>
                <div className="text-sm text-primary">{ed.institution}</div>
                <div className="text-xs text-muted-foreground font-mono mt-1">{ed.year}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ATS Tips */}
      <Card className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h3 className="font-semibold uppercase tracking-wider text-sm">ATS Optimization Tips</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ats_tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground/90">{tip}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
