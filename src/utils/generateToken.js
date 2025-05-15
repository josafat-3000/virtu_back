import jwt from 'jsonwebtoken'; // Correct
import dotenv from 'dotenv';

dotenv.config();
// Generate JWT token
export const generateToken = (user) => {

  return jwt.sign(
    { id: user.id, role: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

