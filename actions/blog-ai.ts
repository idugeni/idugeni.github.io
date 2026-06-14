"use server";

import { requireAdmin } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const GEMINI_API_VERSION = "v1beta";
const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";

type GeminiTask = "seoBlueprint" | "articleDraft" | "jsonRepair" | "articleQualityRepair";
type GeminiSchema = Record<string, unknown>;
type ArticleLength = "short" | "standard" | "long" | "pillar";

const articleLengthProfiles: Record<ArticleLength, { minWords: number; maxWords: number; label: string; maxOutputTokens: number }> = {
  short: { minWords: 900, maxWords: 1200, label: "900-1200 words", maxOutputTokens: 4096 },
  standard: { minWords: 1400, maxWords: 1800, label: "1400-1800 words", maxOutputTokens: 6144 },
  long: { minWords: 2200, maxWords: 2800, label: "2200-2800 words", maxOutputTokens: 8192 },
  pillar: { minWords: 3000, maxWords: 4200, label: "3000-4200 words", maxOutputTokens: 12288 },
};

const aiBlogPlanRequestSchema = z.object({
  topic: z.string().min(5).max(900).trim(),
  language: z.enum(["id", "en"]),
  tone: z.enum(["professional", "friendly", "technical", "premium", "persuasive"]),
  intent: z.enum(["informational", "commercial", "transactional", "navigational"]),
  length: z.enum(["short", "standard", "long", "pillar"]),
  includeFaq: z.boolean().default(true),
  includeOutline: z.boolean().default(true),
  includeSeoChecklist: z.boolean().default(true),
});

const aiBlogPlanResponseSchema = z.object({
  refinedBrief: z.string().min(20).max(1200),
  primaryKeyword: z.string().min(2).max(120),
  secondaryKeywords: z.string().min(2).max(500),
  audience: z.string().min(2).max(160),
  cta: z.string().min(5).max(220),
  textToImagePrompt: z.string().min(80).max(1800),
  seoRationale: z.array(z.string().min(5).max(220)).min(3).max(8),
  suggestedTitleAngles: z.array(z.string().min(5).max(160)).min(3).max(6),
});

const aiBlogRequestSchema = z.object({
  topic: z.string().min(5).max(500).trim(),
  primaryKeyword: z.string().min(2).max(120).trim(),
  secondaryKeywords: z.string().max(500).optional().default(""),
  audience: z.string().min(2).max(120).trim(),
  language: z.enum(["id", "en"]),
  tone: z.enum(["professional", "friendly", "technical", "premium", "persuasive"]),
  intent: z.enum(["informational", "commercial", "transactional", "navigational"]),
  length: z.enum(["short", "standard", "long", "pillar"]),
  cta: z.string().max(160).optional().default(""),
  includeFaq: z.boolean().default(true),
  includeOutline: z.boolean().default(true),
  includeSeoChecklist: z.boolean().default(true),
});

const aiBlogResponseSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z.string().min(3).max(200),
  summary: z.string().min(20).max(500),
  contentHtml: z.string().min(200),
  metaTitle: z.string().min(10).max(200),
  metaDescription: z.string().min(30).max(500),
  tags: z.array(z.string().min(1).max(40)).max(12),
  faq: z.array(z.object({ question: z.string().min(5).max(180), answer: z.string().min(10).max(800) })).max(8),
  seoChecklist: z.array(z.string().min(5).max(180)).max(12),
});

export type GenerateBlogSeoPlanWithAiInput = z.input<typeof aiBlogPlanRequestSchema>;
export type GenerateBlogSeoPlanWithAiOutput = z.infer<typeof aiBlogPlanResponseSchema>;
export type GenerateBlogArticleWithAiInput = z.input<typeof aiBlogRequestSchema>;
export type GenerateBlogArticleWithAiOutput = z.infer<typeof aiBlogResponseSchema>;

const textSchema = { type: "STRING" } as const;
const stringArraySchema = { type: "ARRAY", items: textSchema } as const;

const seoPlanGeminiSchema: GeminiSchema = {
  type: "OBJECT",
  properties: {
    refinedBrief: textSchema,
    primaryKeyword: textSchema,
    secondaryKeywords: textSchema,
    audience: textSchema,
    cta: textSchema,
    textToImagePrompt: textSchema,
    seoRationale: stringArraySchema,
    suggestedTitleAngles: stringArraySchema,
  },
  required: ["refinedBrief", "primaryKeyword", "secondaryKeywords", "audience", "cta", "textToImagePrompt", "seoRationale", "suggestedTitleAngles"],
};

