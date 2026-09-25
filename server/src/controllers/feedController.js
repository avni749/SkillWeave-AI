import prisma from '../config/prisma.js';

export const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user.id;

    // Get list of users the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });

    const followingIds = following.map(f => f.followingId);
    
    // Always include their own posts in their feed
    followingIds.push(userId);

    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: followingIds }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, profile: { select: { profilePicture: true, targetRole: true } } } },
        _count: { select: { likes: true, comments: true } }
      }
    });

    const total = await prisma.post.count({
      where: {
        authorId: { in: followingIds }
      }
    });

    res.status(200).json({
      success: true,
      posts,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Feed Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
