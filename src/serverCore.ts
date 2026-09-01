/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";
import dotenv from "dotenv";
import { 
  synthesizeTexoraVoiceResponse, 
  synthesizeStructuredLesson, 
  synthesizeTextbookChapter 
} from "./data/aiKnowledgeSynthesizer";

// Load environment variables if present
dotenv.config();

export {
  synthesizeTexoraVoiceResponse, 
  synthesizeStructuredLesson, 
  synthesizeTextbookChapter 
};

export function getGeminiApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;
  return key ? key.trim() : undefined;
}

// Helper for calling Gemini with multi-tier model fallback and graceful tool degradation on 429/503 quota exhaustion
export async function callGeminiWithSmartFallback(
  ai: GoogleGenAI,
  options: {
    models?: string[];
    contents: any;
    config?: any;
    tools?: any[];
  }
) {
  // gemini-3.1-flash-lite is the primary production model optimized for reliability and quota efficiency
  const models = options.models || ["gemini-3.1-flash-lite", "gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-pro-preview"];
  const tools = options.tools || [];
  let lastError: any = null;

  // 1. Try models in sequence with tools (if explicitly provided)
  if (tools.length > 0) {
    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: {
            ...options.config,
            tools,
          }
        });
        const text = response?.text || response?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';
        if (text) {
          return { response, modelUsed: model, toolsUsed: true, text };
        }
      } catch (err: any) {
        lastError = err;
        const isQuota = err?.status === 'RESOURCE_EXHAUSTED' || err?.message?.includes('429') || err?.message?.includes('quota');
        const isUnavailable = err?.status === 'UNAVAILABLE' || err?.message?.includes('503');
        if (!isQuota && !isUnavailable) {
          console.warn(`[Gemini Engine] Model ${model} with tools note:`, err?.message || err?.status);
        }
      }
    }
  }

  // 2. Try models in sequence without tools (pure text generation with full intelligence & system prompt)
  for (const model of models) {
    try {
      const cleanConfig = { ...(options.config || {}) };
      delete cleanConfig.tools;
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: cleanConfig
      });
      const text = response?.text || response?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';
      if (text) {
        return { response, modelUsed: model, toolsUsed: false, text };
      }
    } catch (err: any) {
      lastError = err;
      const isQuota = err?.status === 'RESOURCE_EXHAUSTED' || err?.message?.includes('429') || err?.message?.includes('quota');
      const isUnavailable = err?.status === 'UNAVAILABLE' || err?.message?.includes('503');
      if (!isQuota && !isUnavailable) {
        console.warn(`[Gemini Engine] Model ${model} text generation note:`, err?.message || err?.status);
      }
    }
  }

  throw lastError || new Error("All Gemini models temporarily unavailable.");
}

