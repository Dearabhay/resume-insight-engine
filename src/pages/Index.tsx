import { useState, useRef } from "react";
import { Upload, FileText, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { parseResumeFile } from "@/lib/resume-parser";
import { supabase } from "@/integrations/supabase/client";
import { ResumeAnalysis } from "@/types/analysis";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<string>("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const f = files[0];
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB.");
      return;
    }
    setFile(f);
    setAnalysis(null);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setAnalysis(null);
    try {
      setStage("Extracting text from resume...");
      const text = await parseResumeFile(file);
      if (text.length < 50) throw new Error("Could not extract enough text from resume.");

      setStage("Running AI analysis...");
      const { data, error } = await supabase.functions.invoke("analyze-resume", {
        body: { resumeText: text },
      });

      if (error) {
        // Try to surface server error message
        const msg = (data as any)?.error || error.message || "Analysis failed";
        if (msg.includes("Rate limit")) toast.error("Rate limit reached. Please wait a moment.");
        else if (msg.includes("credits")) toast.error("AI credits exhausted. Please add funds.");
        else toast.error(msg);
        return;
      }
      if (!data?.analysis) {
        toast.error("No analysis returned.");
        return;
      }
      setAnalysis(data.analysis);
      toast.success("Analysis complete");
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
      setStage("");
    }
  };

  return (
    <main className="min-h-screen px-4 py-10 md:px-10 md:py-16 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center glow-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Resume.AI</h1>
            <p className="text-xs text-muted-foreground font-mono">ATS · HR · Recruiter Lens</p>
          </div>
        </div>
        <span className="text-xs font-mono text-muted-foreground px-3 py-1 rounded-full border border-border">
          v1.0 · BETA
        </span>
      </header>

      {!analysis && (
        <section className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-5">
            Decode your resume <span className="text-gradient-accent">like a recruiter</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Deep AI analysis: ATS score, weak bullet rewrites, role-fit matching, and HR-ready summary in seconds.
          </p>
        </section>
      )}

      {!analysis && (
        <section className="max-w-2xl mx-auto">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`glass-card rounded-2xl p-12 text-center cursor-pointer transition-all ${
              dragOver ? "border-primary scale-[1.01] glow-primary" : "hover:border-primary/60"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {!file ? (
              <>
                <div className="h-16 w-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-5">
                  <Upload className="h-7 w-7 text-primary" />
                </div>
                <p className="font-semibold text-lg mb-1">Drop your resume here</p>
                <p className="text-sm text-muted-foreground font-mono">PDF · DOCX · TXT · max 10MB</p>
              </>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <span className="font-medium">{file.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <Button
            onClick={analyze}
            disabled={!file || loading}
            size="lg"
            className="w-full mt-6 h-14 text-base font-semibold glow-primary"
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> {stage || "Analyzing..."}</>
            ) : (
              <><Sparkles className="h-5 w-5 mr-2" /> Analyze Resume</>
            )}
          </Button>
        </section>
      )}

      {analysis && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Analysis for</p>
              <p className="font-mono text-sm">{file?.name}</p>
            </div>
            <Button variant="outline" onClick={() => { setAnalysis(null); setFile(null); }}>
              Analyze another
            </Button>
          </div>
          <AnalysisDashboard data={analysis} />
        </section>
      )}
    </main>
  );
};

export default Index;
