// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import prisma from '@prisma/client';
import { generateToken } from '../utils/generateToken.js';
import dotenv from 'dotenv';
import { sendEmail, forgotTemplate, confirmTemplate } from '../utils/email.js';

dotenv.config();
const { PrismaClient } = prisma;
const prismaClient = new PrismaClient();

export const register = async (req, res) => {
  const { name, email } = req.body;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await prismaClient.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya está registrado" });
    }

    // Crear nuevo usuario
    const newUser = await prismaClient.users.create({
      data: {
        name,
        email,
        role_id: 2, // Asignar el rol por defecto
      },
    });

    // Generar token de confirmación
    const token = generateToken(newUser);

    // Enviar correo de confirmación
    const template = confirmTemplate(newUser.name, token);
    await sendEmail(email, "CONFIRMACIÓN DE TU CUENTA VIRTU", template);

    // Respuesta exitosa
    res.status(201).json({
      name: newUser.name,
      role: newUser.role_id,
      id: newUser.id,
    });

  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ error: "Error al registrar usuario", details: error.message });
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

    res.status(200).json({ name: user.name, role: user.role_id, id: user.id, email: user.email, phone: user.phone });
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

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prismaClient.users.findUnique({ where: { email } });
    if (!user) {
      return res.send({ Status: "El usuario no existe" });
    }
    const token = generateToken(user);
    const template = forgotTemplate(user.name, token);
    await sendEmail(email, "CAMBIO DE CONTRASEÑA", template);
    return res.send({ Status: "correo de restablecimiento enviado" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ Status: "Error" });
  }
}

export const forgotHandler = async (req, res) => {
  const { password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 8);

    await prismaClient.users.update({
      where: { id: req.decoded.id }, // `userId` proviene del middleware
      data: { password: hash },
    });

    return res.json({ status: "Success", message: "Contraseña actualizada" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "Error", message: "Error al actualizar la contraseña" });
  }
};



