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
      question: "You are an expert animal-behavior annotator. Analyze the pet's emotions ONLY from the numeric counts provided. Identify the 1–2 emotions with the highest counts and infer the pet's overall feeling from those emotions. Then give one short suggestion to improve or support its behavior. ตอบเป็นภาษาไทยแบบสั้นและกระชับ อธิบายตามความหมายของอารมณ์เท่านั้น ห้ามตอบเป็นข้อๆ ห้ามแจ้งตัวเลข ห้ามบอกว่าข้อมูลไม่ชัดเจนถ้ามีอารมณ์ที่มีค่ามากกว่า 0 อย่างน้อยหนึ่งรายการ",
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
