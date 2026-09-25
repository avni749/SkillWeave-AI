import prisma from '../config/prisma.js';
import { collaborationPreferenceSchema } from '../validators/matchingValidator.js';
import { generateMatchExplanation } from '../services/aiMatchingService.js';

export const updatePreferences = async (req, res) => {
  try {
    const data = collaborationPreferenceSchema.parse(req.body);
    const userId = req.user.id;

    const preference = await prisma.collaborationPreference.upsert({
      where: { userId },
      update: data,
      create: { ...data, userId }
    });

    res.status(200).json({ success: true, data: preference });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, message: error.errors[0].message });
    console.error('Update Preferences Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPreferences = async (req, res) => {
  try {
    const preference = await prisma.collaborationPreference.findUnique({
      where: { userId: req.user.id }
    });
    res.status(200).json({ success: true, data: preference || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const { page = 1, limit = 10, skill, technology, targetRole, interest } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const currentUserId = req.user.id;

    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: {
        userSkills: { include: { skill: true } },
        collaborationPreference: true,
        sentRequests: { select: { receiverId: true } },
        receivedRequests: { select: { senderId: true } }
      }
    });

    if (!currentUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Exclude self and users already interacted with
    const excludeUserIds = [
      currentUserId,
      ...currentUser.sentRequests.map(r => r.receiverId),
      ...currentUser.receivedRequests.map(r => r.senderId)
    ];

    const whereClause = {
      id: { notIn: excludeUserIds }
    };

    if (skill) whereClause.userSkills = { some: { skill: { name: { contains: skill, mode: 'insensitive' } } } };
    if (targetRole) whereClause.profile = { targetRole: { contains: targetRole, mode: 'insensitive' } };
    if (technology) whereClause.collaborationPreference = { preferredTechs: { has: technology } };
    if (interest) whereClause.collaborationPreference = { projectInterests: { has: interest } };

    // Fetch pool of potential matches
    const allEligibleMatches = await prisma.user.findMany({
      where: whereClause,
      include: {
        profile: { select: { bio: true, targetRole: true, profilePicture: true } },
        userSkills: { include: { skill: true } },
        collaborationPreference: true
      }
    });

    // Ranking algorithm based on overlap and complementary skills
    const mySkills = currentUser.userSkills.map(us => us.skill.name.toLowerCase());
    const myLookingFor = currentUser.collaborationPreference?.lookingForSkills.map(s => s.toLowerCase()) || [];
    const myInterests = currentUser.collaborationPreference?.projectInterests.map(i => i.toLowerCase()) || [];

    const scoredMatches = allEligibleMatches.map(match => {
      let score = 0;
      const matchSkills = match.userSkills.map(us => us.skill.name.toLowerCase());
      const matchLookingFor = match.collaborationPreference?.lookingForSkills.map(s => s.toLowerCase()) || [];
      const matchInterests = match.collaborationPreference?.projectInterests.map(i => i.toLowerCase()) || [];

      // Complementary: I have what they want
      score += matchLookingFor.filter(s => mySkills.includes(s)).length * 2;
      // Complementary: They have what I want
      score += matchSkills.filter(s => myLookingFor.includes(s)).length * 2;
      // Overlap: Shared project interests
      score += matchInterests.filter(i => myInterests.includes(i)).length;
      // Overlap: Shared skills (minor bonus)
      score += matchSkills.filter(s => mySkills.includes(s)).length * 0.5;

      return { ...match, score };
    });

    // Sort by score descending
    scoredMatches.sort((a, b) => b.score - a.score);

    // Apply pagination
    const paginatedMatches = scoredMatches.slice(skip, skip + take);

    // Generate explanations concurrently to save time
    const recommendations = await Promise.all(
      paginatedMatches.map(async (matchedUser) => {
        const explanation = await generateMatchExplanation(currentUser, matchedUser);
        return {
          id: matchedUser.id,
          name: matchedUser.name,
          profile: matchedUser.profile,
          skills: matchedUser.userSkills.map(us => us.skill.name),
          matchScore: matchedUser.score,
          explanation
        };
      })
    );

    res.status(200).json({
      success: true,
      data: recommendations,
      page: parseInt(page),
      totalPages: Math.ceil(scoredMatches.length / take)
    });
  } catch (error) {
    console.error('Recommendations Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user.id;

    if (senderId === receiverId) return res.status(400).json({ success: false, message: 'Cannot request yourself' });

    const existing = await prisma.collaborationRequest.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } }
    });

    if (existing) return res.status(400).json({ success: false, message: 'Request already sent' });

    const reverseExisting = await prisma.collaborationRequest.findUnique({
      where: { senderId_receiverId: { senderId: receiverId, receiverId: senderId } }
    });

    if (reverseExisting) return res.status(400).json({ success: false, message: 'User already requested you' });

    const request = await prisma.collaborationRequest.create({
      data: { senderId, receiverId }
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await prisma.collaborationRequest.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.receiverId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    const updated = await prisma.collaborationRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await prisma.collaborationRequest.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.receiverId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    const updated = await prisma.collaborationRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getIncomingRequests = async (req, res) => {
  try {
    const requests = await prisma.collaborationRequest.findMany({
      where: { receiverId: req.user.id, status: 'PENDING' },
      include: {
        sender: { select: { id: true, name: true, profile: { select: { targetRole: true, profilePicture: true } } } }
      }
    });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getOutgoingRequests = async (req, res) => {
  try {
    const requests = await prisma.collaborationRequest.findMany({
      where: { senderId: req.user.id },
      include: {
        receiver: { select: { id: true, name: true, profile: { select: { targetRole: true, profilePicture: true } } } }
      }
    });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
