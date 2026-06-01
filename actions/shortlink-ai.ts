"use server";

import { requireAdmin } from "@/lib/auth/rbac";
import { z } from "zod";

const GEMINI_API_VERSION = "v1beta";
const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";

// ─── Input & Output Schemas ──────────────────────────────────────────────────

export const shortlinkAiRequestSchema = z.object({
  url: z.string().url().trim(),
});

export const shortlinkAiResponseSchema = z.object({
  title: z.string().max(80),
  description: z.string().max(200),
  safelink_headline: z.string().max(100),
  safelink_article_title: z.string().max(150),
  safelink_article_body: z.string().min(100),
  safelink_safety_analysis: z.string().max(600),
  safelink_safety_score: z.number().int().min(1).max(100),
  safelink_trust_grade: z.string().max(5),
  brand_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  brand_message: z.string().max(100),
});

export type ShortlinkAiResponse = z.infer<typeof shortlinkAiResponseSchema>;

type GeminiSchema = Record<string, unknown>;

const textSchema = { type: "STRING" } as const;

const shortlinkGeminiSchema: GeminiSchema = {
  type: "OBJECT",
  properties: {
    title: textSchema,
    description: textSchema,
    safelink_headline: textSchema,
    safelink_article_title: textSchema,
    safelink_article_body: textSchema,
    safelink_safety_analysis: textSchema,
    safelink_safety_score: { type: "INTEGER" },
    safelink_trust_grade: textSchema,
    brand_color: textSchema,
    brand_message: textSchema,
  },
  required: [
    "title",
    "description",
    "safelink_headline",
    "safelink_article_title",
    "safelink_article_body",
    "safelink_safety_analysis",
    "safelink_safety_score",
    "safelink_trust_grade",
    "brand_color",
    "brand_message",
  ],
};

// ─── Scraper Logic ───────────────────────────────────────────────────────────

async function scrapeUrlMetadata(url: string): Promise<{
  title: string;
  description: string;
  textContent: string;
  headings: string[];
}> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      throw new Error(`HTTP error status: ${res.status}`);
    }

    const html = await res.text();

    // Extract Title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";

    // Extract Meta Description
    let description = "";
    const metaDescMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i) ||
      html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["']/i) ||
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([\s\S]*?)["']/i);
    if (metaDescMatch) {
      description = metaDescMatch[1].replace(/\s+/g, " ").trim();
    }

    // Extract Headings
    const headings: string[] = [];
    const headingMatches = html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi);
    for (const match of headingMatches) {
      const cleanHeading = match[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      if (cleanHeading && headings.length < 5) {
        headings.push(cleanHeading);
      }
    }

    // Extract Text Content (strip script/style tags)
    let bodyText = html;
    bodyText = bodyText.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, " ");
    bodyText = bodyText.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, " ");
    bodyText = bodyText.replace(/<!--([\s\S]*?)-->/g, " ");
    bodyText = bodyText.replace(/<[^>]*>/g, " ");
    bodyText = bodyText.replace(/\s+/g, " ").trim();

    const textContent = bodyText.slice(0, 3000);

    return {
      title: title || new URL(url).hostname,
      description,
      textContent,
      headings,
    };
  } catch (error) {
    console.error("Failed to scrape target URL directly, using fallback domain analyzer:", error);
    const hostname = new URL(url).hostname;
    return {
      title: hostname,
      description: `External link routing node for ${hostname}`,
      textContent: `The target site is hosted at ${hostname}. Direct scraper was rate-limited or blocked, but the URL remains valid.`,
      headings: [],
    };
  }
}

// ─── Gemini Helpers ──────────────────────────────────────────────────────────

function stripCodeFence(value: string): string {
  return value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function parseGeminiJson(rawText: string) {
  try {
    const cleaned = stripCodeFence(rawText);
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`Gemini returned invalid JSON: ${error instanceof Error ? error.message : "unknown parse error"}`);
  }
}

