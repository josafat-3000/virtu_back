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

 const sendEmail = async (to, subject, text, html) => {
      try {
        await transporter.sendMail({
          from: `"Notificaciones" <${process.env.GMAIL_USER}>`,
          to,
          subject,
          text,
          html,
        });
        console.log('Correo enviado exitosamente a:', to);
      } catch (error) {
        console.error('Error al enviar el correo:', error);
      }
    };

    export default sendEmail;