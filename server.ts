import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './server/config/db.ts';
import { seedDatabase } from './server/scripts/seed.ts';

import authRoutes from './server/routes/authRoutes.ts';
import movieRoutes from './server/routes/movieRoutes.ts';
import cinemaRoutes from './server/routes/cinemaRoutes.ts';
import showtimeRoutes from './server/routes/showtimeRoutes.ts';
import bookingRoutes from './server/routes/bookingRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security & Parsing Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Database Health & Reset/Seed Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'IMovies API Server',
  });
});

// Direct ZIP Archive Download Endpoint
app.get(['/imovies-project.zip', '/api/download'], (req, res) => {
  const zipPath = path.resolve(__dirname, 'imovies-project.zip');
  res.download(zipPath, 'imovies-project.zip');
});

app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase(false);
    res.json({ success: true, message: 'Database seeded with fresh demo data.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Centralized API Error Handling
app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

async function startServer() {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to database...');
    await connectDB();

    // 2. Auto-seed if database is fresh
    await seedDatabase(false);

    // 3. Mount Vite middlewares in development
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite middleware mounted in development mode');
    } else {
      // In production, serve built frontend assets from dist
      const distPath = path.resolve(__dirname, 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`IMovies Full-Stack Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
