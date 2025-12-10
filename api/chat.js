import OpenAI from "openai";

// Read API key from Vercel environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const clientEmotions = req.body?.emotions || [];

    console.log(clientEmotions);
    const backendData = {
      question: "You are an expert animal-behavior annotator. Analyze the pet's emotions ONLY based on the numeric counts provided. 1. Identify the top 1–2 emotions with the highest counts. 2. Explain briefly how the pet feels from those emotions. 3. Give one short suggestion to improve or support its behavior. ตอบเป็นภาษาไทยแบบสั้น กระชับ และอิงตามตัวเลขเท่านั้น ห้ามตอบว่าข้อมูลไม่ชัดเจนถ้ามีตัวเลขมากกว่า 0 ",
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
