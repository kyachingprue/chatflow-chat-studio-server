import express from 'express';
import dotenv from 'dotenv';
import connectDb from './database/db.js';
import cors from 'cors';
import userRoute from './routes/userRoute.js'; 
import friendRoute from './routes/friendRoute.js'; 

dotenv.config();
await connectDb();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173', 
    credentials: true,
  })
);

app.use('/user', userRoute); 

app.use('/api/users', userRoute);

app.use('/api/friends', friendRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
