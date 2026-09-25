import 'dotenv/config';
import { loginSchema } from './src/validators/authValidator.js';
import bcrypt from 'bcryptjs';
import prisma from './src/config/prisma.js';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from './src/utils/generateToken.js';

async function testLogin() {
  try {
    const data = {
      email: "avni.test@example.com",
      password: "TestPass123!"
    };
    
    const validatedData = loginSchema.parse(data);
    console.log('Validation success:', validatedData);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      console.log('User not found');
      return;
    }
    console.log('User found:', user.email);

    const isMatch = await bcrypt.compare(data.password, user.password);
    console.log('Password match:', isMatch);

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    console.log('Tokens generated');

    const decodedRefresh = jwt.decode(refreshToken);
    console.log('Decoded refresh:', decodedRefresh);
    
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(decodedRefresh.exp * 1000),
      },
    });
    console.log('Refresh token stored in DB');
    
  } catch(e) {
    console.error('Login Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
