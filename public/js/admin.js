// TODO: replace with real Backend 4 admin endpoints

function getMockStats() {
  return { totalMovies: 12, totalBookings: 340, totalUsers: 890, totalRevenue: 45600 };
}

function getMockMovies() {
  return [
    { id: 1, title: 'Inception', category: 'Sci-Fi', showtimes: 5 },
    { id: 2, title: 'The Batman', category: 'Action', showtimes: 8 }
  ];
}

function getMockBookings() {
  const last = JSON.parse(localStorage.getItem('cinemisr_last_booking') || 'null');
  return last ? [last] : [];
}

function getMockUsers() {
  return [
    { id: 1, name: 'Karim Mamdouh', email: 'karim@example.com', role: 'user' },
    { id: 2, name: 'Admin User', email: 'admin@cinemisr.com', role: 'admin' }
  ];
}

const statsGrid = document.getElementById('statsGrid');
const sectionContent = document.getElementById('sectionContent');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

function renderStats() {
  const s = getMockStats();
  statsGrid.innerHTML = `
    <div class="stat-card"><div class="stat-value">${s.totalMovies}</div><div class="stat-label">Movies</div></div>
    <div class="stat-card"><div class="stat-value">${s.totalBookings}</div><div class="stat-label">Bookings</div></div>
    <div class="stat-card"><div class="stat-value">${s.totalUsers}</div><div class="stat-label">Users</div></div>
    <div class="stat-card"><div class="stat-value">EGP ${s.totalRevenue}</div><div class="stat-label">Revenue</div></div>
  `;
}

function renderOverview() {
  sectionContent.innerHTML = `<p class="page-subtitle" style="text-align:center;">Select a section above to manage data.</p>`;
}

function renderMovies() {
  const movies = getMockMovies();
  sectionContent.innerHTML = `
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead><tr><th>Title</th><th>Category</th><th>Showtimes</th><th></th></tr></thead>
        <tbody>
          ${movies.map(m => `
            <tr>
              <td>${m.title}</td>
              <td>${m.category}</td>
              <td>${m.showtimes}</td>
              <td><button class="table-action-btn" disabled>Edit</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderBookings() {
  const bookings = getMockBookings();
  if (bookings.length === 0) {
    sectionContent.innerHTML = `<p class="page-subtitle" style="text-align:center;">No bookings found.</p>`;
    return;
  }
  sectionContent.innerHTML = `
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead><tr><th>Booking ID</th><th>Movie</th><th>Seats</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          ${bookings.map(b => `
            <tr>
              <td>${b.bookingId || '—'}</td>
              <td>${b.movieName || '—'}</td>
              <td>${(b.seats || []).join(', ') || '—'}</td>
              <td>EGP ${(b.seatsSubtotal || 0) + (b.snacksSubtotal || 0)}</td>
              <td>${b.status || 'Confirmed'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderUsers() {
  const users = getMockUsers();
  sectionContent.innerHTML = `
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td>${u.name}</td>
              <td>${u.email}</td>
              <td>${u.role}</td>
              <td><button class="table-action-btn" disabled>Manage</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

const sections = { overview: renderOverview, movies: renderMovies, bookings: renderBookings, users: renderUsers };

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    sections[link.dataset.section]();
  });
});

renderStats();
renderOverview();