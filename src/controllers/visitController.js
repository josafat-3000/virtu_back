import prisma from '@prisma/client';
import { sendEmail } from '../utils/email.js';
import { sendNotificationToUser } from './notificationController.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);


const { PrismaClient } = prisma;
const prismaClient = new PrismaClient();

export const createVisit = async (req, res) => {
    const { visitor_name, visitor_company, visit_reason, visit_material, vehicle, vehicle_model, vehicle_plate, status } = req.body;
    try {
        const visit = await prismaClient.visits.create({
            data: {
                visitor_name,
                visitor_company,
                visit_reason,
                visit_material,
                vehicle,
                vehicle_model,
                vehicle_plate,
                status,
                user_id: req.user.id,
                validated: true // Bandera inicializada como validada
            },
        });

        res.status(201).send(visit);
    } catch (error) {
        res.status(400).send({ error: 'Error creating visit' });
    }
};

export const createVisitFromLink = async (req, res) => {
    const {
        visitor_name,
        visitor_company,
        visit_reason,
        visit_material,
        vehicle,
        vehicle_model,
        vehicle_plate,
        status,
        token
    } = req.body;
    // 2. Validación de campos requeridos
    if (!visitor_name) {
        return res.status(400).json({
            success: false,
            error: 'El nombre del visitante es requerido'
        });
    }

    let decoded;
    try {
        // 1. Verificar el token    
        decoded = await prismaClient.uploadLink.findUnique({
            where: { id: token },
        });
        if (!decoded) {
            return res.status(400).json({
                success: false,
                error: 'Token inválido'
            });
        }
    }
    catch (error) {
        console.error('Error Id token not found:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al buscar el token'
        });
    }

    // 3. Creación de la visita y actualización del uploadLink para relacionarlos
    try {
        // Crear la visita
        const visit = await prismaClient.visits.create({
            data: {
                visitor_name,
                visitor_company,
                visit_reason,
                visit_material,
                vehicle: vehicle || false,
                vehicle_model: vehicle ? vehicle_model : null,
                vehicle_plate: vehicle ? vehicle_plate : null,
                status: status || 'pending',
                user_id: decoded.createdById,
            },
        });

        // Relacionar el uploadLink con la visita creada
        await prismaClient.uploadLink.update({
            where: { id: token },
            data: {
                visitId: visit.id
            }
        });

        return res.status(201).json({
            success: true,
            data: {
                visit,
                token
            }
        });

    } catch (error) {
        console.error('Error creating visit:', error);

        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                error: 'Conflicto de datos únicos',
                details: error.meta
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Error interno al crear la visita',
            details: error.message
        });
    }
};

export const updateVisit = async (req, res) => {
    const { id } = req.params;
    const dataToUpdate = req.body; // Solo actualizar lo que se envía
    console.log(dataToUpdate)
    try {
        const visit = await prismaClient.visits.update({
            where: { id: parseInt(id) }, // Asegurar que sea un número
            data: dataToUpdate, // Solo los campos proporcionados
        });

        res.status(200).send(visit);
    } catch (error) {
        console.log(error)
        res.status(400).send({ error: 'Error updating visit' });
    }
};


export const getVisits = async (req, res) => {

    try {
        if (req.user.role != 2) {
            const visits = await prismaClient.visits.findMany({
                where: { validated: true } // Solo visitas validadas
            });
            res.send(visits);
        } else {
            const visits = await prismaClient.visits.findMany({
                where: { user_id: req.user.id, validated: true }, // Solo visitas validadas del usuario
            });
            res.send(visits);
        }
    } catch (error) {
        res.status(500).send({ error: 'Error fetching visits' });
    }
};

export const getVisitById = async (req, res) => {
    const { id } = req.params;

    try {
        const visit = await prismaClient.visits.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!visit) {
            return res.status(404).send({ error: 'Visit not found' });
        }

        res.send(visit);
    } catch (error) {
        res.status(500).send({ error: 'Error fetching visit' });
    }
};

