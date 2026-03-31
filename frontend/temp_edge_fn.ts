import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const LLAMAPARSE_API_KEY = "llx-KMxlRSWs4XetS4NSiDiwoTS2mrIV7KmDbLoBLq3VgMcdgKE7";
const OCRSPACE_API_KEY = "K83085731988957";

const MODELS = [
  "arcee-ai/trinity-large-preview:free",
  "google/gemini-2.0-flash:free",
  "meta-llama/llama-3.3-70b:free",
  "deepseek/deepseek-chat:free",
];

const MODEL_TIMEOUT_MS = 45000;
const MAX_INPUT_CHARS = 100000;

const SYSTEM_PROMPT = `You are a precise document summarizer for LexDoc AI, a university document management system. Generate a clear, comprehensive summary of the provided document text. The summary should be 3-6 sentences long, capture the key points and purpose of the entire document, and use professional academic language. Never include phrases like "This document" at the start. Return ONLY the summary text, no extra formatting or preamble.`;

function getEventExtractionPrompt(todayIST: string): string {
  return `Extract all dates, times, and related events mentioned in the document.

Today's date is: ${todayIST}

IMPORTANT RULES:

1. ALWAYS EXTRACT

* If any date or time is present, extract it
* Do NOT return empty unless there are absolutely no dates

2. DO NOT FILTER AGGRESSIVELY

* Include past and future dates (filtering will be done later)
* If unsure, still include

3. KEEP IT SIMPLE

* Do NOT classify into types
* Do NOT try to compress schedules
* Do NOT skip entries

4. OUTPUT FORMAT (STRICT JSON ARRAY)

[
{
"text": "full sentence or line containing the event",
"date": "YYYY-MM-DD (if possible, else raw text)",
"time": "HH:MM:SS (if available, else null)"
}
]

5. EXTRACTION GUIDELINES

* Extract meaningful lines containing dates/events
* Avoid metadata, page numbers, or noise
* Preserve original meaning in "text"

6. STRICT OUTPUT

* Return ONLY valid JSON
* No explanations
* No markdown

If no dates found, return:
[]
`;
}

