import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import { postGenerateTests } from './routes/generateTests.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

app.post('/api/generate-tests', postGenerateTests);

app.listen(PORT, () => {
  console.log(`Unit Test Generator API running at http://localhost:${PORT}`);
});
