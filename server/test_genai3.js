import { GoogleGenAI } from '@google/genai';

async function testAI() {
  try {
    const ai = new GoogleGenAI(); // No API key
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
