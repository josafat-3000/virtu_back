import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Ensure this import is present
import prisma from '@prisma/client';
import { generateToken } from '../utils/generateToken.js';

const { PrismaClient } = prisma;
const prismaClient = new PrismaClient();

export const register = async (req, res) => {
    const { name, email, password, role_id} = req.body;

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
        res.cookie('token', token, {
          httpOnly: true, // Previene el acceso desde JavaScript
          secure: process.env.NODE_ENV === 'production', // Solo se envía por HTTPS en producción
          sameSite: 'strict', // Previene ataques CSRF
          maxAge: 3600000 // 1 hora
        });
    
        res.status(201).json({ name: user.name, role: user.role_id, id: user.id });
    } catch (error) {
        res.status(400).send({ error: 'Error registering user', err: `${error}` });
        console.error(error);
    }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prismaClient.users.findUnique({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Invalid credentials');
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true, // Previene el acceso desde JavaScript
      secure: process.env.NODE_ENV === 'production', // Solo se envía por HTTPS en producción
      sameSite: 'strict', // Previene ataques CSRF
      maxAge: 3600000 // 1 hora
    });

    res.status(200).json({ name: user.name, role: user.role_id, id: user.id });
  } catch (error) {
    res.status(500).send('Server error');
    console.error(error);
  }
};

// src/controllers/authController.js
export const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  });
  res.status(200).send('Logout successful');
};
