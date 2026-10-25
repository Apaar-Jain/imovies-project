# IMovies — Online Movie Ticket Booking Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org/)
[![React.js](https://img.shields.io/badge/React.js-v19-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-12%2F12%20Passing-success.svg)](./server/tests/run-tests.ts)

A production-grade, full-stack online movie ticket booking platform built with **React.js, Node.js, Express.js, MongoDB, Mongoose, and JWT authentication**. Designed for cinema discovery, theater scheduling, real-time interactive seat selection, and concurrency-safe double-booking prevention.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [Application Architecture](#4-application-architecture)
5. [Folder Structure](#5-folder-structure)
6. [Prerequisites](#6-prerequisites)
7. [Installation Instructions](#7-installation-instructions)
8. [MongoDB Atlas Configuration](#8-mongodb-atlas-configuration)
9. [Environment Variable Setup](#9-environment-variable-setup)
10. [Frontend Startup Instructions](#10-frontend-startup-instructions)
11. [Backend Startup Instructions](#11-backend-startup-instructions)
12. [Database Seeding Instructions](#12-database-seeding-instructions)
13. [API Endpoint Documentation](#13-api-endpoint-documentation)
14. [Authentication & Authorization](#14-authentication--authorization)
15. [Seat Reservation & Concurrency Safety](#15-seat-reservation--concurrency-safety)
16. [Testing & Verification](#16-testing--verification)
17. [Build Instructions](#17-build-instructions)
18. [Deployment Instructions](#18-deployment-instructions)
19. [Common Errors & Troubleshooting](#19-common-errors--troubleshooting)
20. [Security Considerations](#20-security-considerations)
21. [Known Limitations](#21-known-limitations)
22. [Future Improvements](#22-future-improvements)

---

## 1. Project Overview
**IMovies** bridges moviegoers and modern theaters. It empowers customers to browse blockbuster movies, inspect cast and trailers, pick auditoriums and showtimes, interact with an auditorium seat layout, and reserve seats with real-time pricing and instant digital ticket confirmation passes.

For cinema managers, IMovies delivers a protected **Admin Dashboard** to oversee ticket sales, track revenue, schedule showtimes across theater screens, and manage the movie collection.

---

## 2. Key Features

- **Movie Discovery & Search**: Filter by genres (Sci-Fi, Action, Drama, Animation), browse "Now Showing" vs. "Upcoming", and perform instant keyword search on titles, directors, and cast.
- **Cinematic Movie Profiles**: High-resolution posters, backdrops, story synopses, parental ratings, runtime, trailers, and dates.
- **Auditorium Seat Selection**: Realistic curved cinema projection screen, row and column labels (A1 to F10), aisle gaps, and tier-based pricing (VIP Recliner, Premium, Standard).
- **Atomic Concurrency Double-Booking Protection**: Database-level atomic `$nin` and `$addToSet` conditions that mathematically prevent race conditions when two or more users attempt to claim the exact same seat at the same millisecond.
- **Digital Pass & Booking Confirmation**: Visual ticket pass with barcode, booking reference code (e.g. `IMV-739102`), auditorium tags, and print/download feature.
- **User Booking History & Cancellation**: "My Bookings" portal to inspect upcoming and past reservations, with one-click cancellation that atomically returns seats to the pool.
- **Role-Based Admin Dashboard**: Revenue analytics, ticket counts, active screen counts, movie creation & deletion, and showtime scheduler.
- **Zero-Config Dual-Mode Database**: Connects out of the box with zero external configuration using an embedded in-memory MongoDB instance, or seamlessly switches to cloud **MongoDB Atlas** via the `MONGODB_URI` environment variable.

---

## 3. Technology Stack

### Frontend
- **React.js 19**: Modern component architecture, functional hooks, and context management.
- **React Router 7**: Client-side navigation with route guards (`ProtectedRoute`, `requireAdmin`).
- **Axios**: HTTP client configured with automated request interceptors for JWT bearer tokens.
- **Tailwind CSS**: Modern utility styling with custom cinema glow, auditorium screen curves, and dark mode themes.
- **Lucide Icons**: Crisp SVG iconography for movie theater interfaces.
- **Canvas Confetti**: Celebratory particle physics upon booking confirmation.

### Backend
- **Node.js 22**: Event-driven server runtime.
- **Express.js 4**: Clean REST API architecture with separated routes, controllers, models, and middleware.
- **MongoDB & Mongoose 9**: Document schemas, indexes, type validations, and atomic operations.
- **JSON Web Tokens (JWT)**: Stateless token issuance and verification for session continuity.
- **bcryptjs**: Salted password hashing (cost factor 10) for secure credential persistence.
- **MongoMemoryServer**: Automatic embedded database fallback for instant local execution without external prerequisites.

---

## 4. Application Architecture

```
[ Client: React SPA (Vite) ]
          │
          │ HTTP / REST (Bearer JWT)
          ▼
[ Server: Express.js (Port 3000) ]
  ├── CORS & JSON Body Parser
  ├── Auth Middleware (verifyToken, requireAdmin)
  ├── Controllers & Routers (/api/auth, /api/movies, /api/showtimes, /api/bookings, /api/admin)
          │
          │ Mongoose ODM (Atomic Operators)
          ▼
[ MongoDB Database (Atlas Cloud or Embedded Engine) ]
  ├── Users Collection (Unique Emails, Hashed Passwords)
  ├── Movies Collection (Indexed Genres, Status, Ratings)
  ├── Cinemas Collection (Locations, Screens, Amenities)
  ├── Showtimes Collection (Dates, Pricing Tiers, Booked Seats Array)
  └── Bookings Collection (Unique References, Ownership Refs)
```

---

## 5. Folder Structure

```
imovies/
├── client/ (integrated in src/)
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookingConfirmationModal.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── MovieCard.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── SeatMap.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── BookingPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── MovieDetailsPage.tsx
│   │   │   ├── MoviesPage.tsx
│   │   │   └── MyBookingsPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── config/
│   │   └── db.ts
│   ├── controllers/
│   │   ├── adminController.ts
│   │   ├── authController.ts
│   │   ├── bookingController.ts
│   │   ├── cinemaController.ts
│   │   ├── movieController.ts
│   │   └── showtimeController.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── models/
│   │   ├── Booking.ts
│   │   ├── Cinema.ts
│   │   ├── Movie.ts
│   │   ├── Showtime.ts
│   │   └── User.ts
│   ├── routes/
│   │   ├── adminRoutes.ts
│   │   ├── authRoutes.ts
│   │   ├── bookingRoutes.ts
│   │   ├── cinemaRoutes.ts
│   │   ├── movieRoutes.ts
│   │   └── showtimeRoutes.ts
│   ├── scripts/
│   │   └── seed.ts
│   ├── tests/
│   │   └── run-tests.ts
│   └── .env.example
├── server.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

---

## 6. Prerequisites

- **Node.js**: v18.0.0 or higher (v22 recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: (Optional) MongoDB Atlas account or local mongod. If omitted, the embedded engine boots automatically.

---

## 7. Installation Instructions

Clone the repository and install all dependencies:

```bash
# Clone the repository
git clone https://github.com/your-username/imovies.git
cd imovies

# Install dependencies
npm install
```

---

## 8. MongoDB Atlas Configuration

To connect a live cloud database on MongoDB Atlas:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Go to **Database Access** and add a database user with read/write privileges.
3. Go to **Network Access** and add IP `0.0.0.0/0` (allow from anywhere) or your specific IP.
4. Click **Connect** -> **Connect your application** -> Copy the connection URI:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/imovies?retryWrites=true&w=majority
   ```
5. Paste this URI into your `.env` file as `MONGODB_URI`.

---

## 9. Environment Variable Setup

Create a `.env` file in the root directory (based on `.env.example`):

```bash
cp .env.example .env
```

Fill in the required fields:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/imovies?retryWrites=true&w=majority
JWT_SECRET=super_secure_production_secret_key_12345
```

---

## 10. Frontend Startup Instructions

In development, the full-stack server automatically mounts Vite with the frontend:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 11. Backend Startup Instructions

The Express backend and Vite middleware are integrated in `server.ts`:
```bash
npm run dev
```

For production mode:
```bash
npm run build
npm start
```

---

## 12. Database Seeding Instructions

IMovies includes pre-configured cinema venues, movies, showtimes, customer accounts, and an administrator account:

### Demo Accounts Seeded:
| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@imovies.com` | `Admin@123` |
| **Demo Customer** | `user@imovies.com` | `User@123` |

### Run Seed Script:
```bash
npm run seed
```
You can also trigger a database reset directly from the web interface using the **"Reset Sample Records"** button in the footer or by calling `POST /api/seed`.

---

## 13. API Endpoint Documentation

### Authentication
- `POST /api/auth/register` — Create a new customer account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated user profile (`Authorization: Bearer <token>`)

### Movies
- `GET /api/movies` — List movies (filters: `search`, `genre`, `status`, `sort`)
- `GET /api/movies/:id` — Get movie details and upcoming screenings
- `POST /api/movies` — Create movie *(Admin only)*
- `PUT /api/movies/:id` — Update movie *(Admin only)*
- `DELETE /api/movies/:id` — Delete movie and its showtimes *(Admin only)*

### Cinemas
- `GET /api/cinemas` — List all cinema locations
- `GET /api/cinemas/:id` — Get cinema details and its screenings
- `POST /api/cinemas` — Add new cinema venue *(Admin only)*

### Showtimes
- `GET /api/showtimes` — Query showtimes by `movieId`, `cinemaId`, `date`
- `GET /api/showtimes/:id/seats` — Get live auditorium layout, pricing, and booked seats
- `POST /api/showtimes` — Schedule new screening *(Admin only)*
- `DELETE /api/showtimes/:id` — Remove screening *(Admin only)*

### Bookings
- `POST /api/bookings` — Atomically book seats (`showtimeId`, `requestedSeats`) *(User Auth required)*
- `GET /api/bookings/my` — Fetch current user's bookings *(User Auth required)*
- `GET /api/bookings/:id` — Fetch single booking details *(Ownership enforced)*
- `POST /api/bookings/:id/cancel` — Cancel booking and release seats *(Ownership enforced)*

### Admin
- `GET /api/admin/stats` — Revenue, total bookings, movie count, user count *(Admin only)*
- `GET /api/admin/bookings` — Full audit log of all system bookings *(Admin only)*

---

## 14. Authentication & Authorization

- **Password Hashing**: Uses `bcryptjs` with salt cost 10 before saving to database. Plaintext passwords are never logged or stored.
- **JWT Tokens**: Signed with `JWT_SECRET` containing user ID, email, and role.
- **Route Guards**:
  - `verifyToken`: Validates Authorization Bearer token header.
  - `requireAdmin`: Enforces `req.user.role === 'admin'`. Unauthorized requests receive `403 Forbidden`.

---

## 15. Seat Reservation & Concurrency Safety

To prevent two users from booking the exact same seat at the same time, the server uses **atomic conditional MongoDB updates**:

```typescript
const updatedShowtime = await Showtime.findOneAndUpdate(
  {
    _id: showtimeId,
    bookedSeats: { $nin: requestedSeats } // Atomic pre-condition
  },
  {
    $addToSet: { bookedSeats: { $each: requestedSeats } }
  },
  { returnDocument: 'after' }
);
```

- If another request claims any of the requested seats even 1 millisecond earlier, `findOneAndUpdate` returns `null`.
- The server then returns HTTP status `409 Conflict` informing the client that the seat was taken, without corrupting state.
- If booking document generation encounters any error, an automated rollback executes:
  ```typescript
  await Showtime.updateOne(
    { _id: showtime._id },
    { $pull: { bookedSeats: { $in: requestedSeats } } }
  );
  ```

---

## 16. Testing & Verification

Automated test suite covering all 12 core backend requirements:

```bash
npm test
```

### Verified Scenarios:
1. User Registration with bcrypt password hash
2. Duplicate email rejection
3. Successful login & JWT issuance
4. Invalid login credential rejection
5. Protected route rejection of forged tokens
6. Movie retrieval & genre filtering
7. Invalid showtime error handling
8. Successful atomic seat reservation
9. Already-booked seat rejection (409 Conflict)
10. Concurrency race-condition protection (5 simultaneous requests for the same seat produce exactly 1 winner)
11. Private booking ownership verification
12. Role-based admin route privilege restriction

---

## 17. Build Instructions

Build client static assets:
```bash
npm run build
```
Production assets are generated in the `dist/` directory.

---

## 18. Deployment Instructions

### Deploy to Render / Railway / Cloud Run:
1. Set the Start command to:
   ```bash
   npm run build && node dist/server.js (or "dev": "tsx server.ts")
   ```
2. Configure environment variables in the host dashboard:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `MONGODB_URI=<your-atlas-uri>`
   - `JWT_SECRET=<strong-random-key>`
3. Build & deploy!

---

## 19. Common Errors & Troubleshooting

- **MongoDB Connection Timeout**: Ensure your MongoDB Atlas Network Access whitelist includes `0.0.0.0/0` or the server IP.
- **Token Expired Error (401)**: The client automatically clears invalid tokens and prompts for re-login.
- **Port 3000 in use**: Specify another port: `PORT=3001 npm run dev`.

---

## 20. Security Considerations

- Passwords hashed using bcrypt (10 rounds).
- HTTP-Only Bearer token authorization checks.
- Zero client-side authority over ticket pricing or seat validation.
- Sanitized regex queries to prevent NoSQL query injection.
- Role verification enforced on every administrative API endpoint.

---

## 21. Known Limitations

- Real credit card processing is simulated via demonstration checkout.
- Screen resolutions scale up to 60 seats (6x10 grid) per screen in demo layouts.

---

## 22. Future Improvements

- Stripe / PayPal payment gateway webhook integration.
- SMS / WhatsApp ticket delivery with Twilio.
- Concession snack pre-ordering (popcorn, beverages) during seat checkout.
- Multi-language localization (Spanish, French, Japanese).

---

## License

This project is licensed under the [MIT License](./LICENSE).
