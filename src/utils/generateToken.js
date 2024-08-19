import jwt from 'jsonwebtoken'; // Correct

// Generate JWT token
export const generateToken = (user) => {
  console.log(user)
  return jwt.sign(
    { id:user.id, role: user.role_id}, // Include role in the payload
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};