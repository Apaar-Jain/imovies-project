import { Router } from 'express';
import { getAdminStats, getAllBookings } from '../controllers/adminController.ts';
import { verifyToken, requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Protected admin-only routes
router.use(verifyToken as any);
router.use(requireAdmin as any);

router.get('/stats', getAdminStats as any);
router.get('/bookings', getAllBookings as any);

export default router;
