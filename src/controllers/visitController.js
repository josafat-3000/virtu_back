import prisma from '@prisma/client';

const { PrismaClient } = prisma;
const prismaClient = new PrismaClient();

export const createVisit = async (req, res) => {
    const { visitor_name, visitor_company, visit_reason, visit_material, vehicle, vehicle_model, vehicle_plate, status } = req.body;

    try {
        const visit = await prismaClient.visit.create({
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
        const visits = await prismaClient.visit.findMany({
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
        const visit = await prismaClient.visit.findUnique({
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
        const visit = await prismaClient.visit.update({
            where: { id: parseInt(id, 10) },
            data: { status, updated_at: new Date() },
        });

        res.send(visit);
    } catch (error) {
        res.status(400).send({ error: 'Error updating visit status' });
    }
};