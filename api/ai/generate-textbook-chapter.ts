/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey, callGeminiWithSmartFallback, synthesizeTextbookChapter } from "../../src/serverCore";

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

  const { bookTitle, subject, chapterNumber, chapterTitle, gradeLevel } = body || {};

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    const fallback = synthesizeTextbookChapter(bookTitle, subject, chapterNumber, chapterTitle, gradeLevel);
    return res.status(200).json({ success: true, chapter: fallback });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a distinguished author and educational curriculum expert. Write a comprehensive, rigorous, and beautifully formatted academic textbook chapter.

Book Title: ${bookTitle || "Comprehensive Standard Curriculum Textbook"}
Subject: ${subject || "General Science & Mathematics"}
Chapter Number: ${chapterNumber || 1}
Chapter Title: ${chapterTitle || "Foundations and Mechanisms"}
Grade Level: ${gradeLevel || "Senior Secondary"}

Generate a JSON object matching this schema:
{
  "chapterNumber": ${chapterNumber || 1},
  "title": "${chapterTitle || "Chapter Title"}",
  "estimatedReadTime": "15 mins read",
  "summary": "Deep, 3-4 sentence comprehensive chapter overview and core pedagogical learning outcomes.",
  "keyConcepts": ["Key concept 1", "Key concept 2", "Key concept 3", "Key concept 4"],
  "formulasOrRules": ["Important Formula or Governing Rule 1", "Rule 2"],
  "contentSections": [
    {
      "heading": "1. Section Heading",
      "subheading": "Detailed Sub-heading",
      "body": "Thorough, rigorous textbook prose explaining theory, context, historical importance, and foundational mechanisms in depth (at least 3 detailed paragraphs).",
      "keyTakeaway": "Concise summary takeaway for students.",
      "workedExamples": [
        {
          "problem": "Clear problem statement matching examination standards.",
          "stepStepSolution": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
          "answer": "Final verified solution with correct units."
        }
      ]
    },
    {
      "heading": "2. Advanced Mechanisms & Mathematical Analysis",
      "subheading": "Core Analysis",
      "body": "Exhaustive breakdown of formulas, variables, and step-by-step logic.",
      "keyTakeaway": "Core analytical insight."
    },
    {
      "heading": "3. Real-World Applications & Technological Impact",
      "subheading": "Industry & Contemporary Applications",
      "body": "Real-world engineering, scientific, economic, or cultural applications of this chapter's subject matter.",
      "keyTakeaway": "Practical relevance."
    }
  ],
  "reviewQuestions": [
    {
      "question": "Rigorous Multiple Choice Question 1?",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation why A is correct.",
      "type": "MULTIPLE_CHOICE"
    },
    {
      "question": "Rigorous Multiple Choice Question 2?",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": "B",
      "explanation": "Detailed explanation why B is correct.",
      "type": "MULTIPLE_CHOICE"
    }
  ]
}`;

    const { response } = await callGeminiWithSmartFallback(ai, {
      models: ["gemini-3.1-flash-lite", "gemini-3.7-flash", "gemini-flash-latest"],
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.status(200).json({ success: true, chapter: parsed });
  } catch (error: any) {
    console.error("[Generate Textbook Chapter Error]:", error?.message || error);
    const fallback = synthesizeTextbookChapter(bookTitle, subject, chapterNumber, chapterTitle, gradeLevel);
    return res.status(200).json({ success: true, chapter: fallback });
  }
}
