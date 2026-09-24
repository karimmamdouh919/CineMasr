import 'dotenv/config';
import express from 'express';
import { connectDB } from './src/db/dbConnection.js';
import movieRoutes from './src/modules/movies/movie.routes.js';
import categoryRoutes from './src/modules/categories/category.routes.js';
import cinemaRoutes from './src/modules/cinemas/cinema.routes.js';
import hallRoutes from './src/modules/halls/hall.routes.js';
import theaterTypeRoutes from './src/modules/theaterTypes/theaterType.routes.js';
import showtimeRoutes from './src/modules/showtimes/showtime.routes.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();

connectDB();

app.use(express.json());

// Routes
app.use('/api', movieRoutes);
app.use('/api', categoryRoutes);
app.use('/api', cinemaRoutes);
app.use('/api', hallRoutes);
app.use('/api', theaterTypeRoutes);
app.use('/api', showtimeRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'CineMasr API is running 🎬' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
