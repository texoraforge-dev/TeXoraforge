/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey, callGeminiWithSmartFallback, synthesizeStructuredLesson } from "../../src/serverCore";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { topic, className, subject, durationMinutes, prompt: customPrompt, subTopic } = body || {};
  const effectiveTopic = topic || "Academic Topic";
  const effectiveSubject = subject || "General Subject";
  const effectiveClass = className || "Secondary Class";

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    const synth = synthesizeStructuredLesson(effectiveTopic, effectiveSubject, effectiveClass, subTopic);
    return res.status(200).json({ success: true, data: synth, suggestions: synth });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = `You are a Senior Academic Curriculum Specialist and Master Teacher for secondary schools.
Generate an exhaustive, highly structured, standards-compliant Lesson Note for:
- Subject: ${effectiveSubject}
- Class: ${effectiveClass}
- Main Topic: ${effectiveTopic}
- Sub-Topic: ${subTopic || effectiveTopic}
- Duration: ${durationMinutes || 45} minutes
- Teacher Request/Context: ${customPrompt || "Comprehensive curriculum-aligned lesson plan"}

Return ONLY a valid JSON object matching this schema:
{
  "subTopic": string,
  "behavioralObjectives": string[],
  "instructionalMaterials": string[],
  "introduction": string,
  "coreContentSteps": [
    { "stepNumber": number, "title": string, "teacherActivity": string, "studentActivity": string }
  ],
  "summary": string,
  "keyPoints": string[],
  "evaluationQuestions": string[],
  "assignment": string
}`;

    const { response } = await callGeminiWithSmartFallback(ai, {
      models: ["gemini-3.1-flash-lite", "gemini-3.7-flash", "gemini-flash-latest"],
      contents: systemPrompt,
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.status(200).json({ success: true, data: parsed, suggestions: parsed });
  } catch (error: any) {
    console.error("[Suggest Lesson API Error]:", error?.message || error);
    const synth = synthesizeStructuredLesson(effectiveTopic, effectiveSubject, effectiveClass, subTopic);
    return res.status(200).json({
      success: true,
      data: synth,
      suggestions: synth,
      notice: "Generated using built-in curriculum intelligence."
    });
  }
}
