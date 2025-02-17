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
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
};

export const confirmTemplate = (name, token) => {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmación de Cuenta</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .header {
                    background:rgb(0,73,126);
                    color: white;
                    padding: 15px;
                    font-size: 20px;
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                }
                .content {
                    font-size: 16px;
                    color: #333333;
                    line-height: 1.6;
                    padding: 20px;
                }
                .button {
                    display: inline-block;
                    background: #00497E;
                    color: white;
                    padding: 12px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                    font-size: 16px;
                }
                .footer {
                    text-align: center;
                    padding: 15px;
                    font-size: 14px;
                    color: #777777;
                }
                a{
                color:rgb(255, 255, 255) !important;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">Confirmación de Cuenta</div>
                <div class="content">
                    <h2>Hola ${name},</h2>
                    <p>Para confirmar tu cuenta y crear tu contraseña, haz clic en el siguiente botón:</p>
                    <a href="${process.env.FRONTEND_URL}/confirm/${token}" target="_blank" class="button">Confirmar Cuenta</a>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Virtu</p>
                </div>
            </div>
        </body>
        </html>
      `;
}

export const forgotTemplate = (name, token) => {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Restablecer Contraseña</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                .header {
                    background:rgb(0,73,126);
                    color: white;
                    padding: 15px;
                    font-size: 20px;
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                }
                .content {
                    font-size: 16px;
                    color: #333333;
                    line-height: 1.6;
                    padding: 20px;
                }
                .button {
                    display: inline-block;
                    background: #00497E;
                    color: white;
                    padding: 12px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                    font-size: 16px;
                }
                .footer {
                    text-align: center;
                    padding: 15px;
                    font-size: 14px;
                    color: #777777;
                }
                a{
                color:rgb(255, 255, 255) !important;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">Restablecer Contraseña</div>
                <div class="content">
                    <h2>Hola ${name},</h2>
                    <p>Para cambiar tu contraseña, haz clic en el siguiente botón:</p>
                    <a href="${process.env.FRONTEND_URL}/reset/${token}" target="_blank" class="button">Cambiar Contraseña</a>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Vrtu.</p>
                </div>
            </div>
        </body>
        </html>
      `;
}