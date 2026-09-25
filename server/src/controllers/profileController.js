import prisma from '../config/prisma.js';
import { profileSchema } from '../validators/profileValidator.js';

export const createProfile = async (req, res) => {
  try {
    const validatedData = profileSchema.parse(req.body);
    const { skills, ...profileData } = validatedData;
    const userId = req.user.id;

    const existingProfile = await prisma.profile.findUnique({ where: { userId } });
    if (existingProfile) {
      return res.status(400).json({ success: false, message: 'Profile already exists' });
    }

    const profile = await prisma.profile.create({
      data: {
        ...profileData,
        userId
      }
    });

    if (skills && skills.length > 0) {
      for (const skill of skills) {
        const skillRecord = await prisma.skill.upsert({
          where: { name: skill.name },
          update: {},
          create: { name: skill.name }
        });
        
        await prisma.userSkill.create({
          data: {
            userId,
            skillId: skillRecord.id,
            level: skill.level || 'Beginner'
          }
        });
      }
    }

    res.status(201).json({ success: true, profile });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error('Create Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { name: true, email: true, userSkills: { include: { skill: true } } } }
      }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const validatedData = profileSchema.parse(req.body);
    const { skills, ...profileData } = validatedData;
    const userId = req.user.id;

    let profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile = await prisma.profile.update({
      where: { userId },
      data: profileData
    });

    if (skills) {
      // Clear existing skills for user
      await prisma.userSkill.deleteMany({ where: { userId } });

      for (const skill of skills) {
        const skillRecord = await prisma.skill.upsert({
          where: { name: skill.name },
          update: {},
          create: { name: skill.name }
        });
        
        await prisma.userSkill.create({
          data: {
            userId,
            skillId: skillRecord.id,
            level: skill.level || 'Beginner'
          }
        });
      }
    }

    const updatedProfile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, userSkills: { include: { skill: true } } } }
      }
    });

    res.status(200).json({ success: true, profile: updatedProfile });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, userSkills: { include: { skill: true } } } }
      }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Get Profile By Id Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const searchProfiles = async (req, res) => {
  try {
    const { name, skills, targetRole, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (targetRole) {
      where.targetRole = { contains: targetRole, mode: 'insensitive' };
    }

    if (name || skills) {
      where.user = {};
      if (name) {
        where.user.name = { contains: name, mode: 'insensitive' };
      }
      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
        where.user.userSkills = {
          some: {
            skill: {
              name: { in: skillsArray, mode: 'insensitive' }
            }
          }
        };
      }
    }

    const profiles = await prisma.profile.findMany({
      where,
      skip,
      take,
      include: {
        user: { select: { id: true, name: true, userSkills: { include: { skill: true } } } }
      }
    });

    const total = await prisma.profile.count({ where });

    res.status(200).json({
      success: true,
      count: profiles.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
      profiles
    });
  } catch (error) {
    console.error('Search Profiles Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
