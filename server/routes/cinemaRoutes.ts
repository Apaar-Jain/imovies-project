import { Router } from 'express';
import {
  getCinemas,
  getCinemaById,
  createCinema,
  updateCinema,
  deleteCinema,
} from '../controllers/cinemaController.ts';
import { verifyToken, requireAdmin } from '../middleware/auth.ts';

const router = Router();

router.get('/', getCinemas);
router.get('/:id', getCinemaById);

// Admin-only routes
router.post('/', verifyToken as any, requireAdmin as any, createCinema);
router.put('/:id', verifyToken as any, requireAdmin as any, updateCinema);
router.delete('/:id', verifyToken as any, requireAdmin as any, deleteCinema);

export default router;
