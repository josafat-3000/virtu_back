import jwt from 'jsonwebtoken';
import prisma from '@prisma/client';


const { PrismaClient } = prisma;
const prismaClient = new PrismaClient();

export const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token; // Obtener el token de la cookie

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
