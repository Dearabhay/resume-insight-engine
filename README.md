<div align="center">

<h1>🧠 Resume Insight Engine</h1>

<p><strong>AI-powered resume analyzer that decodes your resume like a recruiter.</strong><br/>
ATS scoring · Bullet rewrites · Role-fit matching · HR-ready summary — in seconds.</p>

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Edge%20Functions-3ECF8E?logo=supabase&logoColor=white&style=flat-square)](https://supabase.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?logo=google&logoColor=white&style=flat-square)](https://deepmind.google/technologies/gemini)

<!-- Replace with your actual deployed URL -->
**[🚀 Live Demo](https://your-deployment-url.vercel.app)** &nbsp;|&nbsp; **[📁 Source Code](https://github.com/Dearabhay/resume-insight-engine)**

</div>

---

## 📸 Preview

> *(Add a screenshot or GIF of the app here — drag & drop into GitHub)*

---

## ✨ Features

- **📄 Multi-format Upload** — Drag & drop PDF, DOCX, or TXT resumes (up to 10MB). Parsing runs 100% in-browser — no resume data is sent to any server before AI analysis.
- **🤖 AI Analysis via Gemini 2.5 Flash** — Structured resume analysis using Google Gemini with strict JSON tool-calling schema for reliable, consistent output.
- **📊 4-Axis Scoring** — Scored across ATS Compatibility, Clarity, Impact, and Keyword Optimization (each 0–100).
- **⚖️ Adjustable Score Weights** — Tune how much each axis contributes to the overall score using interactive sliders.
- **🎯 Role-Fit Matching** — AI suggests best-fit job roles with match percentage and reasoning based on actual resume content.
- **🔍 Keyword Coverage Map** — Highlights which keywords are found in the resume vs. which ones are missing and should be added.
- **✍️ Bullet Rewrites** — AI suggests improved versions of weak experience bullets with before/after comparison.
- **🧾 HR Summary** — Generates a 4–5 line professional summary written from a recruiter's perspective.
- **📥 Export** — Download the full analysis as a formatted PDF report or raw JSON.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI Components | ShadCN UI + Radix UI + Tailwind CSS |
| Resume Parsing | `pdfjs-dist` (PDF) · `mammoth` (DOCX) |
| Backend | Supabase Edge Functions (Deno) |
| AI Model | Google Gemini 2.5 Flash via AI Gateway |
| State Management | React hooks + TanStack Query |
| Export | jsPDF (PDF) + Blob API (JSON) |

---

## 🏗️ Architecture

```
Browser
 ├── Resume file dropped / selected
 ├── Client-side text extraction (pdfjs / mammoth)
 └── Text sent to Supabase Edge Function
         └── Edge Function → Gemini 2.5 Flash (tool calling)
                  └── Structured JSON analysis returned
                           └── Rendered in React dashboard
```

**No raw resume text is stored** — analysis happens in-memory and the Edge Function processes text on-the-fly.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Google AI API key (Gemini)

### 1. Clone the repo

```bash
git clone https://github.com/Dearabhay/resume-insight-engine.git
cd resume-insight-engine
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

In your Supabase project dashboard, add this secret under **Edge Function Secrets**:

```
LOVABLE_API_KEY=your_ai_gateway_key
```

### 4. Run locally

```bash
npm run dev
```

Open `http://localhost:8080` in your browser.

---

## 📂 Project Structure

```
resume-insight-engine/
├── src/
│   ├── components/
│   │   ├── AnalysisDashboard.tsx   # Main analysis results UI
│   │   ├── KeywordCoverage.tsx     # Keyword found/missing view
│   │   ├── ScoreRing.tsx           # Animated circular score ring
│   │   ├── StepProgress.tsx        # Analysis step tracker
│   │   └── WeightTuner.tsx         # Score weight sliders
│   ├── lib/
│   │   ├── resume-parser.ts        # PDF/DOCX/TXT extraction (client-side)
│   │   ├── keyword-match.ts        # Keyword fuzzy matching logic
│   │   ├── scoring.ts              # Weighted score computation
│   │   └── export.ts               # PDF & JSON export utilities
│   ├── types/
│   │   └── analysis.ts             # TypeScript interfaces for AI response
│   └── pages/
│       └── Index.tsx               # Main page with upload + analysis flow
└── supabase/
    └── functions/
        └── analyze-resume/
            └── index.ts            # Deno Edge Function — AI call handler
```

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `pdfjs-dist` | In-browser PDF text extraction |
| `mammoth` | DOCX → plain text extraction |
| `jspdf` | PDF report generation |
| `@supabase/supabase-js` | Supabase client + Edge Function invocation |
| `@tanstack/react-query` | Server state management |
| `recharts` | Charts & data visualization |
| `zod` | Runtime schema validation |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 👤 Author

**Abhay Kumar**
- GitHub: [@Dearabhay](https://github.com/Dearabhay)
- LinkedIn: [linkedin.com/in/dearabhaykumar](https://linkedin.com/in/dearabhaykumar)
- Portfolio: [dearabhay.vercel.app](https://dearabhay.vercel.app)

---

<div align="center">
<sub>Built with ❤️ using React + Supabase + Gemini AI</sub>
</div>
