import prisma from '../config/prisma.js';

export const followUser = async (req, res) => {
  try {
    const { id: followingId } = req.params;
    const followerId = req.user.id;

    if (followerId === followingId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const userToFollow = await prisma.user.findUnique({ where: { id: followingId } });
    if (!userToFollow) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } }
    });

    if (existingFollow) {
      return res.status(400).json({ success: false, message: 'You are already following this user' });
    }

    await prisma.follow.create({
      data: { followerId, followingId }
    });

    res.status(200).json({ success: true, message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { id: followingId } = req.params;
    const followerId = req.user.id;

    const existingFollow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } }
    });

    if (!existingFollow) {
      return res.status(400).json({ success: false, message: 'You are not following this user' });
    }

    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } }
    });

    res.status(200).json({ success: true, message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: { select: { id: true, name: true, profile: { select: { profilePicture: true, bio: true } } } }
      }
    });

    res.status(200).json({ success: true, followers: followers.map(f => f.follower) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: { select: { id: true, name: true, profile: { select: { profilePicture: true, bio: true } } } }
      }
    });

    res.status(200).json({ success: true, following: following.map(f => f.following) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