export const updateVisitStatus = async (req, res) => {
    console.log("entra update")
    const { id } = req.params;

    try {
        const visit = await prismaClient.visits.findUnique({
            where: { id: parseInt(id, 10) },
        });

        const remitente = await prismaClient.users.findUnique({
            where: { id: parseInt(visit.user_id, 10) }
        })


        if (!visit) {
            return res.status(404).send({ error: 'Visit not found' });
        }

        let newStatus = '';
        if (visit.status === 'pending') {
            newStatus = 'in_progress';
        } else if (visit.status === 'in_progress') {
            newStatus = 'completed';
        } else {
            return res.status(400).send({ error: 'Invalid status transition' });
        }

        const updatedVisit = await prismaClient.visits.update({
            where: { id: parseInt(id, 10) },
            data: {
                status: newStatus,
                updated_at: new Date(),
            },
        });
        if (newStatus === 'completed') {
            const message = `La visita con ID ${id} ha sido completada.`;
            await prismaClient.notifications.create({
                data: { visit_id: visit.id, user_id: visit.user_id, notification_type: 'check_out' },
            });

            // Enviar la notificación a través de SSE
            sendNotificationToUser(remitente.id, message);
        } else if (newStatus === 'in_progress') {
            const message = `La visita con ID ${id} ha ingresado.`;
            await prismaClient.notifications.create({
                data: { visit_id: visit.id, user_id: visit.user_id, notification_type: 'check_in' },
            });

            // Enviar la notificación a través de SSE
            sendNotificationToUser(remitente.id, message);
        }

        const state = newStatus == 'in_progress' ? 'Registro de ingreso' : 'Registro de salida'
        const subject = `Notificación de Visita `;
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Notificación de Visita</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              text-align: center;
              padding: 20px;
            }
            .header {
              background-color:  #00497E;;
              color: #fff;
              padding: 15px;
              border-top-left-radius: 8px;
              border-top-right-radius: 8px;
              font-size: 20px;
            }
            .content {
              font-size: 16px;
              color: #333;
              margin: 20px 0;
            }
            .footer {
              font-size: 14px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Notificación de Visita</div>
            <div class="content">
              <p> <strong>${visit.visitor_name}</strong> ha registrado el evento: <strong>${state}</strong>.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Virtu</p>
            </div>
          </div>
        </body>
        </html>
      `;


        const recipientEmail = remitente.email; // Cambia a la dirección del destinatario
        sendEmail(recipientEmail, subject, html);
        res.send(updatedVisit);
    } catch (error) {
        console.error(error);
        res.status(400).send({ error: 'Error updating visit status' });
    }
};


export const contVisit = async (req, res) => {
    try {
        // Realizamos la consulta a la base de datos
        const visitCounts = await prismaClient.visits.groupBy({
            by: ['status'],
            _count: {
                _all: true,
            },
            where: {
                status: {
                    in: ['pending', 'in_progress'],
                },
            },
        });

        // Formateamos la respuesta para que sea más clara
        const response = {
            pending: visitCounts.find(item => item.status === 'pending')?._count?._all || 0,
            in_progress: visitCounts.find(item => item.status === 'in_progress')?._count?._all || 0,
        };

        // Enviamos la respuesta al cliente
        res.status(200).json(response);
    } catch (error) {
        // Manejo de errores y registro en consola para depuración
        console.error('Error fetching visit counts:', error);
        res.status(500).json({ error: 'Error fetching visit counts', err: error });
    }
};

export const linkVisit = async (req, res) => {
    try {
        const user_id = req.user.id;
        const token = uuidv4();
        const request = await prismaClient.uploadLink.create({
            data: {
                id: token,
                createdById: user_id,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
        });
        res.send({ link: `${token}` });
    } catch (error) {
        console.error('[generateInviteUrlController]', error);
        return res.status(500).json({ message: 'Error al generar la URL de acceso' });
    }
}