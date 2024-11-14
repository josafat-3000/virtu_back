// src/controllers/userController.js
import prisma from '@prisma/client';
const { PrismaClient } = prisma;
const prismaClient = new PrismaClient();

export const getUserProfile = async (req, res) => {
    const { id } = req.user;
    console.log(req.user)
    try {
      const user = await prismaClient.users.findUnique({ where: { id } });
      res.json(user);
    } catch (error) {
      console.error(error)
      res.status(500).send('Server error');
    }
  };
  
  export const updateUserProfile = async (req, res) => {
    const { id } = req.params?req.params:req.user;
    
    const { email, name, role_id, phone } = req.body;
    try {
      const updatedUser = await prismaClient.users.update({
        where: { id: parseInt(id) },
        data: { email, name, role_id, phone},
      });
      res.json(updatedUser);
    } catch (error) {
      console.log(error)
      res.status(500).send('Server error');
    }
  };
  
  export const getAllUsers = async (req, res) => {
    try {
      const users = await prismaClient.users.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).send('Server error');
    }
  };
  
  export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
      await prismaClient.users.delete({ where: {id: parseInt(id) } });
      res.send('User deleted');
    } catch (error) {
      console.log(error)
      res.status(500).send('Server error');
    }
  };
  
  