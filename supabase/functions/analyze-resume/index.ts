// Resume analyzer edge function - uses Lovable AI Gateway with structured tool calling
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert HR recruiter, resume reviewer, and ATS system.
Analyze the given resume deeply and return structured JSON via the provided tool.
Be specific and actionable. Base everything on the actual resume content provided.`;

const TOOL = {
  type: "function",
  function: {
    name: "submit_resume_analysis",
    description: "Submit a complete structured resume analysis.",
    parameters: {
      type: "object",
      properties: {
        basic_info: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            location: { type: "string" },
            skills: { type: "array", items: { type: "string" } },
            experience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string" },
                  company: { type: "string" },
                  duration: { type: "string" },
                  highlights: { type: "array", items: { type: "string" } },
                },
                required: ["role", "company", "duration", "highlights"],
                additionalProperties: false,
              },
            },
            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  degree: { type: "string" },
                  institution: { type: "string" },
                  year: { type: "string" },
                },
                required: ["degree", "institution", "year"],
                additionalProperties: false,
              },
            },
          },
          required: ["name", "email", "phone", "location", "skills", "experience", "education"],
          additionalProperties: false,
        },
        score: {
          type: "object",
          properties: {
            overall: { type: "number", description: "0-100" },
            ats_compatibility: { type: "number" },
            clarity: { type: "number" },
            impact: { type: "number" },
            keyword_optimization: { type: "number" },
          },
          required: ["overall", "ats_compatibility", "clarity", "impact", "keyword_optimization"],
          additionalProperties: false,
        },
        issues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: ["grammar", "weak_bullets", "missing_keywords", "formatting", "quantification"],
              },
              description: { type: "string" },
              severity: { type: "string", enum: ["low", "medium", "high"] },
            },
            required: ["category", "description", "severity"],
            additionalProperties: false,
          },
        },
        improvements: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["rewrite", "keyword", "formatting"] },
              original: { type: "string" },
              suggestion: { type: "string" },
            },
            required: ["type", "original", "suggestion"],
            additionalProperties: false,
          },
        },
        hr_summary: { type: "string", description: "4-5 line professional summary" },
        role_match: {
          type: "array",
          items: {
            type: "object",
            properties: {
              role: { type: "string" },
              match_percentage: { type: "number" },
              reason: { type: "string" },
            },
            required: ["role", "match_percentage", "reason"],
            additionalProperties: false,
          },
        },
        ats_tips: { type: "array", items: { type: "string" } },
      },
      required: ["basic_info", "score", "issues", "improvements", "hr_summary", "role_match", "ats_tips"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText } = await req.json();
    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 50) {
      return new Response(JSON.stringify({ error: "Resume text is too short or missing." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analyze this resume:\n\n${resumeText.slice(0, 15000)}` },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "submit_resume_analysis" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI did not return structured output" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-resume error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
