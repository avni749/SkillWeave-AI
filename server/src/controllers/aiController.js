import prisma from '../config/prisma.js';
import { GoogleGenAI } from '@google/genai';
import { profileAnalysisSchema } from '../validators/aiValidator.js';

export const analyzeProfile = async (req, res) => {
  try {
    const { targetRole, careerGoals, projects } = profileAnalysisSchema.parse(req.body);
    const userId = req.user.id;

    // Fetch user's profile and skills
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        userSkills: { include: { skill: true } }
      }
    });

    if (!user.profile) {
      return res.status(400).json({ success: false, message: 'Please create a profile before requesting an analysis.' });
    }

    const currentSkills = user.userSkills.map(us => `${us.skill.name} (${us.level || 'Beginner'})`);
    
    const inputSnapshot = {
      skills: currentSkills,
      education: user.profile.education || 'Not provided',
      experience: user.profile.experience || 'Not provided',
      projects: projects || 'Not provided',
      targetRole,
      careerGoals: careerGoals || 'Not provided'
    };

    const prompt = `
      You are an expert technical recruiter and career coach.
      Analyze the following developer profile against the target job role: "${targetRole}".

      Current Skills: ${inputSnapshot.skills.join(', ')}
      Education: ${inputSnapshot.education}
      Experience: ${inputSnapshot.experience}
      Projects: ${inputSnapshot.projects}
      Career Goals: ${inputSnapshot.careerGoals}

      Provide your analysis strictly as a JSON object with the following schema:
      {
        "profileSummary": "A short summary of their current standing.",
        "strengths": ["strength 1", "strength 2"],
        "relevantSkills": ["skill 1", "skill 2"],
        "skillGaps": ["gap 1", "gap 2"],
        "learningRoadmap": ["step 1", "step 2"],
        "projectRecommendations": ["project idea 1", "project idea 2"],
        "bioSuggestions": ["bio option 1"]
      }

      Respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json.
    `;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_actual_gemini_api_key_here') {
      return res.status(500).json({ success: false, message: 'Server is missing a valid GEMINI_API_KEY.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Call AI provider
    let aiResponseText;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });
      aiResponseText = response.text;
    } catch (aiError) {
      console.error('AI Provider Error:', aiError);
      return res.status(502).json({ success: false, message: 'Failed to communicate with AI provider. Please try again later.' });
    }

    // Validate and Parse JSON
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponseText);
      
      // Basic validation of the AI output structure
      const requiredFields = ['profileSummary', 'strengths', 'relevantSkills', 'skillGaps', 'learningRoadmap', 'projectRecommendations', 'bioSuggestions'];
      for (const field of requiredFields) {
        if (!analysisResult[field]) {
          throw new Error(`Missing expected field: ${field}`);
        }
      }
    } catch (parseError) {
      console.error('AI Output Validation Error:', parseError);
      return res.status(500).json({ success: false, message: 'AI returned an invalid response format. Please try again.' });
    }

    // Store in DB
    const profileAnalysis = await prisma.profileAnalysis.create({
      data: {
        userId,
        targetRole,
        inputSnapshot,
        analysisResult
      }
    });

    res.status(201).json({
      success: true,
      data: profileAnalysis,
      disclaimer: 'AI recommendations are auto-generated for guidance purposes only and do not guarantee employment or career progression.'
    });

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error('Profile Analysis Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAnalysisHistory = async (req, res) => {
  try {
    const history = await prisma.profileAnalysis.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAnalysisById = async (req, res) => {
  try {
    const analysis = await prisma.profileAnalysis.findUnique({
      where: { id: req.params.id }
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    if (analysis.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this analysis' });
    }

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await prisma.profileAnalysis.findUnique({
      where: { id: req.params.id }
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    if (analysis.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this analysis' });
    }

    await prisma.profileAnalysis.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({ success: true, message: 'Analysis deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