const articleGeminiSchema: GeminiSchema = {
  type: "OBJECT",
  properties: {
    title: textSchema,
    slug: textSchema,
    summary: textSchema,
    contentHtml: textSchema,
    metaTitle: textSchema,
    metaDescription: textSchema,
    tags: stringArraySchema,
    faq: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { question: textSchema, answer: textSchema },
        required: ["question", "answer"],
      },
    },
    seoChecklist: stringArraySchema,
  },
  required: ["title", "slug", "summary", "contentHtml", "metaTitle", "metaDescription", "tags", "faq", "seoChecklist"],
};

function stripCodeFence(value: string) {
  return value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function normalizeSlug(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 200);
}

function stripHtmlForWordCount(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/&[a-zA-Z0-9#]+;/g, " ").replace(/\s+/g, " ").trim();
}

function countWordsFromHtml(html: string) {
  const text = stripHtmlForWordCount(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function getLengthIssue(length: ArticleLength, html: string) {
  const profile = articleLengthProfiles[length];
  const wordCount = countWordsFromHtml(html);
  if (wordCount < profile.minWords) return { type: "tooShort" as const, wordCount, profile };
  if (wordCount > profile.maxWords) return { type: "tooLong" as const, wordCount, profile };
  return null;
}

function getSystemInstruction(task: GeminiTask) {
  const base = [
    "You are a senior SEO strategist, React/Next.js technical editor, and premium Indonesian editorial assistant for IRNK Codes.",
    "Return strict JSON only. Do not use markdown fences, commentary, prose outside JSON, or extra keys.",
    "Create original synthesized writing from the provided brief and general domain knowledge; do not copy wording from known articles or web pages.",
    "Never invent statistics, fake citations, fake benchmarks, fake quotes, fake case studies, or unverifiable claims.",
    "If a factual claim is not provided, frame it as a general best practice or practical recommendation.",
    "Write for humans first, then search engines: helpful, specific, conversion-aware, and non-spammy.",
    "Use natural human editorial rhythm: varied sentence length, non-repetitive paragraph openings, concrete examples, nuanced caveats, and no generic AI filler.",
    "Avoid robotic phrases, repeated templates, keyword stuffing, excessive buzzwords, and over-polished generic conclusions.",
    "For HTML content, use safe editorial HTML only: h1, h2, h3, p, ul, ol, li, strong, em, blockquote.",
    "Do not include script, style, iframe, event handlers, inline CSS, external embeds, or unsafe HTML.",
  ];

  if (task === "seoBlueprint") {
    return [...base, "Your task is to transform a manual brief into a high-intent SEO content blueprint with image-generation guidance."].join("\n");
  }

  if (task === "jsonRepair") {
    return [
      "You repair malformed or schema-invalid JSON into valid minified JSON only.",
      "Preserve the original meaning and fields as much as possible.",
      "Do not add commentary, markdown, or explanations.",
    ].join("\n");
  }

  if (task === "articleQualityRepair") {
    return [...base, "Your task is to revise an existing article JSON so it matches the selected word-count profile, improves SEO quality, and sounds human-edited while preserving factual safety."].join("\n");
  }

  return [...base, "Your task is to produce a complete production-ready SEO blog article with exactly one h1, strong topical coverage, original phrasing, and natural human editorial quality."].join("\n");
}

function getGenerationConfig(task: GeminiTask, maxOutputTokens: number, responseSchema?: GeminiSchema) {
  const tuning = {
    seoBlueprint: { temperature: 0.45, topP: 0.86, topK: 32 },
    articleDraft: { temperature: 0.62, topP: 0.92, topK: 48 },
    articleQualityRepair: { temperature: 0.42, topP: 0.82, topK: 32 },
    jsonRepair: { temperature: 0.05, topP: 0.55, topK: 1 },
  }[task];

  return {
    ...tuning,
    maxOutputTokens,
    responseMimeType: "application/json",
    ...(responseSchema ? { responseSchema } : {}),
  };
}

function parseGeminiJson(rawText: string) {
  try {
    return JSON.parse(stripCodeFence(rawText)) as unknown;
  } catch (error) {
    throw new Error(`Gemini returned invalid JSON: ${error instanceof Error ? error.message : "unknown parse error"}`);
  }
}

function getValidationMessage(error: z.ZodError) {
  return error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`).join("; ").slice(0, 1200);
}

async function requestGeminiRaw({ prompt, task, maxOutputTokens, responseSchema }: { prompt: string; task: GeminiTask; maxOutputTokens: number; responseSchema?: GeminiSchema }) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_GEMINI_API_KEY is not configured on the server");

  const model = process.env.GOOGLE_GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const response = await fetch(`https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: getSystemInstruction(task) }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: getGenerationConfig(task, maxOutputTokens, responseSchema),
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini request failed for ${task}: ${response.status} ${message.slice(0, 500)}`);
  }

  const payload = await response.json() as { candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string }> } }> };
  const candidate = payload.candidates?.[0];
  const rawText = candidate?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!rawText) throw new Error(`Gemini returned an empty ${task} response${candidate?.finishReason ? ` (${candidate.finishReason})` : ""}`);
  return rawText;
}

async function callGeminiWithValidation<T>({
  prompt,
  task,
  maxOutputTokens,
  responseSchema,
  zodSchema,
}: {
  prompt: string;
  task: Exclude<GeminiTask, "jsonRepair">;
  maxOutputTokens: number;
  responseSchema: GeminiSchema;
  zodSchema: z.ZodType<T>;
}) {
  const rawText = await requestGeminiRaw({ prompt, task, maxOutputTokens, responseSchema });

  try {
    const parsed = parseGeminiJson(rawText);
    const validated = zodSchema.safeParse(parsed);
    if (validated.success) return validated.data;
    throw new Error(`Schema mismatch: ${getValidationMessage(validated.error)}`);
  } catch (firstError) {
    const repairPrompt = `Repair this Gemini JSON output so it strictly matches the required schema. Return ONLY valid minified JSON.

Required schema description:
${JSON.stringify(responseSchema)}

Validation or parse error:
${firstError instanceof Error ? firstError.message : "Unknown validation error"}

Original output:
${rawText.slice(0, 24000)}`;

    const repairedText = await requestGeminiRaw({ prompt: repairPrompt, task: "jsonRepair", maxOutputTokens, responseSchema });
    const repairedJson = parseGeminiJson(repairedText);
    const repaired = zodSchema.safeParse(repairedJson);
    if (!repaired.success) throw new Error(`Gemini repaired JSON still failed schema validation: ${getValidationMessage(repaired.error)}`);
    return repaired.data;
  }
}

function buildSeoPlanPrompt(input: z.infer<typeof aiBlogPlanRequestSchema>) {
  const language = input.language === "id" ? "Bahasa Indonesia" : "English";
  return `Build the strongest SEO-first blueprint from this manual ARTICLE_BRIEF.

Return ONLY valid JSON matching the provided response schema.

Inputs:
- Manual ARTICLE_BRIEF: ${input.topic}
- Language: ${language}
- Tone: ${input.tone}
- Search intent: ${input.intent}
- Target length: ${input.length}
- Include FAQ: ${input.includeFaq ? "yes" : "no"}
- Include outline: ${input.includeOutline ? "yes" : "no"}
- Include SEO checklist: ${input.includeSeoChecklist ? "yes" : "no"}

Output rules:
- refinedBrief must improve clarity, specificity, search intent, pain points, topical scope, and commercial/editorial direction while preserving user intent.
- primaryKeyword must be realistic, high-intent, and naturally usable in Indonesian/English based on selected language.
- secondaryKeywords must be comma-separated semantic variants, long-tail terms, and related entities.
- audience must be precise and business-aware, not generic.
- cta must be conversion-aware and aligned with IRNK Codes.
- textToImagePrompt must be highly detailed for text-to-image generation: subject, environment, composition, camera/framing, lighting, premium cyber/modern visual style, color palette, mood, article context, aspect ratio 16:9, no text, no watermark, no logo, and negative prompt.
- seoRationale must be practical and concise.
- suggestedTitleAngles must be compelling SERP title angles, not final article body.`;
}

function buildPrompt(input: z.infer<typeof aiBlogRequestSchema>) {
  const language = input.language === "id" ? "Indonesian (Bahasa Indonesia)" : "English";
  const profile = articleLengthProfiles[input.length];

  return `Create a production-ready SEO blog article in ${language}.

Return ONLY valid JSON matching the provided response schema.

Article strategy:
- Topic/brief: ${input.topic}
- Primary keyword: ${input.primaryKeyword}
- Secondary keywords: ${input.secondaryKeywords || "none"}
- Audience: ${input.audience}
- Search intent: ${input.intent}
- Tone: ${input.tone}
- Target length: ${profile.label}. Stay inside this range unless the topic is impossible; do not under-deliver.
- CTA goal: ${input.cta || "soft CTA relevant to the article"}
- Include FAQ: ${input.includeFaq ? "yes" : "no"}
- Include outline in article: ${input.includeOutline ? "yes" : "no"}
- Include SEO checklist: ${input.includeSeoChecklist ? "yes" : "no"}

SEO quality rules:
- Place the primary keyword naturally in title, h1, intro, at least one h2, conclusion, and meta description.
- Avoid keyword stuffing and robotic repetition.
- Align every major section with the search intent.
- Include semantic entities and long-tail variants naturally.
- Make metaTitle compelling and ideally 50-60 characters.
- Make metaDescription compelling and ideally 140-160 characters.
- Use a summary that is useful for listings, not duplicated from metaDescription.
- Tags must be concise, lower-case when appropriate, and max 12.

Editorial quality rules:
- Helpful, original, practical, premium, and specific to the audience.
- Synthesize the article from the brief; do not copy phrasing from any known source or existing article.
- Use original section framing, transitions, examples, analogies, and conclusions.
- Include actionable steps, examples, trade-offs, caveats, and implementation considerations where relevant.
- Vary sentence length and paragraph structure so the article feels human-edited, not template-generated.
- Avoid boilerplate intros, generic AI phrases, repeated paragraph openings, and overused buzzwords.
- Do not invent numbers, citations, case studies, quotes, or claims.
- No fake external links.
- If discussing technical topics, be precise and avoid overclaiming.
- Use IRNK Codes CTA naturally only where appropriate.

HTML rules:
- contentHtml must contain exactly one h1.
- Use logical h2/h3 hierarchy.
- Use safe editorial HTML only: h1, h2, h3, p, ul, ol, li, strong, em, blockquote.
- No script/style/iframe/img/video/audio/forms/tables.
- No markdown fences.
- No inline styles or event handlers.`;
}

function buildArticleQualityRepairPrompt(input: z.infer<typeof aiBlogRequestSchema>, article: GenerateBlogArticleWithAiOutput, issue: NonNullable<ReturnType<typeof getLengthIssue>>) {
  const language = input.language === "id" ? "Indonesian (Bahasa Indonesia)" : "English";
  const action = issue.type === "tooShort" ? "expand" : "condense";

  return `Revise this existing article JSON. Return ONLY valid JSON matching the provided response schema.

Repair objective:
- Action: ${action} the contentHtml.
- Current word count: ${issue.wordCount} words.
- Required range: ${issue.profile.label}.
- Preserve selected language: ${language}.
- Preserve search intent: ${input.intent}.
- Preserve tone: ${input.tone}.
- Primary keyword: ${input.primaryKeyword}.
- Secondary keywords: ${input.secondaryKeywords || "none"}.
- CTA goal: ${input.cta || "soft CTA relevant to the article"}.

Quality requirements:
- Keep exactly one h1.
- Preserve safe editorial HTML only.
- Improve originality and natural human editorial flow.
- Do not add fake statistics, citations, quotes, or case studies.
- Do not copy phrasing from known web pages or articles.
- If expanding, add useful sections, examples, nuance, trade-offs, and practical details instead of filler.
- If condensing, remove repetition and filler while preserving SEO coverage and usefulness.
- Keep primary keyword naturally in title, h1, intro, at least one h2, conclusion, and metaDescription.
- Avoid keyword stuffing, robotic repetition, and generic AI-style phrasing.
- Keep JSON fields complete and valid.

Existing article JSON:
${JSON.stringify(article)}`;
}

async function enforceArticleLength(input: z.infer<typeof aiBlogRequestSchema>, article: GenerateBlogArticleWithAiOutput) {
  const issue = getLengthIssue(input.length, article.contentHtml);
  if (!issue) return article;

  const repaired = await callGeminiWithValidation({
    prompt: buildArticleQualityRepairPrompt(input, article, issue),
    task: "articleQualityRepair",
    maxOutputTokens: articleLengthProfiles[input.length].maxOutputTokens,
    responseSchema: articleGeminiSchema,
    zodSchema: aiBlogResponseSchema,
  });

  return repaired;
}

export async function generateBlogSeoPlanWithAi(data: GenerateBlogSeoPlanWithAiInput): Promise<GenerateBlogSeoPlanWithAiOutput> {
  await requireAdmin();
  const parsed = aiBlogPlanRequestSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid SEO blueprint request: " + parsed.error.issues[0].message);

  return callGeminiWithValidation({
    prompt: buildSeoPlanPrompt(parsed.data),
    task: "seoBlueprint",
    maxOutputTokens: 4096,
    responseSchema: seoPlanGeminiSchema,
    zodSchema: aiBlogPlanResponseSchema,
  });
}

export async function generateBlogArticleWithAi(data: GenerateBlogArticleWithAiInput): Promise<GenerateBlogArticleWithAiOutput> {
  await requireAdmin();
  const parsed = aiBlogRequestSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid AI generation request: " + parsed.error.issues[0].message);

  let articlesContext = "";
  try {
    const supabase = await createClient();
    const { data: existingArticles } = await supabase
      .from("blog_artikel")
      .select("judul, slug")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(15);
    
    if (existingArticles && existingArticles.length > 0) {
      articlesContext = existingArticles
        .map((a) => `- "${a.judul}": /blog/${a.slug}`)
        .join("\n");
    }
  } catch (err) {
    console.error("Failed to fetch existing articles for AI context:", err);
  }

  const prompt = `${buildPrompt(parsed.data)}${
    articlesContext
      ? `\n\nCONTEXTUAL LINK BUILDING:\nHere is the list of existing published articles on our site. You MUST naturally insert safe HTML anchor links (<a href="/blog/slug">Anchor Text</a>) to at least 1-2 relevant articles from this list inside the contentHtml text where it provides logical value to the reader. Do not force links if they do not fit the content naturally:\n${articlesContext}`
      : ""
  }`;

  const generated = await callGeminiWithValidation({
    prompt,
    task: "articleDraft",
    maxOutputTokens: articleLengthProfiles[parsed.data.length].maxOutputTokens,
    responseSchema: articleGeminiSchema,
    zodSchema: aiBlogResponseSchema,
  });
  const qualityChecked = await enforceArticleLength(parsed.data, generated);

  return { ...qualityChecked, slug: normalizeSlug(qualityChecked.slug || qualityChecked.title), tags: qualityChecked.tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 12) };
}

const aiAuditRequestSchema = z.object({
  currentTitle: z.string().min(5),
  currentContentHtml: z.string().min(100),
  primaryKeyword: z.string().min(2),
});

const aiAuditResponseSchema = z.object({
  seoScoreFeedback: z.string().min(10),
  suggestedImprovements: z.array(z.string().min(5)).min(2).max(8),
  optimizedMetaDescription: z.string().min(30).max(500),
});

export type AuditExistingArticleWithAiInput = z.infer<typeof aiAuditRequestSchema>;
export type AuditExistingArticleWithAiOutput = z.infer<typeof aiAuditResponseSchema>;

const auditGeminiSchema: GeminiSchema = {
  type: "OBJECT",
  properties: {
    seoScoreFeedback: textSchema,
    suggestedImprovements: stringArraySchema,
    optimizedMetaDescription: textSchema,
  },
  required: ["seoScoreFeedback", "suggestedImprovements", "optimizedMetaDescription"],
};

export async function auditExistingArticleWithAi(data: AuditExistingArticleWithAiInput): Promise<AuditExistingArticleWithAiOutput> {
  await requireAdmin();
  const parsed = aiAuditRequestSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid AI audit request: " + parsed.error.issues[0].message);

  const prompt = `Perform a strict SEO and content quality audit on this existing published article.
  
  Target Primary Keyword: "${parsed.data.primaryKeyword}"
  Article Title: "${parsed.data.currentTitle}"
  Article Content HTML:
  ${parsed.data.currentContentHtml.slice(0, 18000)}
  
  Your audit must evaluate:
  1. Primary keyword natural integration in title, headings, intro, body, and conclusion.
  2. Structure and logical editorial flow.
  3. Actionability and specific human editorial quality.
  
  Output requirements:
  - seoScoreFeedback: A constructive paragraph analyzing current strengths/weaknesses and keyword integration.
  - suggestedImprovements: An array of 3-6 highly specific actionable suggestions for the editor to improve the text.
  - optimizedMetaDescription: A perfect, high-CTR meta description (120-160 characters) focusing on search intent.`;

  return callGeminiWithValidation({
    prompt,
    task: "articleDraft", // Uses editorial system instructions
    maxOutputTokens: 2048,
    responseSchema: auditGeminiSchema,
    zodSchema: aiAuditResponseSchema,
  });
}