export function createServerApp() {
  const app = express();

  // Cross-Origin Resource Sharing (CORS) & Browser Compatibility Middleware
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // URL normalization middleware for Vercel / serverless deployments
  app.use((req, res, next) => {
    const matchedPath = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-url'] as string) || (req.headers['x-rewrite-url'] as string);
    if (matchedPath && (req.url === '/api/index' || req.url === '/api' || req.url.startsWith('/api/index?'))) {
      req.url = matchedPath;
    }
    next();
  });

  // Body parsers
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check API
  const healthHandler = (_req: express.Request, res: express.Response) => {
    res.setHeader("Content-Type", "application/json");
    res.json({ status: "ok", service: "TeXora Forge Academic Server" });
  };
  app.get("/api/health", healthHandler);
  app.get("/health", healthHandler);

  // AI Assistant endpoint for structured lesson notes and pedagogical guidance
  const suggestLessonHandler = async (req: express.Request, res: express.Response) => {
    res.setHeader("Content-Type", "application/json");
    const { topic, className, subject, durationMinutes, prompt: customPrompt, subTopic } = req.body || {};
    const effectiveTopic = topic || "Academic Topic";
    const effectiveSubject = subject || "General Studies";
    const effectiveClass = className || "Secondary Class";

    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        const synth = synthesizeStructuredLesson(effectiveTopic, effectiveSubject, effectiveClass, subTopic);
        return res.json({ success: true, data: synth, suggestions: synth });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemPrompt = customPrompt
        ? `You are an expert AI pedagogical tutor and curriculum specialist for primary and secondary schools.
Process this instruction: "${customPrompt}"
Class: ${effectiveClass}
Subject: ${effectiveSubject}
Topic: ${effectiveTopic}
SubTopic: ${subTopic || effectiveTopic}

Return a valid JSON object matching this structure:
{
  "subTopic": "string",
  "summary": "string containing rich, helpful pedagogical explanation",
  "behavioralObjectives": ["string", "string", "string"],
  "instructionalMaterials": ["string", "string", "string"],
  "introduction": "string hook or overview",
  "coreContentSteps": [
    {
      "stepNumber": 1,
      "title": "string",
      "teacherActivity": "string",
      "studentActivity": "string"
    },
    {
      "stepNumber": 2,
      "title": "string",
      "teacherActivity": "string",
      "studentActivity": "string"
    }
  ],
  "keyPoints": ["string key takeaway 1", "string key takeaway 2", "string key takeaway 3"],
  "evaluationQuestions": ["Question 1?", "Question 2?", "Question 3?", "Question 4?"],
  "assignment": "string homework or next step"
}`
        : `You are a master curriculum specialist for secondary and primary schools.
Generate a structured, highly pedagogical lesson note in JSON format for:
- Class: ${effectiveClass}
- Subject: ${effectiveSubject}
- Topic: ${effectiveTopic}
- SubTopic: ${subTopic || effectiveTopic}
- Duration: ${durationMinutes || 80} minutes

Return ONLY a valid JSON object matching this exact schema:
{
  "subTopic": "string",
  "behavioralObjectives": ["string", "string", "string"],
  "instructionalMaterials": ["string", "string", "string"],
  "introduction": "string summary of hook/recap",
  "coreContentSteps": [
    {
      "stepNumber": 1,
      "title": "string",
      "teacherActivity": "string",
      "studentActivity": "string"
    },
    {
      "stepNumber": 2,
      "title": "string",
      "teacherActivity": "string",
      "studentActivity": "string"
    },
    {
      "stepNumber": 3,
      "title": "string",
      "teacherActivity": "string",
      "studentActivity": "string"
    }
  ],
  "summary": "string comprehensive summary",
  "keyPoints": ["string key concept 1", "string key concept 2"],
  "evaluationQuestions": ["string question 1", "string question 2", "string question 3", "string question 4"],
  "assignment": "string homework task"
}`;

      const { response } = await callGeminiWithSmartFallback(ai, {
        models: ["gemini-3.1-flash-lite", "gemini-3.7-flash", "gemini-flash-latest"],
        contents: systemPrompt,
        config: { responseMimeType: "application/json" }
      });

      let responseText = response.text || "";
      responseText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();

      try {
        const parsedData = JSON.parse(responseText);
        return res.json({ success: true, data: parsedData, suggestions: parsedData });
      } catch (parseError) {
        const synth = synthesizeStructuredLesson(effectiveTopic, effectiveSubject, effectiveClass, subTopic);
        return res.json({ success: true, data: synth, suggestions: synth });
      }
    } catch (error: any) {
      console.warn("Gemini API error in suggest-lesson, falling back to curriculum synthesizer:", error?.message);
      const fallbackData = synthesizeStructuredLesson(effectiveTopic, effectiveSubject, effectiveClass, subTopic);
      return res.json({
        success: true,
        data: fallbackData,
        suggestions: fallbackData,
        notice: "Generated using built-in curriculum intelligence."
      });
    }
  };
  app.post("/api/ai/suggest-lesson", suggestLessonHandler);
  app.post("/ai/suggest-lesson", suggestLessonHandler);

  // Texora AI Voice Assistant endpoint with primary gemini-3.1-flash-lite model and intelligent fallback
  const texoraVoiceChatHandler = async (req: express.Request, res: express.Response) => {
    res.setHeader("Content-Type", "application/json");
    const { prompt, conversationHistory } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ success: false, error: "Voice prompt query is required." });
    }

    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        console.warn("[Texora Voice API]: No GEMINI_API_KEY detected. Using built-in Texora intelligence synthesizer.");
        const fallbackResponse = synthesizeTexoraVoiceResponse(prompt);
        return res.json({
          success: true,
          text: fallbackResponse,
          modelUsed: "built-in-intelligence",
          grounding: {
            searchQueries: [],
            searchChunks: [],
            isSearchGrounded: false
          }
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `You are Texora, an intelligent, empathetic, highly articulate, and omni-knowledgeable AI Voice and Educational Companion.
Your capabilities:
1. Unlimited Knowledge: Answer any question across global news, sciences, mathematics, literature, history, technology, health, languages, pop culture, trivia, philosophy, and human knowledge.
2. Academic Tutoring: Provide deep, comprehensive, step-by-step explanations for primary, secondary (WAEC, NECO, JAMB, IGCSE, SAT), and university levels.
3. School Management: Provide advice on lesson planning, CBT question creation, timetable optimization, and pedagogical techniques.
4. Voice Optimization: Keep your spoken phrasing crisp, lively, and natural for voice readout. Avoid bulky ascii art or unreadable tables. Use clear bullet points or short paragraphs.
5. Identity: Your name is strictly "Texora". When greeting or introducing yourself, use "Texora".`;

      let contents: any[] = [];
      if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        const recent = conversationHistory.slice(-6);
        for (const item of recent) {
          if (item && item.sender === 'user' && item.text) {
            contents.push({ role: 'user', parts: [{ text: String(item.text) }] });
          } else if (item && item.sender === 'ai' && item.text) {
            contents.push({ role: 'model', parts: [{ text: String(item.text) }] });
          }
        }
      }
      contents.push({ role: 'user', parts: [{ text: prompt.trim() }] });

      // Call primary gemini-3.1-flash-lite model without search tool for high speed and 100% quota reliability
      const { response, toolsUsed, modelUsed, text: generatedText } = await callGeminiWithSmartFallback(ai, {
        models: ["gemini-3.1-flash-lite", "gemini-3.7-flash", "gemini-flash-latest"],
        contents,
        config: { systemInstruction }
      });

      const responseText = generatedText || response?.text || "";
      if (!responseText) {
        throw new Error("Received empty response from Gemini model.");
      }

      const groundingMetadata = response?.candidates?.[0]?.groundingMetadata;
      const searchQueries = groundingMetadata?.webSearchQueries || [];
      const searchChunks = groundingMetadata?.groundingChunks || [];

      return res.json({
        success: true,
        text: responseText,
        modelUsed,
        grounding: {
          searchQueries,
          searchChunks: searchChunks.slice(0, 5),
          isSearchGrounded: toolsUsed && (searchQueries.length > 0 || searchChunks.length > 0)
        }
      });
    } catch (error: any) {
      console.error("[Texora Voice API Error]:", error?.message || error);
      const fallbackResponse = synthesizeTexoraVoiceResponse(prompt);
      return res.json({
        success: true,
        text: fallbackResponse,
        modelUsed: "fallback-synthesizer",
        grounding: {
          searchQueries: [],
          searchChunks: [],
          isSearchGrounded: false
        },
        notice: `Model response fallback activated (${error?.message || "Service error"}).`
      });
    }
  };
  app.post("/api/ai/texora-voice-chat", texoraVoiceChatHandler);
  app.post("/ai/texora-voice-chat", texoraVoiceChatHandler);

  // AI Textbook Chapter Content Generator
  const generateTextbookChapterHandler = async (req: express.Request, res: express.Response) => {
    res.setHeader("Content-Type", "application/json");
    const { bookTitle, subject, chapterNumber, chapterTitle, gradeLevel } = req.body || {};

    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        const fallback = synthesizeTextbookChapter(bookTitle, subject, chapterNumber, chapterTitle, gradeLevel);
        return res.json({ success: true, chapter: fallback });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a master textbook author and curriculum developer.
Generate a comprehensive, rigorous digital textbook chapter in JSON format for:
- Book: ${bookTitle || "Official Curriculum Textbook"}
- Subject: ${subject || "General Science"}
- Chapter ${chapterNumber || 1}: ${chapterTitle || "Foundational Concepts"}
- Grade Level: ${gradeLevel || "Senior Secondary"}

Return ONLY a valid JSON object matching this schema:
{
  "chapterNumber": ${chapterNumber || 1},
  "title": "${chapterTitle || 'Chapter Title'}",
  "estimatedReadTime": "18 mins read",
  "summary": "Thorough academic summary of this chapter...",
  "keyConcepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
  "formulasOrRules": ["Key formula or principle 1", "Key rule 2"],
  "contentSections": [
    {
      "heading": "1. Fundamental Principles",
      "subheading": "Core Definitions & Real-world Relevance",
      "body": "Detailed textbook explanation...",
      "keyTakeaway": "Main insight to remember"
    },
    {
      "heading": "2. Mechanism, Deep Analysis & Applications",
      "body": "Deep technical analysis and practical examples...",
      "workedExamples": [
        {
          "problem": "Sample examination problem...",
          "stepByStepSolution": ["Step 1...", "Step 2...", "Step 3..."],
          "answer": "Final exact answer"
        }
      ]
    }
  ],
  "reviewQuestions": [
    {
      "question": "Multiple choice question 1?",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": "A",
      "explanation": "Detailed step-by-step reason why A is correct.",
      "type": "MULTIPLE_CHOICE"
    },
    {
      "question": "Analytical question 2?",
      "options": ["A. Choice A", "B. Choice B", "C. Choice C", "D. Choice D"],
      "correctAnswer": "C",
      "explanation": "Detailed explanation.",
      "type": "MULTIPLE_CHOICE"
    }
  ]
}`;

      const { response } = await callGeminiWithSmartFallback(ai, {
        models: ["gemini-3.1-flash-lite", "gemini-3.7-flash", "gemini-flash-latest"],
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      let jsonText = (response.text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonText);
      return res.json({ success: true, chapter: parsed });
    } catch (error: any) {
      console.warn("Gemini API error in generate-textbook-chapter, falling back to curriculum synthesizer:", error?.message);
      const fallback = synthesizeTextbookChapter(bookTitle, subject, chapterNumber, chapterTitle, gradeLevel);
      return res.json({ success: true, chapter: fallback });
    }
  };
  app.post("/api/ai/generate-textbook-chapter", generateTextbookChapterHandler);
  app.post("/ai/generate-textbook-chapter", generateTextbookChapterHandler);

  // AI Create & Edit Images endpoint using gemini-3.1-flash-image-preview
  const imageGenerateHandler = async (req: express.Request, res: express.Response) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is missing. Please configure it in the Secrets panel."
        });
      }

      const { prompt, base64Image, mimeType, aspectRatio, imageSize } = req.body || {};

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: "Text prompt is required for image creation or editing." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const parts: any[] = [];

      if (base64Image) {
        let pureBase64 = base64Image;
        let effectiveMime = mimeType || "image/png";
        if (typeof base64Image === 'string' && base64Image.includes(";base64,")) {
          const split = base64Image.split(";base64,");
          effectiveMime = split[0].replace("data:", "") || "image/png";
          pureBase64 = split[1];
        }
        parts.push({
          inlineData: {
            data: pureBase64,
            mimeType: effectiveMime,
          },
        });
      }

      parts.push({
        text: prompt.trim(),
      });

      const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
      const chosenAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : "1:1";

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: {
          parts,
        },
        config: {
          imageConfig: {
            aspectRatio: chosenAspectRatio,
            ...(imageSize ? { imageSize } : {}),
          },
        },
      });

      let generatedImageUrl = "";
      let generatedText = "";

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const outMime = part.inlineData.mimeType || "image/png";
            generatedImageUrl = `data:${outMime};base64,${part.inlineData.data}`;
          } else if (part.text) {
            generatedText += (generatedText ? " " : "") + part.text;
          }
        }
      }

      if (!generatedImageUrl) {
        return res.status(500).json({
          error: "No image was returned by Gemini model.",
          textResponse: generatedText,
        });
      }

      return res.json({
        success: true,
        imageUrl: generatedImageUrl,
        description: generatedText || "Image generated successfully",
        aspectRatio: chosenAspectRatio,
        mode: base64Image ? 'edit' : 'generate',
      });
    } catch (error: any) {
      console.error("Error in AI image generation/editing:", error);
      return res.status(500).json({
        error: "Failed to generate or edit image.",
        details: error.message || String(error),
      });
    }
  };
  app.post("/api/ai/image/generate-or-edit", imageGenerateHandler);
  app.post("/ai/image/generate-or-edit", imageGenerateHandler);

  // Start Video Generation using Veo (veo-3.1-fast-generate-preview)
  const videoGenerateHandler = async (req: express.Request, res: express.Response) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is missing. Please configure it in the Secrets panel."
        });
      }

      const { prompt, base64Image, mimeType, aspectRatio } = req.body || {};

      if ((!prompt || !prompt.trim()) && !base64Image) {
        return res.status(400).json({ error: "A text prompt or source image photo is required for Veo 3.1 video generation." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const chosenAspectRatio: '16:9' | '9:16' = aspectRatio === '9:16' ? '9:16' : '16:9';
      const promptText = (prompt && prompt.trim()) ? prompt.trim() : 'Cinematic smooth video with realistic physics, natural lighting, and dynamic movement';

      const generateParams: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: promptText,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: chosenAspectRatio,
        }
      };

      if (base64Image) {
        let pureBase64 = base64Image;
        let effectiveMime = mimeType || "image/png";
        if (typeof base64Image === 'string' && base64Image.includes(";base64,")) {
          const split = base64Image.split(";base64,");
          effectiveMime = split[0].replace("data:", "") || "image/png";
          pureBase64 = split[1];
        }
        generateParams.image = {
          imageBytes: pureBase64,
          mimeType: effectiveMime,
        };
      }

      const operation = await ai.models.generateVideos(generateParams);

      return res.json({
        success: true,
        operationName: operation.name,
        aspectRatio: chosenAspectRatio,
      });
    } catch (error: any) {
      console.error("Error initiating Veo video generation:", error);
      return res.status(500).json({
        error: "Failed to initiate Veo video generation.",
        details: error.message || String(error),
      });
    }
  };
  app.post("/api/ai/video/generate", videoGenerateHandler);
  app.post("/ai/video/generate", videoGenerateHandler);

  // Check Veo Video Operation Status
  const videoStatusHandler = async (req: express.Request, res: express.Response) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is missing."
        });
      }

      const { operationName } = req.body || {};
      if (!operationName) {
        return res.status(400).json({ error: "Operation name is required." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const op = new GenerateVideosOperation();
      op.name = operationName;

      const updated = await ai.operations.getVideosOperation({ operation: op });

      const isDone = Boolean(updated.done);
      const errorMessage = updated.error ? (updated.error.message || String(updated.error)) : null;

      return res.json({
        success: true,
        done: isDone,
        error: errorMessage,
        downloadReady: isDone && !errorMessage,
      });
    } catch (error: any) {
      console.error("Error polling Veo operation status:", error);
      return res.status(500).json({
        error: "Failed to poll video operation status.",
        details: error.message || String(error),
      });
    }
  };
  app.post("/api/ai/video/status", videoStatusHandler);
  app.post("/ai/video/status", videoStatusHandler);

  // Download Generated Veo Video stream
  const videoDownloadHandler = async (req: express.Request, res: express.Response) => {
    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({
          error: "GEMINI_API_KEY is missing."
        });
      }

      const { operationName } = req.body || {};
      if (!operationName) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: "Operation name is required." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const op = new GenerateVideosOperation();
      op.name = operationName;

      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

      if (!uri) {
        res.setHeader("Content-Type", "application/json");
        return res.status(404).json({ error: "Generated video download URI not found." });
      }

      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': apiKey },
      });

      if (!videoRes.ok) {
        res.setHeader("Content-Type", "application/json");
        return res.status(videoRes.status).json({
          error: `Failed to fetch video payload: ${videoRes.statusText}`
        });
      }

      const arrayBuf = await videoRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);

      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', 'inline; filename="veo-animation.mp4"');
      return res.send(buffer);
    } catch (error: any) {
      console.error("Error downloading Veo video:", error);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: "Failed to download video stream.",
        details: error.message || String(error),
      });
    }
  };
  app.post("/api/ai/video/download", videoDownloadHandler);
  app.post("/ai/video/download", videoDownloadHandler);

  // Global 404 handler for API routes
  app.use((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(404).json({
      success: false,
      error: `Route not found: ${req.method} ${req.url}`,
      availableRoutes: [
        "/api/ai/texora-voice-chat",
        "/api/ai/suggest-lesson",
        "/api/ai/generate-textbook-chapter",
        "/api/ai/image/generate-or-edit",
        "/api/ai/video/generate",
        "/api/ai/video/status",
        "/api/ai/video/download",
        "/api/health"
      ]
    });
  });

  // Global error handler middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[Global Server Error Handler]:", err);
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json");
      res.status(500).json({
        success: false,
        error: err?.message || "An unexpected server error occurred.",
        details: err?.code || "INTERNAL_SERVER_ERROR"
      });
    }
  });

  return app;
}
