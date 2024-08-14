const jwt = require('jsonwebtoken');

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role }, // Include role in the payload
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};