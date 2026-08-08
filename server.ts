/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "TeXora Forge Academic Server" });
  });

  // AI Assistant endpoint using Gemini API
  app.post("/api/ai/suggest-lesson", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is missing. Please configure it in the Secrets panel."
        });
      }

      const { topic, className, subject, durationMinutes } = req.body;

      if (!topic || !className || !subject) {
        return res.status(400).json({ error: "Topic, Class, and Subject are required." });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are a master curriculum specialist for secondary and primary schools.
Generate a structured, highly pedagogical lesson note in JSON format for:
- Class: ${className}
- Subject: ${subject}
- Topic: ${topic}
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
  "summary": "string",
  "evaluationQuestions": ["string", "string"],
  "assignment": "string"
}

Ensure high academic standard, age-appropriate language, and clear student-teacher interactions. Do NOT wrap in markdown code blocks or extra text if possible, return raw JSON string.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let responseText = response.text || "";
      // Strip markdown code fences if present
      responseText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();

      const parsedData = JSON.parse(responseText);
      return res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error("Error generating lesson note:", error);
      return res.status(500).json({
        error: "Failed to generate lesson content with Gemini AI.",
        details: error.message
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TeXora Forge server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
