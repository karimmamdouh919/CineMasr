import 'dotenv/config';
import express from 'express';
import ngrok from '@ngrok/ngrok';
import cors from 'cors';
import { connectDB } from './src/db/dbConnection.js';
import authRoutes from './src/modules/auth/auth.routes.js';
import userRoutes from './src/modules/users/user.routes.js';
import movieRoutes from './src/modules/movies/movie.routes.js';
import cinemaRoutes from './src/modules/cinemas/cinema.routes.js';
import showtimeRoutes from './src/modules/showtimes/showtime.routes.js';
import snackRoutes from './src/modules/snacks/snack.routes.js';
import bookingRoutes from './src/modules/bookings/booking.routes.js';
import adminRoutes from './src/modules/admins/admin.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;
connectDB();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// API Mounting
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/movies', movieRoutes);
app.use('/cinemas', cinemaRoutes);
app.use('/showtimes', showtimeRoutes);
app.use('/snacks', snackRoutes);
app.use('/bookings', bookingRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => res.send("surprise!"));

let listener = null;

app.listen(PORT, async () => {
  console.log(`🚀 Local Express server running on http://localhost:${PORT}`);

  if (process.env.NODE_ENV !== 'production' && process.env.NGROK_AUTHTOKEN) {
    try {
      // 1. Try connecting with your primary static domain
      listener = await ngrok.forward({
        addr: PORT,
        authtoken: process.env.NGROK_AUTHTOKEN,
        domain: process.env.NGROK_DOMAIN,
      });

      process.env.BASE_URL = listener.url();

      console.log(`🔗 Public Tunnel active: ${process.env.BASE_URL}`);

    } catch (error) {
      // 2. If static domain is busy, fall back to a dynamic tunnel for this session
      if (error.message.includes('334') || error.message.includes('already online')) {
        console.warn(`\n⚠️ Static domain busy (${process.env.NGROK_DOMAIN}).`);
        console.warn(`🔄 Spinning up a dynamic tunnel fallback...\n`);

        try {
          listener = await ngrok.forward({
            addr: PORT,
            authtoken: process.env.NGROK_AUTHTOKEN,
          });

          console.log(`🔗 Dynamic Ngrok Tunnel active: ${listener.url()}`);
          console.log(`💳 Paymob Webhook URL: ${listener.url()}/bookings/webhook\n`);
        } catch (fallbackError) {
          console.error('❌ Dynamic Ngrok Fallback Failed:', fallbackError.message);
        }
      } else {
        console.error('❌ Failed to start Ngrok tunnel:', error.message);
      }
    }
  }
});

const closeNgrok = async () => {
  if (listener) {
    console.log('🔌 Closing Ngrok tunnel session...');
    await listener.close();
  }
};

process.once('SIGINT', async () => {
  await closeNgrok();
  process.exit(0);
});

process.once('SIGTERM', async () => {
  await closeNgrok();
  process.exit(0);
});

// Handles Nodemon process restarts (SIGUSR2)
process.once('SIGUSR2', async () => {
  await closeNgrok();
  process.kill(process.pid, 'SIGUSR2');
});