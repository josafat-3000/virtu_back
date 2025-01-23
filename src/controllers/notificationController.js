import prisma from '@prisma/client';


const { PrismaClient } = prisma;
const prismaClient = new PrismaClient();

// Create a new notification
export const createNotification = async (req, res) => {
    const { visit_id, notification_type } = req.body;
    const user_id = req.user.id; // Assume user ID is available from authentication middleware

    try {
        const notification = await prismaClient.notifications.create({
            data: {
                user_id,
                visit_id,
                notification_type,
            },
        });

        res.status(201).send(notification);
    } catch (error) {
        res.status(400).send({ error: 'Error creating notification' });
    }
};

// Get all notifications for a user
export const getNotifications = async (req, res) => {
    const user_id = req.user.id; // Assume user ID is available from authentication middleware
    try {
        const notifications = await prismaClient.notifications.findMany({
            where: { user_id: user_id },
        });

        res.send(notifications);
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: 'Error fetching notifications' });
    }
};

// Get a specific notification by ID
export const getNotificationById = async (req, res) => {
    const { id } = req.params;

    try {
        const notification = await prismaClient.notifications.findUnique({
            where: { id: parseInt(id, 10) },
            include: { visit: true }, // Include visit details if needed
        });

        if (!notification) {
            return res.status(404).send({ error: 'Notification not found' });
        }

        res.send(notification);
    } catch (error) {
        res.status(500).send({ error: 'Error fetching notification' });
    }
};

// Update a notification's read status
export const updateNotificationStatus = async (req, res) => {
    const { id } = req.params;
    const { read_at } = req.body;

    try {
        const notification = await prismaClient.notifications.update({
            where: { id: parseInt(id, 10) },
            data: { read_at },
        });

        res.send(notification);
    } catch (error) {
        res.status(400).send({ error: 'Error updating notification status' });
    }
};

let clients = {}; // Usamos un objeto para almacenar conexiones por user_id

export const sseHandler = (req, res) => {
    const user_id = req.user.id; // Asume que el user_id está disponible en la solicitud

    // Configurar las cabeceras SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');


    // Almacenar la conexión en el objeto de clientes por user_id
    clients[user_id] = res;

    // Limpiar la conexión cuando se cierra
    req.on('close', () => {
        delete clients[user_id];
    });
};

// Función para enviar notificaciones a un cliente específico
export const sendNotificationToUser = (user_id, notification) => {
    const client = clients[user_id];

    if (client) {
        client.write(`data: ${JSON.stringify(notification)}\n\n`);
    } else {
        console.log(`No hay cliente conectado con user_id: ${user_id}`);
    }
};