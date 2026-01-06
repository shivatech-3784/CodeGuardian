import express from "express";
import cors from "cors";
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import Groq from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
//    Prompt Loader Function
// ===============================
async function loadPrompt(name) {
  const filePath = path.join(process.cwd(), "prompts", `${name}.txt`);
  return await fs.readFile(filePath, "utf8");
}
// ===============================
// GROQ AI Integration (Day 4)
// ===============================


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function askAI(systemPrompt, userPrompt) {
  const completion = await groq.chat.completions.create({
    model: process.env.MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.0,
  });

  return completion.choices[0]?.message?.content || "No response received.";
}


// ===============================
//       UPDATED API ROUTES 
// ===============================

app.post("/api/analyze", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "code and language are required" });
  }

  const system = await loadPrompt("analyze");
  const user = `Language: ${language}\n\nCode:\n${code}`;

  const result = await askAI(system, user);
  res.json({ result });
});

app.post("/api/tests", async (req, res) => {
  const { code, language, framework } = req.body;

  const system = await loadPrompt("tests");
  const user = `Language: ${language}\nFramework: ${framework}\n\nCode:\n${code}`;

  const result = await askAI(system, user);
  res.json({ result });
});

app.post("/api/optimize", async (req, res) => {
  const { code, language } = req.body;

  const system = await loadPrompt("optimize");
  const user = `Language: ${language}\n\nCode:\n${code}`;

  const result = await askAI(system, user);
  res.json({ result });
});

// ===============================
// 🔹 START SERVER
// ===============================
const PORT = 5050;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
