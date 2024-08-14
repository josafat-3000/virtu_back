import app from './app.js';
const PORT = process.env.PORT || 3000;

import dotenv from 'dotenv';
dotenv.config();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(process.env.DATABASE_URL);
});