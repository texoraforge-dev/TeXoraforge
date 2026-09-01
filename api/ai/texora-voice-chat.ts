/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey, callGeminiWithSmartFallback, synthesizeTexoraVoiceResponse } from "../../src/serverCore";

export default async function handler(req: any, res: any) {
  // Set CORS & JSON headers
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

  const { prompt, conversationHistory } = body || {};
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "A valid prompt string is required." });
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.warn("[Texora Voice API]: No GEMINI_API_KEY detected on host. Using built-in Texora intelligence synthesizer.");
    const fallbackResponse = synthesizeTexoraVoiceResponse(prompt);
    return res.status(200).json({
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

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const systemInstruction = `You are Texora, an intelligent, empathetic, highly articulate, and omni-knowledgeable AI Voice and Educational Companion for schools, teachers, students, parents, and school administrators.
You speak clearly, warmly, accurately, and authoritatively with an American female persona.
When answering academic questions:
- Provide rigorous, step-by-step clarity (in mathematics, physics, biology, chemistry, literature, history, and exams like WAEC/NECO/JAMB/IGCSE/SAT).
- Format your response clearly with concise paragraphs and bullet points if explaining steps.
- Maintain an encouraging, intellectual, and supportive tone.`;

    const contents: any[] = [];
    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-6)) {
        if (msg.sender === "user" && msg.text) {
          contents.push({ role: "user", parts: [{ text: msg.text }] });
        } else if (msg.sender === "ai" && msg.text) {
          contents.push({ role: "model", parts: [{ text: msg.text }] });
        }
      }
    }
    contents.push({ role: "user", parts: [{ text: prompt.trim() }] });

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

    return res.status(200).json({
      success: true,
      text: responseText,
      modelUsed,
      grounding: {
        searchQueries,
        searchChunks,
        isSearchGrounded: toolsUsed && searchChunks.length > 0
      }
    });
  } catch (error: any) {
    console.error("[Texora Voice API Serverless Error]:", error?.message || error);
    const fallbackResponse = synthesizeTexoraVoiceResponse(prompt);
    return res.status(200).json({
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
}