function getSystemInstruction() {
  return `You are Antigravity AI, a premium cybernetic security auditor and content generator for the IDUGENI portal.
Your task is to analyze scraped web page metadata and generate a complete, high-value visual config and landing page package for a "Safelink" secure gateway.

You MUST return ONLY a minified JSON object matching the required schema. DO NOT include any conversational text, notes, or markdown fences outside the JSON.

Content generation rules:
1. title: Optimize the page title (max 70 chars) to be clear, professional, and SEO-friendly.
2. description: Write a highly engaging summary (max 180 chars) of the destination URL's core theme or purpose.
3. safelink_headline: A technical security warning or decryption status, e.g., "SECURE REDIRECTION BEACON ACTIVE", "ENCRYPTED DECRYPTION PORTAL ONLINE".
4. safelink_article_title: A compelling, educational tech article title relevant to the destination URL's theme.
5. safelink_article_body: Write a high-value, highly detailed educational essay, guide, or tutorial (250-400 words) related to the topic of the URL. Use standard HTML tags like <p>, <strong>, <ul>, <li>, <code> to format it beautifully. DO NOT use <h1> or <h2> tags. Make it informative, engaging, and outstanding!
6. safelink_safety_analysis: A security audit review of the domain. Describe its certificate status, trustworthiness, and outline the contextual safety of the redirect path in a cyberpunk tech tone.
7. safelink_safety_score: An integer between 85 and 100 representing domain trust.
8. safelink_trust_grade: A safety letter grade, e.g., "A+", "A", "B+".
9. brand_color: A highly styled Tailwind/hex color matching the category theme, e.g., '#10b981' (emerald) for secure/documentation, '#06b6d4' (cyan) for development/tools, '#ec4899' (pink) for creative/social media, '#f59e0b' (amber) for forums/blogs.
10. brand_message: A brief cyber-styled status note, e.g., "SSL ENCRYPTED CHANNEL VALIDATED".`;
}

function getGenerationConfig(maxOutputTokens: number, responseSchema?: GeminiSchema) {
  return {
    temperature: 0.2, // low temperature for precise JSON generation
    topP: 0.95,
    topK: 40,
    maxOutputTokens,
    responseMimeType: "application/json",
    responseSchema,
  };
}

async function requestGeminiRaw({
  prompt,
  maxOutputTokens,
  responseSchema,
}: {
  prompt: string;
  maxOutputTokens: number;
  responseSchema?: GeminiSchema;
}) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_GEMINI_API_KEY is not configured on the server");

  const model = process.env.GOOGLE_GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: getSystemInstruction() }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: getGenerationConfig(maxOutputTokens, responseSchema),
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText.slice(0, 500)}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      finishReason?: string;
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const candidate = payload.candidates?.[0];
  const rawText = candidate?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!rawText) {
    throw new Error(`Gemini returned an empty response${candidate?.finishReason ? ` (${candidate.finishReason})` : ""}`);
  }
  return rawText;
}

// ─── Server Action ───────────────────────────────────────────────────────────

export async function generateShortlinkAiContent(destinationUrl: string): Promise<ShortlinkAiResponse> {
  // Enforce security
  await requireAdmin();

  // Validate URL
  const validation = shortlinkAiRequestSchema.safeParse({ url: destinationUrl });
  if (!validation.success) {
    throw new Error("Invalid destination URL format");
  }

  // 1. Scrape metadata
  const scraped = await scrapeUrlMetadata(destinationUrl);

  // 2. Build prompt
  const prompt = `Analyze this scraped web page metadata and write the ultimate cyber-safelink landing page content.

Scraped Data:
- Target URL: ${destinationUrl}
- Extracted Page Title: ${scraped.title}
- Extracted Page Description: ${scraped.description}
- Page Heading Structure: ${scraped.headings.join(" | ")}
- Extract of page body content:
"""
${scraped.textContent}
"""

Return ONLY a valid minified JSON matching the specified response schema. Ensure that your output does not exceed the tokens and is perfectly formed.`;

  // 3. Request Gemini with validation & repair loop
  const rawText = await requestGeminiRaw({
    prompt,
    maxOutputTokens: 2500,
    responseSchema: shortlinkGeminiSchema,
  });

  try {
    const parsed = parseGeminiJson(rawText);
    const validated = shortlinkAiResponseSchema.safeParse(parsed);
    if (validated.success) return validated.data;
    throw new Error(`Schema mismatch: ${validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  } catch (firstError) {
    // Attempt schema repair
    const repairPrompt = `Repair this Gemini JSON output so it strictly matches the required schema description. Return ONLY valid JSON.

Schema spec:
${JSON.stringify(shortlinkGeminiSchema)}

Error details:
${firstError instanceof Error ? firstError.message : "Unknown validation error"}

Original text:
${rawText}`;

    const repairedText = await requestGeminiRaw({
      prompt: repairPrompt,
      maxOutputTokens: 2500,
      responseSchema: shortlinkGeminiSchema,
    });
    const repairedJson = parseGeminiJson(repairedText);
    const repaired = shortlinkAiResponseSchema.safeParse(repairedJson);
    if (!repaired.success) {
      throw new Error(`Gemini repaired JSON still failed schema validation: ${repaired.error.message}`);
    }
    return repaired.data;
  }
}
