import OpenAI from "openai";

// Read API key from Vercel environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    // Correctly define backend data as an object
    const backendData = {
      question: "You are an expert animal behavior annotator. Review this pet's emotions data and explain how it feels and how to improve its behavior. ตอบสั้นๆ เป็นภาษาไทย",
      pet: {
        name: "Buddy",
        emotions: [
          { emotion: "เชื่อใจ", count: 20 },
          { emotion: "มีความสุข", count: 20 }
        ]
      }
    };

    // Send backend data to ChatGPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: JSON.stringify(backendData) }
      ]
    });

    const reply = completion.choices[0].message.content;

    // Always return JSON
    res.status(200).json({ reply });

  } catch (err) {
    console.error(err);
    // Always return JSON on error
    res.status(500).json({ error: err.message || "Unknown server error" });
  }
}
