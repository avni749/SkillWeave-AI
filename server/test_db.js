import prisma from './src/config/prisma.js';

async function testDb() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users:', users);
  } catch (e) {
    console.error('DB Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

testDb();
