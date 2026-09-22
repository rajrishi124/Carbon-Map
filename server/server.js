const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const path = require('path');

// Load environment variables (from cwd, server/.env, or root .env)
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());

// Cross-Origin Resource Sharing
const allowedOrigins = process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'] : '*';
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser with size limits
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// Health Check endpoint (Requirement Section 23)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    product: 'CarbonMap',
    tagline: 'Map your impact. Make better choices.',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/activities', require('./routes/activities'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/target', require('./routes/target'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/demo', require('./routes/demo'));

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`  CarbonMap API Server running on port ${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=========================================`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
