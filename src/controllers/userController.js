import prisma from '@prisma/client';

const { PrismaClient } = prisma;
const prismaClient = new PrismaClient();

export const getUserProfile = async (req, res) => {
    try {
        const user = await prismaClient.user.findUnique({
            where: { id: req.user.id },
            include: { role: true },
        });

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.send(user);
    } catch (error) {
        res.status(500).send({ error: 'Error fetching user profile' });
    }
};