import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function testAI() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: "Say hello",
    });
    console.log('Response:', response.text);
  } catch (error) {
    console.error('AI Error:', error.message);
  }
}

testAI();
