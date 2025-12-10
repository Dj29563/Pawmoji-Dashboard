import OpenAI from "openai";

// Read API key from Vercel environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const clientEmotions = req.body?.emotions || [];

    const backendData = {
      question: "You are an expert animal behavior annotator. Review this pet's emotions data and explain how it feels and how to improve its behavior. ตอบสั้นๆ เป็นภาษาไทย",
      pet: {
        emotions: clientEmotions
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
