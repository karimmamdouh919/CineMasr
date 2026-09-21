import 'dotenv/config'
import express from 'express'
import { connectDB } from './src/db/dbConnection.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import movieRoutes from './modules/movies/movie.routes.js';
import cinemaRoutes from './modules/cinemas/cinema.routes.js';
import showtimeRoutes from './modules/showtimes/showtime.routes.js';
import snackRoutes from './modules/snacks/snack.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();
connectDB()

app.use(express.json());

// API Mounting
app.use(authRoutes);
app.use(userRoutes);
app.use(movieRoutes);
app.use(cinemaRoutes);
app.use(showtimeRoutes);
app.use(snackRoutes);
app.use(bookingRoutes);
app.use(adminRoutes);

app.listen(process.env.PORT, ()=> console.log('server is running!'))