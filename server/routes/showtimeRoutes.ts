import { Router } from 'express';
import {
  getShowtimes,
  getShowtimeById,
  getShowtimeSeats,
  createShowtime,
  deleteShowtime,
} from '../controllers/showtimeController.ts';
import { verifyToken, requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Public routes
router.get('/', getShowtimes);
router.get('/:id', getShowtimeById);
router.get('/:id/seats', getShowtimeSeats);

// Admin-only management
router.post('/', verifyToken as any, requireAdmin as any, createShowtime);
router.delete('/:id', verifyToken as any, requireAdmin as any, deleteShowtime);

export default router;
