import * as bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Example of how to create a user with a hashed password:
/*
const hashedPassword = await hashPassword(password);
const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name,
    role
  }
});
*/
