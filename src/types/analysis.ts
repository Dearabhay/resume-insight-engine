export interface ResumeAnalysis {
  basic_info: {
    name: string;
    email: string;
    phone: string;
    location: string;
    skills: string[];
    experience: { role: string; company: string; duration: string; highlights: string[] }[];
    education: { degree: string; institution: string; year: string }[];
  };
  score: {
    overall: number;
    ats_compatibility: number;
    clarity: number;
    impact: number;
    keyword_optimization: number;
  };
  issues: { category: string; description: string; severity: "low" | "medium" | "high" }[];
  improvements: { type: string; original: string; suggestion: string }[];
  hr_summary: string;
  role_match: { role: string; match_percentage: number; reason: string }[];
  ats_tips: string[];
}
