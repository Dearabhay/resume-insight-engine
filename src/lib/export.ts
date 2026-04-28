import { jsPDF } from "jspdf";
import { ResumeAnalysis } from "@/types/analysis";

export function downloadJSON(analysis: ResumeAnalysis, filename = "resume-analysis.json") {
  const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPDF(analysis: ResumeAnalysis, overall: number, filename = "resume-analysis.pdf") {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;

  const ensure = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const text = (str: string, opts: { size?: number; bold?: boolean; color?: [number, number, number]; gap?: number } = {}) => {
    const size = opts.size ?? 10;
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opts.color ?? [30, 30, 35]));
    const lines = doc.splitTextToSize(str, contentW);
    ensure(lines.length * size * 1.25);
    doc.text(lines, margin, y);
    y += lines.length * size * 1.25 + (opts.gap ?? 4);
  };

  const rule = () => {
    ensure(8);
    doc.setDrawColor(220);
    doc.line(margin, y, pageW - margin, y);
    y += 12;
  };

  const section = (title: string) => {
    ensure(28);
    y += 8;
    doc.setFillColor(30, 30, 40);
    doc.rect(margin, y - 12, 4, 16, "F");
    text(title.toUpperCase(), { size: 11, bold: true, color: [30, 30, 40], gap: 6 });
  };

  // Header
  doc.setFillColor(20, 22, 32);
  doc.rect(0, 0, pageW, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Resume Analysis Report", margin, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(180, 180, 195);
  doc.text(`Generated ${new Date().toLocaleDateString()}`, margin, 60);

  // Overall score badge
  doc.setFillColor(180, 230, 80);
  doc.roundedRect(pageW - margin - 90, 22, 90, 40, 6, 6, "F");
  doc.setTextColor(20, 22, 32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(`${overall}`, pageW - margin - 70, 50);
  doc.setFontSize(8);
  doc.text("OVERALL / 100", pageW - margin - 70, 60);

  y = 110;

  // Basic info
  text(analysis.basic_info.name || "Candidate", { size: 16, bold: true, gap: 2 });
  const contact = [analysis.basic_info.email, analysis.basic_info.phone, analysis.basic_info.location]
    .filter(Boolean)
    .join("  •  ");
  if (contact) text(contact, { size: 9, color: [110, 110, 120], gap: 8 });

  rule();

  // Score breakdown
  section("Score Breakdown");
  const s = analysis.score;
  text(`ATS Compatibility: ${s.ats_compatibility}     Clarity: ${s.clarity}     Impact: ${s.impact}     Keywords: ${s.keyword_optimization}`, { size: 10, gap: 8 });

  // HR Summary
  section("HR Summary");
  text(analysis.hr_summary, { size: 10, gap: 8 });

  // Skills
  if (analysis.basic_info.skills?.length) {
    section("Skills");
    text(analysis.basic_info.skills.join(" • "), { size: 9, color: [70, 70, 90], gap: 8 });
  }

  // Experience
  if (analysis.basic_info.experience?.length) {
    section("Experience");
    analysis.basic_info.experience.forEach((e) => {
      text(`${e.role} — ${e.company}`, { size: 11, bold: true, gap: 2 });
      text(e.duration, { size: 9, color: [110, 110, 120], gap: 4 });
      e.highlights.forEach((h) => text(`• ${h}`, { size: 10, gap: 2 }));
      y += 4;
    });
  }

  // Education
  if (analysis.basic_info.education?.length) {
    section("Education");
    analysis.basic_info.education.forEach((ed) => {
      text(`${ed.degree} — ${ed.institution} (${ed.year})`, { size: 10, gap: 4 });
    });
  }

  // Issues
  if (analysis.issues?.length) {
    section("Issues Identified");
    analysis.issues.forEach((i) => {
      text(`[${i.severity.toUpperCase()}] ${i.category.replace(/_/g, " ")}: ${i.description}`, { size: 10, gap: 4 });
    });
  }

  // Improvements
  if (analysis.improvements?.length) {
    section("Suggested Improvements");
    analysis.improvements.forEach((imp) => {
      if (imp.original) text(`Original: ${imp.original}`, { size: 9, color: [140, 60, 60], gap: 2 });
      text(`→ ${imp.suggestion}`, { size: 10, bold: true, gap: 6 });
    });
  }

  // Role Match
  if (analysis.role_match?.length) {
    section("Role Fit");
    analysis.role_match.forEach((r) => {
      text(`${r.role} — ${r.match_percentage}%`, { size: 11, bold: true, gap: 2 });
      text(r.reason, { size: 9, color: [90, 90, 105], gap: 6 });
    });
  }

  // ATS Tips
  if (analysis.ats_tips?.length) {
    section("ATS Optimization Tips");
    analysis.ats_tips.forEach((t) => text(`• ${t}`, { size: 10, gap: 2 }));
  }

  doc.save(filename);
}
