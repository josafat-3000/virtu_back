import jwt from 'jsonwebtoken';
import prisma from '@prisma/client';

const { PrismaClient } = prisma;
const prismaClient = new PrismaClient();

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).send({ error: 'Please authenticate.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prismaClient.user.findUnique({
            where: { id: decoded.id },
            include: { role: { include: { actions: true } } }
        });

        if (!user) {
            throw new Error();
        }

        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

export default authMiddleware;
