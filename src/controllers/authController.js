// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import prisma from '@prisma/client';
import { generateToken } from '../utils/generateToken.js';
import dotenv from 'dotenv';

dotenv.config();
const { PrismaClient } = prisma;
const prismaClient = new PrismaClient();

export const register = async (req, res) => {
    const { name, email} = req.body;
    const password = '1234';
    console.log(name,email);
    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        const user = await prismaClient.users.create({ // Ensure 'users' is the correct model name
            data: {
                name,
                email,
                password: hashedPassword,
                role_id: 2,
            },
        });
    
        res.status(201).json({name: user.name, role: user.role_id, id: user.id  });
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

    res.status(200).json({ name: user.name, role: user.role_id, id: user.id, email: user.email, phone: user.phone});
  } catch (error) {
    res.status(500).send('Server error');
    console.error(error);
  }
};


export const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  });
  res.status(200).send('Logout successful');
};

export const forgotPasswrod = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prismaClient.users.findUnique({where: { email }});
    if (!user) {
      return res.send({ Status: "El usuario no existe" });
    }
    const token = jwt.sign({ id: user.id, username: user.name }, JWT_SECRET, { expiresIn: "10m" });
    res.cookie("token", token);
    // Enviar el email
    const template = forgotTemplate(user.name,user.id,token);
    await sendEmail(email, "CAMBIO DE CONTRASEÑA", template );
    return res.send({ Status: "Cambio de contraseña exitoso" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ Status: "Error" });
  }
}

export const forgotHandler = async (req,res) =>{
  const {id, token} = req.params
    const {password} = req.body
  try {
    const decoded = await jwt.verify(token, JWT_SECRET);
    if (decoded) {
      const hash = await bcrypt.hash(password, 10);
      await prismaClient.users.update({where: { id }, data: { password: hash }});
      return res.send({ Status: "Success" });
    } else {
      return res.json({ Status: "Error with token" });
    }
  } catch (error) {
    console.log(error);
    return res.send({ Status: "Error" });
  }
}
