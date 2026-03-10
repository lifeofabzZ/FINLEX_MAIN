// dolorer/src/server/src/index.ts
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import geminiRoutes from './routes/gemini';
import cryptoRoutes from './routes/cryptocurrencies';
import expenseRoutes from './routes/expenses';
import walletRoutes from './routes/wallet';
import authRoutes from './routes/auth';
import simulatedTradesRoutes from './routes/simulatedTrades';
import { connectDB } from './db';


dotenv.config({ path: __dirname + "/../.env" });
console.log("🔑 GEMINI_API_KEY loaded:", !!process.env.GEMINI_API_KEY);
console.log("🔐 JWT_SECRET loaded:", !!process.env.JWT_SECRET);

// Initialize server
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Routes
app.use('/api/gemini', geminiRoutes);
app.use('/api/cryptocurrencies', cryptoRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/simulated-trades', simulatedTradesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FINLEX Backend',
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Start server after connecting to MongoDB
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🤖 Gemini API: http://localhost:${PORT}/api/gemini/test`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();