const roleMiddleware = (requiredRoles) => {
    return (req, res, next) => {
      const userRole = req.user.role.name;
      
      if (!requiredRoles.includes(userRole)) {
        return res.status(403).send({ error: 'Access denied' });
      }
  
      next();
    };
  };
  
  export default roleMiddleware;
  