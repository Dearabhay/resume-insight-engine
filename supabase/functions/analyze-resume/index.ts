// Resume analyzer edge function — powered by Anthropic Claude API (claude-haiku-4-5)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert HR recruiter, resume reviewer, and ATS system.
Analyze the given resume deeply and return structured JSON via the provided tool.
Be specific and actionable. Base everything on the actual resume content provided.`;

// Claude API tool definition (same schema, just different API format)
const TOOL = {
  name: "submit_resume_analysis",
  description: "Submit a complete structured resume analysis.",
  input_schema: {
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
            },
          },
        },
        required: ["name", "email", "phone", "location", "skills", "experience", "education"],
      },
      score: {
        type: "object",
        properties: {
          overall: { type: "number", description: "0-100" },
          ats_compatibility: { type: "number", description: "0-100" },
          clarity: { type: "number", description: "0-100" },
          impact: { type: "number", description: "0-100" },
          keyword_optimization: { type: "number", description: "0-100" },
        },
        required: ["overall", "ats_compatibility", "clarity", "impact", "keyword_optimization"],
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
        },
      },
      hr_summary: { type: "string", description: "4-5 line professional summary from recruiter perspective" },
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
        },
      },
      ats_tips: { type: "array", items: { type: "string" } },
    },
    required: ["basic_info", "score", "issues", "improvements", "hr_summary", "role_match", "ats_tips"],
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

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set in Supabase secrets.");

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: [TOOL],
        tool_choice: { type: "tool", name: "submit_resume_analysis" },
        messages: [
          {
            role: "user",
            content: `Analyze this resume:\n\n${resumeText.slice(0, 15000)}`,
          },
        ],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Claude API error:", resp.status, errText);

      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 401) {
        return new Response(JSON.stringify({ error: "Invalid API key. Check ANTHROPIC_API_KEY in Supabase secrets." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: `Claude API error: ${resp.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();

    // Claude returns tool_use block in content array
    const toolUseBlock = data.content?.find(
      (block: { type: string }) => block.type === "tool_use"
    );

    if (!toolUseBlock || !toolUseBlock.input) {
      console.error("No tool_use block in Claude response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Claude did not return structured output." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // toolUseBlock.input is already a parsed object (not a string like OpenAI)
    const analysis = toolUseBlock.input;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("analyze-resume error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
