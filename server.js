import 'dotenv/config';
import express from 'express';
import cors from 'cors'
import { connectDB } from './src/db/dbConnection.js';
import authRouter from './src/modules/auth/auth.route.js';
import userRoutes from './src/modules/users/user.routes.js'; 
import adminRoutes from './src/modules/admins/admin.routes.js'; 
import movieRoutes from './src/modules/movies/movie.routes.js';
import cinemaRoutes from './src/modules/cinemas/cinema.routes.js';
import showtimeRoutes from './src/modules/showtimes/showtime.routes.js';
import snackRoutes from './src/modules/snacks/snack.routes.js';
import bookingRoutes from './src/modules/bookings/booking.routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
connectDB();
app.use('/auth', authRouter);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/cinemas', cinemaRoutes);
app.use('/api/v1/showtimes', showtimeRoutes);
app.use('/api/v1/snacks', snackRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/admin', adminRoutes);

app.listen(process.env.PORT);