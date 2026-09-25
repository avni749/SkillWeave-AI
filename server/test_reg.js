import { registerSchema } from './src/validators/authValidator.js';
import bcrypt from 'bcryptjs';

async function test() {
  try {
    const data = {
      name: "Avni",
      email: "avni.test@example.com",
      password: "TestPass123!"
    };
    
    const validatedData = registerSchema.parse(data);
    console.log('Validation success:', validatedData);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    console.log('Hash success:', hashedPassword);
    
  } catch(e) {
    console.error(e);
  }
}

test();
