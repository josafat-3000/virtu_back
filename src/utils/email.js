// utils/email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
// Configurar el transporte
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Tu correo Gmail
    pass: process.env.GMAIL_APP_PASSWORD, // Contraseña de aplicación
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Notificaciones" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Correo enviado exitosamente a:', to);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
};

export const confirmTemplate = (name, token) => {
  return `
        <div id="email___content">
            
            <h2>Hola ${name}</h2>
            <p>Para confirmar tu cuenta, ingresa al siguiente enlace</p>
            <a
                href="${process.env.FRONTEND_URL}/confirm/${token}"
                target="_blank"
            >Confirmar Cuenta</a>
        </div>
      `;
}
export const forgotTemplate = (name, id, token) => {
  return `
        <div id="email___content">
            
            <h2>Hola ${name}</h2>
            <p>Para cambiar tu contraseña, ingresa al siguiente enlace</p>
            <a
                href="${process.env.FRONTEND_URL}/forgot/${id}/${token}"
                target="_blank"
            >Cambiar contraseña</a>
        </div>
      `;
}