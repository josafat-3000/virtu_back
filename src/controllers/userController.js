// src/controllers/userController.js
import prisma from '@prisma/client';
export const getUserProfile = async (req, res) => {
    const { id } = req.user;
    try {
      const user = await prisma.users.findUnique({ where: { id } });
      res.json(user);
    } catch (error) {
      res.status(500).send('Server error');
    }
  };
  
  export const updateUserProfile = async (req, res) => {
    const { id } = req.user;
    const { email, password } = req.body;
    try {
      const updatedUser = await prisma.users.update({
        where: { id },
        data: { email, password: bcrypt.hashSync(password, 10) }
      });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).send('Server error');
    }
  };
  
  export const getAllUsers = async (req, res) => {
    try {
      const users = await prisma.users.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).send('Server error');
    }
  };
  
  export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.users.delete({ where: { id: parseInt(id) } });
      res.send('User deleted');
    } catch (error) {
      res.status(500).send('Server error');
    }
  };
  
  export const getAllVisits = async (req, res) => {
    try {
      const visits = await prisma.visits.findMany();
      res.json(visits);
    } catch (error) {
      res.status(500).send('Server error');
    }
  };
  
  export const validateVisit = async (req, res) => {
    const { id } = req.params;
    try {
      const visit = await prisma.visits.update({
        where: { id: parseInt(id) },
        data: { status: 'validated' }
      });
      res.send('Visit validated');
    } catch (error) {
      res.status(500).send('Server error');
    }
  };