// ==== Programmatic Event Pipeline ====
function parseDate(dateStr: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function isFuture(date: Date | null, todayISTStr: string) {
  if (!date) return true; // keep unknown dates
  const today = new Date(todayISTStr);
  return date >= today;
}

function classifyEvent(text: string) {
  const t = (text || "").toLowerCase();
  if (t.includes("deadline") || t.includes("submit") || t.includes("last date")) return "DEADLINE";
  if (t.includes("exam") || t.includes("test")) return "EXAM";
  if (t.includes("meeting") || t.includes("zoom") || t.includes("call")) return "MEETING";
  return "EVENT";
}

function detectRange(events: any[]) {
  if (events.length < 3) return null;
  const dates = events.map((e: any) => parseDate(e.date)).filter((d: any) => d !== null).sort((a: any, b: any) => a.getTime() - b.getTime());
  if (dates.length < 3) return null;
  const start = dates[0];
  const end = dates[dates.length - 1];
  return {
    event: "Multiple Scheduled Events (Range)",
    start_date: start!.toISOString().split("T")[0],
    end_date: end!.toISOString().split("T")[0],
    description: "Multi-day schedule extracted from document.",
    type: "RANGE"
  };
}

function processEvents(rawEvents: any[], todayIST: string) {
  const cleaned = [];
  for (const e of rawEvents) {
    const parsedDate = parseDate(e.date);
    if (!isFuture(parsedDate, todayIST)) continue;
    cleaned.push({
      event: (e.text || "Event").slice(0, 200),
      date: parsedDate ? parsedDate.toISOString().split("T")[0] : null,
      time: e.time || null,
      description: (e.text || "").slice(0, 500),
      type: classifyEvent(e.text || "")
    });
  }
  const range = detectRange(cleaned);
  if (range) return [range];
  return cleaned;
}
// =====================================

// ==== LlamaParse v1 API ====

async function extractViaLlamaParse(blob: Blob, fileName: string): Promise<string> {
  console.log(`[LLAMAPARSE] Uploading ${fileName} (${blob.size} bytes)`);
  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append("result_type", "markdown");
  formData.append("language", "en");

  let uploadRes: Response;
  try {
    uploadRes = await fetch("https://api.cloud.llamaindex.ai/api/v1/parsing/upload", {
      method: "POST",
      headers: { "Authorization": `Bearer ${LLAMAPARSE_API_KEY}`, "accept": "application/json" },
      body: formData,
    });
  } catch (err: any) {
    console.error(`[LLAMAPARSE] Upload error: ${err.message}`);
    return "";
  }

  if (!uploadRes.ok) {
    const errText = await uploadRes.text().catch(() => "");
    console.error(`[LLAMAPARSE] Upload HTTP ${uploadRes.status}: ${errText.substring(0, 500)}`);
    return "";
  }

  const uploadData = await uploadRes.json();
  const jobId = uploadData?.id;
  if (!jobId) { console.error(`[LLAMAPARSE] No job ID`); return ""; }
  console.log(`[LLAMAPARSE] Job: ${jobId}`);

  const maxWait = 90000;
  const pollInterval = 3000;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    await new Promise(r => setTimeout(r, pollInterval));
    let statusRes: Response;
    try {
      statusRes = await fetch(`https://api.cloud.llamaindex.ai/api/v1/parsing/job/${jobId}`, {
        headers: { "Authorization": `Bearer ${LLAMAPARSE_API_KEY}`, "accept": "application/json" },
      });
    } catch { continue; }
    if (!statusRes.ok) continue;
    const statusData = await statusRes.json();
    const status = statusData?.status;
    console.log(`[LLAMAPARSE] ${jobId}: ${status} (${Math.round((Date.now() - startTime) / 1000)}s)`);

    if (status === "SUCCESS" || status === "COMPLETED") {
      let resultRes: Response;
      try {
        resultRes = await fetch(`https://api.cloud.llamaindex.ai/api/v1/parsing/job/${jobId}/result/markdown`, {
          headers: { "Authorization": `Bearer ${LLAMAPARSE_API_KEY}`, "accept": "application/json" },
        });
      } catch { return ""; }
      if (!resultRes.ok) return "";
      const resultData = await resultRes.json();
      let markdown = "";
      if (resultData?.markdown) markdown = resultData.markdown;
      else if (resultData?.pages) markdown = resultData.pages.map((p: any) => p.md || p.markdown || p.text || "").join("\\n\\n");
      console.log(`[LLAMAPARSE] Done: ${markdown.length} chars`);
      return markdown;
    }
    if (status === "FAILED" || status === "ERROR") return "";
  }
  return "";
}

async function extractPDFviaOCR(blob: Blob, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append("apikey", OCRSPACE_API_KEY);
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append("OCREngine", "2");
  formData.append("filetype", "PDF");
  const res = await fetch("https://api.ocr.space/parse/image", { method: "POST", body: formData });
  if (!res.ok) return "";
  const data = await res.json();
  if (data.OCRExitCode !== 1 || !data.ParsedResults?.length) return "";
  return data.ParsedResults.map((r: any) => r.ParsedText || "").join("\\n");
}

function getFileType(mimeType: string, storagePath: string): string {
  if (mimeType === "application/pdf" || storagePath.endsWith(".pdf")) return "pdf";
  if (mimeType.includes("wordprocessingml") || mimeType.includes("msword") || storagePath.endsWith(".docx") || storagePath.endsWith(".doc")) return "docx";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("text/") || storagePath.endsWith(".txt")) return "text";
  return "unknown";
}

function getTodayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

