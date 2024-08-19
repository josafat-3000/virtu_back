import prisma from '@prisma/client';

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
            },
        });

        res.status(201).send(visit);
    } catch (error) {
        res.status(400).send({ error: 'Error creating visit' });
    }
};

export const getVisits = async (req, res) => {
    try {
        const visits = await prismaClient.visits.findMany({
            where: { user_id: req.user.id },
        });

        res.send(visits);
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
    const { id } = req.params;
    const { status } = req.body;

    try {
        const visit = await prismaClient.visits.update({
            where: { id: parseInt(id, 10) },
            data: { status, updated_at: new Date() },
        });

        res.send(visit);
    } catch (error) {
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

        console.log('Visit counts:', visitCounts);

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