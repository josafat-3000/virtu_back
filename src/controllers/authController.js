import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Ensure this import is present
import prisma from '@prisma/client';
import { generateToken } from '../utils/generateToken.js';

const { PrismaClient } = prisma;
const prismaClient = new PrismaClient();

export const register = async (req, res) => {
    const { name, email, password, role_id } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        const user = await prismaClient.users.create({ // Ensure 'users' is the correct model name
            data: {
                name,
                email,
                password: hashedPassword,
                role_id,
            },
        });

        const token = generateToken(user);
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send({ error: 'Error registering user' });
        console.error(error);
    }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prismaClient.users.findUnique({ where: { email } }); // Ensure 'users' is the correct model name
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign( // Use the jwt object
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).send('Server error');
    console.error(error);
  }
};