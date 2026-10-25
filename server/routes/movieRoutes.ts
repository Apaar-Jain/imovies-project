import { Router } from 'express';
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/movieController.ts';
import { verifyToken, requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Public routes
router.get('/', getMovies);
router.get('/:id', getMovieById);

// Admin-only management routes
router.post('/', verifyToken as any, requireAdmin as any, createMovie);
router.put('/:id', verifyToken as any, requireAdmin as any, updateMovie);
router.delete('/:id', verifyToken as any, requireAdmin as any, deleteMovie);

export default router;
