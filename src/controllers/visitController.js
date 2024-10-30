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
        if(req.user.role == 1){
            const visits = await prismaClient.visits.findMany();
            res.send(visits);
        } else {
            const visits = await prismaClient.visits.findMany({
                where: { user_id: req.user.id },
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
    const { id } = req.params;

    try {
        // Obtener la visita actual
        const visit = await prismaClient.visits.findUnique({
            where: { id: parseInt(id, 10) },
            select: { status: true }, // Solo necesitamos el estado actual
        });

        if (!visit) {
            return res.status(404).send({ error: 'Visit not found' });
        }

        // Determinar el nuevo estado basado en el estado actual
        let newStatus = '';
        if (visit.status === 'pending') {
            newStatus = 'in_progress';
        } else if (visit.status === 'in_progress') {
            newStatus = 'completed';
        } else {
            return res.status(400).send({ error: 'Invalid status transition' });
        }

        // Actualizar la visita con el nuevo estado
        const updatedVisit = await prismaClient.visits.update({
            where: { id: parseInt(id, 10) },
            data: { 
                status: newStatus,
                updated_at: new Date()
            },
        });

        res.send(updatedVisit);
    } catch (error) {
        console.error(error); // Agregar esto para depurar el error
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