
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import paymentRoutes from './routes/payment.js';
import userRoutes from './routes/deleteuser.js';
import notificationsRoutes from './routes/notify.js';

const app = express();
app.use(cors());
app.use(express.json());

// Validate API keys
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error('❌ GOOGLE_API_KEY is missing in environment variables.');
  process.exit(1);
}

// Google Gemini setup
const genAI = new GoogleGenerativeAI(apiKey);
const removeAsterisks = (text) => text.replace(/\*+/g, '');

// AI route
app.post('/ask', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt must be a non-empty string' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = removeAsterisks(response.text?.() || 'No response text.');

    res.json({ response: text });
  } catch (error) {
    console.error('❌ Error in /ask:', error);
    res.status(500).json({
      error: 'BAJE is unavailable right now',
      details: error.message || 'Unknown error',
    });
  }
});

// Mount routes
app.use('/api', paymentRoutes);
app.use('/api', userRoutes);
app.use('/api', notificationsRoutes);

// Launch server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
