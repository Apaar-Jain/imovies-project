import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.ts';
import { User } from '../models/User.ts';
import { Movie } from '../models/Movie.ts';
import { Cinema } from '../models/Cinema.ts';
import { Showtime } from '../models/Showtime.ts';
import { Booking } from '../models/Booking.ts';

export async function seedDatabase(isStandalone = false) {
  try {
    console.log('--- Starting IMovies Database Seed Process ---');
    await connectDB();

    // Check if movies already exist to avoid unnecessary duplicate seeds if not forced
    const existingMoviesCount = await Movie.countDocuments();
    if (existingMoviesCount > 0 && !isStandalone) {
      console.log(`Database already has ${existingMoviesCount} movies. Skipping automatic seed.`);
      return;
    }

    // Clear old data for clean seed
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Cinema.deleteMany({}),
      Showtime.deleteMany({}),
      Booking.deleteMany({}),
    ]);
    console.log('Cleared existing collections.');

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
    const userPasswordHash = await bcrypt.hash('User@123', salt);

    const adminUser = await User.create({
      name: 'IMovies Chief Admin',
      email: 'admin@imovies.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+1 555-0199',
    });

    const demoUser = await User.create({
      name: 'Alex Turner',
      email: 'user@imovies.com',
      passwordHash: userPasswordHash,
      role: 'user',
      phone: '+1 555-0123',
    });

    console.log('Seeded Users: admin@imovies.com & user@imovies.com');

    // 2. Seed Movies
    const moviesData = [
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
        genre: ['Sci-Fi', 'Adventure', 'Action'],
        duration: 166,
        releaseDate: '2024-03-01',
        language: 'English',
        rating: 8.9,
        certificate: 'PG-13',
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
        director: 'Denis Villeneuve',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        status: 'now_showing',
        featured: true,
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral and geopolitical consequences that reshaped global history.',
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
        genre: ['Biography', 'Drama', 'History'],
        duration: 180,
        releaseDate: '2023-07-21',
        language: 'English',
        rating: 8.9,
        certificate: 'R',
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
        director: 'Christopher Nolan',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        status: 'now_showing',
        featured: true,
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
        posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
        genre: ['Animation', 'Action', 'Adventure'],
        duration: 140,
        releaseDate: '2023-06-02',
        language: 'English',
        rating: 8.7,
        certificate: 'PG',
        cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Jake Johnson'],
        director: 'Joaquim Dos Santos, Kemp Powers',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        status: 'now_showing',
        featured: false,
      },
      {
        title: 'Interstellar',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
        genre: ['Sci-Fi', 'Drama', 'Adventure'],
        duration: 169,
        releaseDate: '2014-11-07',
        language: 'English',
        rating: 8.7,
        certificate: 'PG-13',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
        director: 'Christopher Nolan',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        status: 'now_showing',
        featured: true,
      },
      {
        title: 'Gladiator II',
        description: 'Years after witnessing the death of revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
        posterUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        genre: ['Action', 'Drama', 'Adventure'],
        duration: 148,
        releaseDate: '2024-11-22',
        language: 'English',
        rating: 8.4,
        certificate: 'R',
        cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
        director: 'Ridley Scott',
        trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
        status: 'now_showing',
        featured: false,
      },
      {
        title: 'Avatar: Fire and Ash',
        description: 'The continuing saga of Pandora following Jake Sully and Neytiri as they encounter a fiery new Na\'vi clan known as the Ash People who live in volcanic regions.',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
        genre: ['Sci-Fi', 'Action', 'Fantasy'],
        duration: 190,
        releaseDate: '2025-12-19',
        language: 'English',
        rating: 9.1,
        certificate: 'PG-13',
        cast: ['Sam Worthington', 'Zoe Saldaña', 'Sigourney Weaver', 'Stephen Lang'],
        director: 'James Cameron',
        trailerUrl: '',
        status: 'upcoming',
        featured: false,
      },
    ];

    const createdMovies = await Movie.insertMany(moviesData);
    console.log(`Seeded ${createdMovies.length} movies.`);

    // 3. Seed Cinemas
    const cinemasData = [
      {
        name: 'IMovies Grand Cinema — Downtown',
        address: '100 Broadway Avenue, Theater District',
        city: 'New York',
        screens: [
          { screenId: 'AUDI-1', name: 'Audi 1 (IMAX 70mm)', screenType: 'IMAX 3D', totalSeats: 60, rows: 6, cols: 10 },
          { screenId: 'AUDI-2', name: 'Audi 2 (Dolby Atmos Prime)', screenType: 'Dolby Cinema', totalSeats: 60, rows: 6, cols: 10 },
        ],
        amenities: ['IMAX 70mm Dual Laser', 'Dolby Atmos Sound', 'VIP Recliner Rows', 'Gourmet Kitchen & Bar', 'Valet Parking'],
        phone: '+1 (212) 555-0100',
      },
      {
        name: 'IMovies Starplex — Midtown Plaza',
        address: '450 Lexington Avenue, Midtown',
        city: 'New York',
        screens: [
          { screenId: 'AUDI-A', name: 'Audi A (4DX Dynamic)', screenType: '4DX', totalSeats: 60, rows: 6, cols: 10 },
          { screenId: 'AUDI-B', name: 'Audi B (Dolby Cinema)', screenType: 'Dolby Cinema', totalSeats: 60, rows: 6, cols: 10 },
        ],
        amenities: ['4DX Motion Seats', 'Dolby Vision HDR', 'Automated Kiosks', 'Cafe Lounge'],
        phone: '+1 (212) 555-0188',
      },
      {
        name: 'IMovies Luxe & Dine — West End',
        address: '880 Ocean Promenade, West End',
        city: 'Brooklyn',
        screens: [
          { screenId: 'LUXE-1', name: 'Luxe Suite 1', screenType: 'VIP Recliner', totalSeats: 60, rows: 6, cols: 10 },
          { screenId: 'LUXE-2', name: 'Luxe Suite 2', screenType: 'VIP Recliner', totalSeats: 60, rows: 6, cols: 10 },
        ],
        amenities: ['In-Seat Waiter Service', 'Motorized Leather Loungers', 'Cocktail Lounge', 'Dolby Atmos'],
        phone: '+1 (718) 555-0145',
      },
    ];

    const createdCinemas = await Cinema.insertMany(cinemasData);
    console.log(`Seeded ${createdCinemas.length} cinema locations.`);

    // 4. Seed Showtimes for Now Showing movies
    const nowShowingMovies = createdMovies.filter((m: any) => m.status === 'now_showing');
    const showtimesToCreate: any[] = [];

    // Current time base
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Schedule shows for today, tomorrow, and day after tomorrow
    for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
      const showDate = new Date(today);
      showDate.setDate(showDate.getDate() + dayOffset);

      // Generate showtimes throughout the day: 11:30 AM, 3:00 PM, 6:45 PM, 9:30 PM
      const slotHours = [
        { hour: 11, minute: 30 },
        { hour: 15, minute: 0 },
        { hour: 18, minute: 45 },
        { hour: 21, minute: 30 },
      ];

      for (const cinema of createdCinemas) {
        for (const screen of cinema.screens) {
          // Rotate movie across slots
          slotHours.forEach((slot, index) => {
            const movieIndex = (dayOffset + index) % nowShowingMovies.length;
            const movie = nowShowingMovies[movieIndex];

            const startTime = new Date(showDate);
            startTime.setHours(slot.hour, slot.minute, 0, 0);

            const endTime = new Date(startTime.getTime() + (movie.duration + 25) * 60 * 1000);

            // Pre-seed some booked seats for realistic cinema state
            const bookedSeats: string[] = [];
            if (dayOffset === 0 && index === 2) {
              // popular evening show today
              bookedSeats.push('C4', 'C5', 'C6', 'D4', 'D5', 'A1', 'A2');
            } else if (dayOffset === 1 && index === 1) {
              bookedSeats.push('B5', 'B6');
            }

            showtimesToCreate.push({
              movie: movie._id,
              cinema: cinema._id,
              screenId: screen.screenId,
              screenName: screen.name,
              screenType: screen.screenType,
              startTime,
              endTime,
              pricing: {
                standard: screen.screenType === 'IMAX 3D' ? 16.5 : 13.0,
                premium: screen.screenType === 'IMAX 3D' ? 20.0 : 17.5,
                vip: screen.screenType === 'VIP Recliner' ? 28.0 : 24.0,
              },
              rows: 6,
              cols: 10,
              bookedSeats,
            });
          });
        }
      }
    }

    const createdShowtimes = await Showtime.insertMany(showtimesToCreate);
    console.log(`Seeded ${createdShowtimes.length} showtimes across multiple dates.`);

    // 5. Seed a Sample Booking for Demo User
    if (createdShowtimes.length > 0) {
      const sampleShow = createdShowtimes[2];
      await Booking.create({
        bookingReference: 'IMV-739102',
        user: demoUser._id,
        showtime: sampleShow._id,
        movie: sampleShow.movie,
        cinema: sampleShow.cinema,
        screenName: sampleShow.screenName,
        showStartTime: sampleShow.startTime,
        seats: [
          { seatNumber: 'C4', tier: 'premium', price: sampleShow.pricing.premium },
          { seatNumber: 'C5', tier: 'premium', price: sampleShow.pricing.premium },
        ],
        totalPrice: Number((sampleShow.pricing.premium * 2).toFixed(2)),
        bookingStatus: 'confirmed',
        paymentMode: 'demo_instant_checkout',
        paymentStatus: 'completed',
      });
      console.log('Seeded initial sample confirmed booking for user@imovies.com.');
    }

    console.log('--- Database Seed Process Completed Successfully! ---');
  } catch (err) {
    console.error('Error during database seed:', err);
    throw err;
  } finally {
    if (isStandalone) {
      await disconnectDB();
    }
  }
}

// Allow direct execution: `tsx server/scripts/seed.ts`
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase(true).then(() => {
    console.log('Seed finished.');
    process.exit(0);
  });
}
