// Detect if a keyword (or close variant) appears in resume text.
// Returns { found, snippet } where snippet is a small context string when found.

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#\.\s-]/g, " ").replace(/\s+/g, " ").trim();

function tokenize(s: string): string[] {
  return normalize(s).split(" ").filter(Boolean);
}

export function findKeyword(text: string, keyword: string): { found: boolean; snippet?: string } {
  const hay = normalize(text);
  const needle = normalize(keyword);
  if (!needle) return { found: false };

  // 1. Exact phrase match
  const idx = hay.indexOf(needle);
  if (idx !== -1) {
    const start = Math.max(0, idx - 40);
    const end = Math.min(hay.length, idx + needle.length + 40);
    return { found: true, snippet: "…" + hay.slice(start, end) + "…" };
  }

  // 2. All tokens present (fuzzy multi-word)
  const tokens = tokenize(needle);
  if (tokens.length > 1 && tokens.every((t) => t.length > 2 && hay.includes(t))) {
    return { found: true, snippet: `partial match: ${tokens.join(" + ")}` };
  }

  // 3. Stem-ish: strip trailing s/ing/ed
  const stem = needle.replace(/(ing|ed|s)$/, "");
  if (stem.length > 3 && hay.includes(stem)) {
    return { found: true, snippet: `variant of "${stem}"` };
  }

  return { found: false };
}

export function extractMissingKeywords(
  improvements: { type: string; original: string; suggestion: string }[]
): string[] {
  return improvements
    .filter((i) => i.type === "keyword")
    .map((i) => i.suggestion.replace(/^(add|consider|include)\s+/i, "").replace(/[\.,;].*$/, "").trim())
    .filter(Boolean);
}