async function callModel(apiKey: string, model: string, messages: any[], maxTokens: number, temperature: number): Promise<{ text: string; model: string; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
  try {
    console.log(`[AI] >>> ${model}`);
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lexdoc-ai.vercel.app",
        "X-Title": "LexDoc AI",
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      return { text: "", model, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || "";
    const actualModel = data?.model || model;
    console.log(`[AI] <<< ${actualModel}, len=${text.length}`);
    return { text, model: actualModel };
  } catch (err: any) {
    clearTimeout(timer);
    return { text: "", model, error: err.message };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const doc_id = body?.doc_id;
    const force_regenerate = body?.force_regenerate || false;
    if (!doc_id) return new Response(JSON.stringify({ error: "doc_id is required" }), { status: 400, headers: corsHeaders });

    let OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY") || "";
    if (!OPENROUTER_API_KEY) {
      OPENROUTER_API_KEY = "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";
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (!force_regenerate) {
      const { data: cached } = await supabase.from("ai_cache").select("summary_text, model_used").eq("doc_id", doc_id).maybeSingle();
      if (cached?.summary_text) {
        return new Response(JSON.stringify({ summary: cached.summary_text, model: cached.model_used, cached: true }), { headers: corsHeaders });
      }
    }

    await supabase.from("documents").update({ processing_status: "processing" }).eq("id", doc_id);
    if (force_regenerate) {
      await supabase.from("events").delete().match({ doc_id, created_by_ai: true });
    }

    const { data: doc, error: docErr } = await supabase.from("documents").select("title, storage_bucket, storage_path, mime_type").eq("id", doc_id).single();
    if (docErr || !doc) return new Response(JSON.stringify({ error: "Document not found" }), { status: 404, headers: corsHeaders });

    let documentText = "";
    const fileType = getFileType(doc.mime_type || "", doc.storage_path || "");
    const fileName = doc.storage_path?.split("/").pop() || "file";
    console.log(`[MAIN] doc_id=${doc_id}, type=${fileType}, file=${fileName}`);

    try {
      const { data: blob, error: dlErr } = await supabase.storage.from(doc.storage_bucket || "docs").download(doc.storage_path);
      if (dlErr || !blob) throw new Error(dlErr?.message || "Download failed");
      console.log(`[MAIN] Downloaded ${blob.size} bytes`);

      switch (fileType) {
        case "pdf":
          documentText = await extractViaLlamaParse(blob, fileName);
          if (!documentText || documentText.trim().length < 50) {
            documentText = await extractPDFviaOCR(blob, fileName);
          }
          break;
        case "docx":
          documentText = await extractViaLlamaParse(blob, fileName);
          break;
        case "image":
          documentText = \`Title: \${doc.title}. Image file.\`;
          break;
        default:
          documentText = await blob.text();
          break;
      }
    } catch (e: any) {
      console.error(`[MAIN] Extraction error:`, e.message);
    }

    if (!documentText || documentText.trim().length < 30) {
      documentText = \`Title: \${doc.title}. Could not extract text. Summarize based on title.\`;
    }
    if (documentText.length > MAX_INPUT_CHARS) {
      documentText = documentText.slice(0, MAX_INPUT_CHARS) + "\\n[Truncated]";
    }
    console.log(`[MAIN] Final text: ${documentText.length} chars`);

    // SUMMARY
    let summaryResult: { text: string; model: string } | null = null;
    const summaryMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: \`Summarize this document:\\n\\n\${documentText}\` },
    ];
    for (let i = 0; i < MODELS.length; i++) {
      const result = await callModel(OPENROUTER_API_KEY, MODELS[i], summaryMessages, 500, 0.3);
      if (result.text && result.text.length > 20) {
        summaryResult = { text: result.text, model: result.model };
        break;
      }
    }
    if (!summaryResult) {
      await supabase.from("documents").update({ processing_status: "failed" }).eq("id", doc_id);
      return new Response(JSON.stringify({ error: "All AI models failed." }), { status: 502, headers: corsHeaders });
    }

    // ===== EVENTS (with programmatic logging) =====
    console.log(`[EVENTS] Starting event extraction...`);
    try {
      const todayIST = getTodayIST();
      console.log(`[EVENTS] Today IST: ${todayIST}`);
      const eventPrompt = getEventExtractionPrompt(todayIST);
      const eventMessages = [
        { role: "system", content: eventPrompt },
        { role: "user", content: \`Extract events from this document:\\n\\n\${documentText}\` },
      ];
      
      let evResult: { text: string; model: string; error?: string } | null = null;
      const eventModels = ["google/gemini-2.0-flash:free", "meta-llama/llama-3.3-70b:free"];
      for (const evModel of eventModels) {
        console.log(`[EVENTS] Trying model: ${evModel}`);
        const result = await callModel(OPENROUTER_API_KEY, evModel, eventMessages, 1500, 0.1);
        if (result.text && result.text.length > 2) {
          evResult = result;
          console.log(`[EVENTS] Got response from ${result.model}: ${result.text.substring(0, 300)}`);
          break;
        }
        console.log(`[EVENTS] Model ${evModel} failed: ${result.error || 'empty'}`);
      }

      if (!evResult || !evResult.text) {
        console.log(`[EVENTS] No model returned event data`);
      } else {
        let raw = evResult.text;
        if (raw.includes("\`\`\`")) {
          raw = raw.replace(/\`\`\`json\\s*/gi, "").replace(/\`\`\`\\s*/g, "").trim();
        }
        console.log(`[EVENTS] Cleaned response: ${raw.substring(0, 500)}`);

        try {
          const parsed = JSON.parse(raw);
          console.log(`[EVENTS] Parsed ${Array.isArray(parsed) ? parsed.length : 'non-array'} items`);
          
          if (Array.isArray(parsed) && parsed.length > 0) {
            
            // Programmatic processing
            const finalEvents = processEvents(parsed, todayIST);
            console.log(`[EVENTS] Programmatic pipeline returned ${finalEvents.length} cleaned events`);

            const inserts = finalEvents.map((e: any) => {
              const isRange = e.type === "RANGE";
              const row = {
                doc_id,
                title: String(e.event).substring(0, 250),
                event_date: isRange ? null : (e.date || null),
                event_time: isRange ? null : (e.time || null),
                start_date: isRange ? (e.start_date || null) : null,
                end_date: isRange ? (e.end_date || null) : null,
                description: String(e.description || "").substring(0, 500),
                event_type: e.type,
                created_by_ai: true,
              };
              return row;
            });

            console.log(`[EVENTS] ${inserts.length} valid events to insert`);
            if (inserts.length > 0) {
              console.log(`[EVENTS] Sample insert:`, JSON.stringify(inserts[0]));
              const { error: insertErr } = await supabase.from("events").insert(inserts);
              if (insertErr) {
                console.error(`[EVENTS] INSERT ERROR:`, JSON.stringify(insertErr));
              } else {
                console.log(`[EVENTS] Successfully inserted ${inserts.length} events`);
              }
            }
          } else {
            console.log(`[EVENTS] AI returned empty array or non-array`);
          }
        } catch (parseErr: any) {
          console.error(`[EVENTS] JSON PARSE ERROR: ${parseErr.message}`);
          console.error(`[EVENTS] Raw text was: ${raw.substring(0, 500)}`);
        }
      }
    } catch (eventError: any) {
      console.error(`[EVENTS] OUTER ERROR: ${eventError.message}`);
    }

    // PERSIST
    await supabase.from("ai_cache").upsert({ doc_id, summary_text: summaryResult.text, model_used: summaryResult.model }, { onConflict: "doc_id" });
    await supabase.from("summaries").insert({ doc_id, content: summaryResult.text, model_used: summaryResult.model });
    await supabase.from("documents").update({ processing_status: "summarized" }).eq("id", doc_id);

    return new Response(JSON.stringify({ summary: summaryResult.text, model: summaryResult.model, cached: false }), { headers: corsHeaders });
  } catch (err: any) {
    console.error("[FATAL]", err.message, err.stack);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
