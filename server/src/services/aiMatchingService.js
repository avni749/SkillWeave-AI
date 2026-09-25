import { GoogleGenAI } from '@google/genai';

export const generateMatchExplanation = async (currentUser, recommendedUser) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_actual_gemini_api_key_here') {
      return "Match found based on shared technical skills and project interests.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Create summarized profiles for AI
    const userA = {
      skills: currentUser.userSkills?.map(us => us.skill.name) || [],
      goals: currentUser.collaborationPreference?.collaborationGoals || [],
      interests: currentUser.collaborationPreference?.projectInterests || []
    };

    const userB = {
      skills: recommendedUser.userSkills?.map(us => us.skill.name) || [],
      goals: recommendedUser.collaborationPreference?.collaborationGoals || [],
      interests: recommendedUser.collaborationPreference?.projectInterests || []
    };

    const prompt = `
      You are an AI developer matching assistant. Explain in 1-2 short sentences why these two developers might be a good fit to collaborate.
      Base it strictly on their skills and interests. Do not invent any information. Do not mention personal characteristics.
      
      User 1:
      Skills: ${userA.skills.join(', ') || 'Various'}
      Goals: ${userA.goals.join(', ') || 'General collaboration'}
      Interests: ${userA.interests.join(', ') || 'Software projects'}
      
      User 2:
      Skills: ${userB.skills.join(', ') || 'Various'}
      Goals: ${userB.goals.join(', ') || 'General collaboration'}
      Interests: ${userB.interests.join(', ') || 'Software projects'}
      
      Return only the explanation text. No markdown or conversational filler.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error('AI Matching Error:', error.message);
    // Fallback if AI fails or times out
    return "These developers share complementary technical skills or project interests that align for potential collaboration.";
  }
};
