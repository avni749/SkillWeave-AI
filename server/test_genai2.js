import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function testAI() {
  try {
    process.env.GEMINI_API_KEY = 'fake-key';
    const ai = new GoogleGenAI(); // No arguments passed
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Say hello",
    });
    console.log('Response:', response.text);
  } catch (error) {
    console.error('AI Error:', error.message);
  }
}

testAI();
