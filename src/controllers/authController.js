import bcrypt from 'bcryptjs';
import prisma from '@prisma/client';
import {generateToken} from '../utils/generateToken.js';

const { PrismaClient } = prisma;
const prismaClient = new PrismaClient();

export const register = async (req, res) => {
    const { name, email, password, role_id } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        const user = await prismaClient.user.create({
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
    }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).send('Server error');
  }
};
