import prisma from '@prisma/client';

const { PrismaClient } = prisma;
const prismaClient = new PrismaClient();

export const getAllAccessLogs = async (req, res) => {
    try {
        const accessLogs = await prismaClient.accessLogs.findMany({
            include: {
              Users: true,   // Incluye los datos del usuario
              Visits: true,  // Incluye los datos de la visita
            },
          });
          
        res.json(accessLogs);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error al obtener los registros de acceso',log: `${error}`});
    }
};

export const getUserAccessLogs = async (req, res) => {
    try {
        const { userId } = req.params
        const accessLogs = await prismaClient.accessLogs.findMany({
            where: {
                user_id: parseInt(userId),
            },
        });
        res.json(accessLogs);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error al obtener los registros de acceso' });
    }
};

// Obtener un registro de acceso por ID
export const getAccessLogById = async (req, res) => {
    try {
        const { id } = req.params;
        const accessLog = await prismaClient.accessLog.findUnique({
            where: { id: parseInt(id) },
        });
        if (accessLog) {
            res.json(accessLog);
        } else {
            res.status(404).json({ error: 'Registro de acceso no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el registro de acceso' });
    }
};

// Crear un nuevo registro de acceso
export const createAccessLog = async (req, res) => {
    try {
        const { userId, accessType, timestamp, ipAddress, visitReason } = req.body;
        const newAccessLog = await prismaClient.accessLog.create({
            data: {
                userId,
                accessType,
                timestamp,
                ipAddress,
                visitReason,
            },
        });
        res.status(201).json(newAccessLog);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el registro de acceso' });
    }
};

// Actualizar un registro de acceso por ID
export const updateAccessLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, accessType, timestamp, ipAddress, visitReason } = req.body;
        const updatedAccessLog = await prisma.accessLog.update({
            where: { id: parseInt(id) },
            data: {
                userId,
                accessType,
                timestamp,
                ipAddress,
                visitReason,
            },
        });
        res.json(updatedAccessLog);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el registro de acceso' });
    }
};

// Eliminar un registro de acceso por ID
export const deleteAccessLog = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.accessLog.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el registro de acceso' });
    }
};