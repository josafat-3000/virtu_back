import jwt from 'jsonwebtoken'; // Correct

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { id:user.id, role: user.role_id}, 
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const generateInviteToken = (email) => {
    const token = jwt.sign({ email }, process.env.JWT_SECRET , { expiresIn: '30m' }); 
    return token;
}