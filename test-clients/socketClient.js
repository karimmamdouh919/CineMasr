const readline = require('readline');
const { io } = require('socket.io-client');

const [showtimeId = 'SHOW001', userId = 'USER001', url = 'http://localhost:5000'] =
  process.argv.slice(2);

const socket = io(url);
const log = (label, data) => console.log(`[${userId}] ${label}`, data ? JSON.stringify(data) : '');

socket.on('connect', () => {
  log('connected', { socketId: socket.id });
  socket.emit('joinShowtime', { showtimeId }, (ack) => {
    log('joinShowtime ack', { success: ack.success, room: ack.room, message: ack.message });
  });
});

['joinedShowtime', 'seatHeld', 'seatReleased', 'seatBooked', 'seatError'].forEach((eventName) => {
  socket.on(eventName, (data) => {
    if (eventName === 'joinedShowtime') {
      const summary = (data.seats || []).map((s) => `${s.seatNumber}:${s.status[0]}`).join(' ');
      log(`<< ${eventName}`, { room: data.room, seats: summary });
    } else {
      log(`<< ${eventName}`, data);
    }
  });
});

socket.on('connect_error', (error) => log('connect_error', { message: error.message }));

console.log(`Client for ${userId} on ${showtimeId}. Commands: select A5 | release A5 | quit`);

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  const [command, seatNumber] = line.trim().split(/\s+/);

  if (command === 'select') {
    socket.emit('selectSeat', { showtimeId, seatNumber, userId }, (ack) => log('selectSeat ack', ack));
  } else if (command === 'release') {
    socket.emit('releaseSeat', { showtimeId, seatNumber, userId }, (ack) => log('releaseSeat ack', ack));
  } else if (command === 'quit') {
    socket.close();
    process.exit(0);
  } else if (command) {
    console.log('Unknown command. Use: select A5 | release A5 | quit');
  }
});