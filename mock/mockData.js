// Minimal mock data so Backend 3 runs on its own.
// The real Users / Movies / Cinemas / Showtimes belong to other teammates.

const ROWS = ['A', 'B', 'C'];
const SEATS_PER_ROW = 5;

const hallSeats = ROWS.flatMap((row) =>
  Array.from({ length: SEATS_PER_ROW }, (_, index) => `${row}${index + 1}`)
);
// -> A1..A5, B1..B5, C1..C5 (15 seats)

const users = [
  { userId: 'USER001', name: 'Ahmed Hassan', email: 'user001@example.com' },
  { userId: 'USER002', name: 'Sara Ali', email: 'user002@example.com' },
  { userId: 'USER003', name: 'Omar Khaled', email: 'user003@example.com' },
];

const hall = {
  hallId: 'HALL001',
  name: 'Main Hall',
  seats: hallSeats,
};

const showtimes = [
  {
    showtimeId: 'SHOW001',
    movieId: 'MOVIE001',
    cinemaId: 'CINEMA001',
    hallId: 'HALL001',
    date: '2026-10-15',
    startTime: '18:00',
    ticketPrice: 120,
  },
  {
    showtimeId: 'SHOW002',
    movieId: 'MOVIE002',
    cinemaId: 'CINEMA001',
    hallId: 'HALL001',
    date: '2026-10-15',
    startTime: '21:00',
    ticketPrice: 150,
  },
];

module.exports = { users, hall, showtimes };