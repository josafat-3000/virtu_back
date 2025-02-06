import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();


export const verifyResetToken = async (req, res, next) => {
  const { token } = req.body;
  console.log("token: ",token)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.decoded = decoded; // Guarda el ID del usuario en `req`
    console.log("decoded: ",decoded)
    next(); // Continúa con el siguiente middleware o controlador
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: "Token inválido o expirado" });
  }
};
