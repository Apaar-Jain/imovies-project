import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/bookingController.ts';
import { verifyToken } from '../middleware/auth.ts';

const router = Router();

// All booking operations require authenticated users
router.use(verifyToken as any);

router.post('/', createBooking as any);
router.get('/my', getMyBookings as any);
router.get('/:id', getBookingById as any);
router.post('/:id/cancel', cancelBooking as any);

export default router;
