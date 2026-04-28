import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Use bundled worker via Vite ?url import
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export async function parseResumeFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const buf = await file.arrayBuffer();

  if (name.endsWith(".pdf")) {
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it: any) => it.str).join(" ") + "\n\n";
    }
    return text.trim();
  }

  if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value.trim();
  }

  if (name.endsWith(".txt")) {
    return new TextDecoder().decode(buf).trim();
  }

  throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
}
