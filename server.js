require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const Booking = require('./models/Booking');
const SeatHold = require('./models/SeatHold');
const bookingRoutes = require('./routes/bookingRoutes');
const { registerSeatSocket, startExpiryJobs } = require('./sockets/seatSocket');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Database
  await connectDB();
  // Wait until the unique indexes (double-booking protection) are built.
  await Promise.all([Booking.init(), SeatHold.init()]);

  // 2. Express app + middleware
  const app = express();
  app.use(cors());
  app.use(express.json());

  // 3. HTTP server + Socket.IO (Socket.IO needs the raw HTTP server, not just app.listen)
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });
  app.set('io', io); // controllers use it through req.app.get('io')

  // 4. Routes
  app.get('/', (req, res) => {
    res.json({ success: true, message: 'Cinema Booking API (Booking & Seats) is running.' });
  });
  app.use('/api', bookingRoutes);

  // 5. Socket handlers + background expiry job
  registerSeatSocket(io);
  startExpiryJobs(io);

  // 6. Error middleware (must be last)
  app.use(notFound);
  app.use(errorHandler);

  // 7. Start
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Seat hold time: ${process.env.SEAT_HOLD_MINUTES || 5} minute(s)`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});