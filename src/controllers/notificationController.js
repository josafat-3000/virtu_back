import prisma from '@prisma/client';

const { PrismaClient } = prisma;
const prismaClient = new PrismaClient();

// Create a new notification
export const createNotification = async (req, res) => {
    const { visit_id, notification_type } = req.body;
    const user_id = req.user.id; // Assume user ID is available from authentication middleware

    try {
        const notification = await prismaClient.notification.create({
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
    try {
        const notifications = await prismaClient.notification.findMany({
            where: { user_id: req.user.id },
            include: { visit: true }, // Include visit details if needed
        });

        res.send(notifications);
    } catch (error) {
        res.status(500).send({ error: 'Error fetching notifications' });
    }
};

// Get a specific notification by ID
export const getNotificationById = async (req, res) => {
    const { id } = req.params;

    try {
        const notification = await prismaClient.notification.findUnique({
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
        const notification = await prismaClient.notification.update({
            where: { id: parseInt(id, 10) },
            data: { read_at },
        });

        res.send(notification);
    } catch (error) {
        res.status(400).send({ error: 'Error updating notification status' });
    }
};
