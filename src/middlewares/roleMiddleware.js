// src/middleware/roleMiddleware.js
import jwt from 'jsonwebtoken';


const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    const token = req.cookies.token; // Obtener el token de la cookie

    if (!token) {
      return res.status(403).send('Token is required');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).send('Insufficient permissions');
      }

      req.user = decoded; // Agregar la información del usuario decodificado al objeto req
      next(); // Pasar al siguiente middleware o controlador
    } catch (err) {
      return res.status(403).send('Invalid token');
    }
  };
};

export default roleMiddleware;
