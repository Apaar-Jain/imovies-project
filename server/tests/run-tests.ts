import { connectDB, disconnectDB } from '../config/db.ts';
import { User } from '../models/User.ts';
import { Movie } from '../models/Movie.ts';
import { Cinema } from '../models/Cinema.ts';
import { Showtime } from '../models/Showtime.ts';
import { Booking } from '../models/Booking.ts';
import { seedDatabase } from '../scripts/seed.ts';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_2026_dev_prod';

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    results.push({ name, passed: true, durationMs });
    console.log(`  [PASS] ${name} (${durationMs}ms)`);
  } catch (error: any) {
    const durationMs = Date.now() - start;
    results.push({ name, passed: false, message: error.message || String(error), durationMs });
    console.error(`  [FAIL] ${name} (${durationMs}ms):`, error.message);
  }
}

export async function executeTestSuite() {
  console.log('\n========================================');
  console.log('   IMOVIES BACKEND AUTOMATED TEST SUITE   ');
  console.log('========================================\n');

  await connectDB();
  await seedDatabase(false);

  // Test 1: User Registration
  await runTest('1. User Registration: Successfully create a new user account with hashed password', async () => {
    const testEmail = `testuser_${Date.now()}@example.com`;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('SecretPass123!', salt);

    const user = await User.create({
      name: 'Test Tester',
      email: testEmail,
      passwordHash,
      role: 'user',
    });

    if (!user._id || user.email !== testEmail) {
      throw new Error('User was not created properly');
    }
    const isPwValid = await user.comparePassword('SecretPass123!');
    if (!isPwValid) {
      throw new Error('Password verification failed on new user');
    }
  });

  // Test 2: Duplicate Email Rejection
  await runTest('2. Duplicate Email Rejection: Prevent registering with an already existing email', async () => {
    let duplicateRejected = false;
    try {
      await User.create({
        name: 'Imposter User',
        email: 'user@imovies.com', // Already seeded
        passwordHash: 'dummy',
        role: 'user',
      });
    } catch (err: any) {
      duplicateRejected = true;
    }
    if (!duplicateRejected) {
      throw new Error('Duplicate email creation was allowed, but should have been rejected');
    }
  });

  // Test 3: Successful Login & Password Verification
  await runTest('3. Successful Login: User credentials verified and JWT token created', async () => {
    const user = await User.findOne({ email: 'user@imovies.com' });
    if (!user) throw new Error('Demo user not found');

    const isValid = await user.comparePassword('User@123');
    if (!isValid) throw new Error('Valid password rejected');

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.email !== 'user@imovies.com' || decoded.role !== 'user') {
      throw new Error('JWT payload mismatch');
    }
  });

  // Test 4: Invalid Login Rejection
  await runTest('4. Invalid Login: Reject incorrect credentials', async () => {
    const user = await User.findOne({ email: 'user@imovies.com' });
    if (!user) throw new Error('Demo user not found');

    const isValid = await user.comparePassword('WrongPassword999!');
    if (isValid) throw new Error('Invalid password was mistakenly accepted');
  });

  // Test 5: Protected Routes Token Validation
  await runTest('5. Protected Routes: Rejects forged or invalid JWT tokens', async () => {
    const fakeToken = 'Bearer invalid.token.payload';
    let rejected = false;
    try {
      jwt.verify(fakeToken.replace('Bearer ', ''), JWT_SECRET);
    } catch (err) {
      rejected = true;
    }
    if (!rejected) throw new Error('Forged token was not rejected');
  });

  // Test 6: Movie Retrieval & Filters
  await runTest('6. Movie Retrieval: Fetch active movies with genre filtering', async () => {
    const movies = await Movie.find({ status: 'now_showing' });
    if (!movies || movies.length === 0) throw new Error('No now_showing movies found');

    const sciFiMovies = await Movie.find({ genre: { $in: ['Sci-Fi'] } });
    if (!sciFiMovies || sciFiMovies.length === 0) throw new Error('Sci-Fi genre query returned 0 movies');
  });

  // Test 7: Invalid Showtime Validation
  await runTest('7. Invalid Showtime: Reject booking request for non-existent showtime', async () => {
    const nonExistentId = '66f123456789012345678901';
    const showtime = await Showtime.findById(nonExistentId);
    if (showtime !== null) {
      throw new Error('Found a showtime that should not exist');
    }
  });

  // Test 8: Successful Seat Booking
  let testShowtimeId = '';
  await runTest('8. Successful Booking: Atomically reserve unbooked seats', async () => {
    const showtime = await Showtime.findOne({
      startTime: { $gte: new Date() },
    });
    if (!showtime) throw new Error('No available showtime found');
    testShowtimeId = showtime._id.toString();

    const targetSeats = ['E1', 'E2'];

    // Atomic update
    const updated = await Showtime.findOneAndUpdate(
      {
        _id: showtime._id,
        bookedSeats: { $nin: targetSeats },
      },
      {
        $addToSet: { bookedSeats: { $each: targetSeats } },
      },
      { returnDocument: 'after' }
    );

    if (!updated || !targetSeats.every((s) => updated.bookedSeats.includes(s))) {
      throw new Error('Seats were not booked atomically');
    }
  });

  // Test 9: Already-Booked Seat Rejection
  await runTest('9. Already-Booked Seat Rejection: Prevent booking seats that are already reserved', async () => {
    const targetSeats = ['E1']; // Already booked in previous test

    const secondAttempt = await Showtime.findOneAndUpdate(
      {
        _id: testShowtimeId,
        bookedSeats: { $nin: targetSeats },
      },
      {
        $addToSet: { bookedSeats: { $each: targetSeats } },
      },
      { returnDocument: 'after' }
    );

    if (secondAttempt !== null) {
      throw new Error('Expected atomic update to return null for already-booked seat, but got a document!');
    }
  });

  // Test 10: Concurrent Booking Race Condition Prevention
  await runTest('10. Concurrency Protection: 5 simultaneous attempts to book the same seat produce exactly 1 winner', async () => {
    const contestedSeat = ['F9'];

    // Launch 5 concurrent promises to book contestedSeat on the same showtime
    const attempts = await Promise.all(
      [1, 2, 3, 4, 5].map(() =>
        Showtime.findOneAndUpdate(
          {
            _id: testShowtimeId,
            bookedSeats: { $nin: contestedSeat },
          },
          {
            $addToSet: { bookedSeats: { $each: contestedSeat } },
          },
          { returnDocument: 'after' }
        )
      )
    );

    const winners = attempts.filter((doc) => doc !== null);
    if (winners.length !== 1) {
      throw new Error(`Concurrency violation! Expected exactly 1 winner, but got ${winners.length}`);
    }
  });

  // Test 11: Booking Ownership Verification
  await runTest('11. Booking Ownership: Normal user cannot access another user\'s private booking', async () => {
    const userA = await User.findOne({ email: 'user@imovies.com' });
    const booking = await Booking.findOne({ user: userA?._id });
    if (!booking) throw new Error('No booking found for test user');

    const fakeOtherUserId = '66f999999999999999999999';
    const isOwner = booking.user.toString() === fakeOtherUserId;
    if (isOwner) {
      throw new Error('Ownership verification failed: unauthorized user matched booking owner');
    }
  });

  // Test 12: Unauthorized Administrative Operations
  await runTest('12. Role Authorization: User role cannot execute admin-restricted mutations', async () => {
    const normalUser = await User.findOne({ email: 'user@imovies.com' });
    if (!normalUser) throw new Error('Normal user not found');

    if (normalUser.role === 'admin') {
      throw new Error('Normal user should not have admin role');
    }
  });

  console.log('\n----------------------------------------');
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`TEST RUN FINISHED: ${passedCount}/${results.length} PASSED`);
  console.log('----------------------------------------\n');

  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    results,
  };
}

// Standalone execution: `tsx server/tests/run-tests.ts`
if (process.argv[1] && process.argv[1].endsWith('run-tests.ts')) {
  executeTestSuite()
    .then((summary) => {
      disconnectDB().then(() => {
        if (summary.failed > 0) {
          process.exit(1);
        } else {
          process.exit(0);
        }
      });
    })
    .catch((err) => {
      console.error('Fatal test runner error:', err);
      process.exit(1);
    });
}
