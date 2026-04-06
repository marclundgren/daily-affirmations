import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { initializeDb } from './db.js';
import usersRouter from './routes/users.js';
import affirmationsRouter from './routes/affirmations.js';
import completionsRouter from './routes/completions.js';
import extractRouter from './routes/extract.js';

config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initializeDb();

app.use('/api/users', usersRouter);
app.use('/api/affirmations', affirmationsRouter);
app.use('/api/completions', completionsRouter);
app.use('/api/extract-affirmation', extractRouter);

app.listen(PORT, () => {
  console.log(`Daily Affirmations server running on port ${PORT}`);
});
