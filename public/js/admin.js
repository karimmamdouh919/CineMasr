let db = {
  movies: [],
  cinemas: [],
  halls: [],
  snacks: [],
  showtimes: [],
  users: [],
  bookings: []
};

const nextId = { movies: 1, cinemas: 1, halls: 1, snacks: 1, showtimes: 1, users: 1, bookings: 1 };
const SNACK_CATEGORIES = ['Popcorn', 'Beverage', 'Candy', 'Combos', 'Nachos', 'Other'];

const MOVIE_IMAGES = {
  'Inception': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=120&q=80',
  'The Batman': 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=120&q=80',
};
const CINEMA_IMG = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&q=80';

// ── API HELPERS ──────────────────────────────────────────────────
function normalizeRecord(item) {
  if (!item) return item;
  return {
    ...item,
    id: item.id || String(item._id),
    genres: Array.isArray(item.genres) ? item.genres : (item.genres ? String(item.genres).split(',').map(s => s.trim()) : []),
    starring: Array.isArray(item.starring) ? item.starring : (item.starring ? String(item.starring).split(',').map(s => s.trim()) : [])
  };
}

function extractArray(resData, section) {
  if (Array.isArray(resData)) return resData;
  if (!resData || typeof resData !== 'object') return null;
  if (Array.isArray(resData.data)) return resData.data;
  if (Array.isArray(resData[section])) return resData[section];
  if (resData.data && Array.isArray(resData.data[section])) return resData.data[section];
  if (resData.data && Array.isArray(resData.data.items)) return resData.data.items;
  return null;
}

async function syncSectionData(section) {
  if (typeof api === 'undefined') return db[section] || [];
  try {
    const res = await api.get(`/${section}`);
    const dataArray = extractArray(res.data, section);
    if (dataArray) {
      db[section] = dataArray.map(normalizeRecord);
    }
  } catch (err) {
    console.warn(`API fetch for /${section} failed:`, err.message);
  }
  return db[section] || [];
}

async function syncAllData() {
  const sections = ['movies', 'cinemas', 'halls', 'snacks', 'showtimes', 'users', 'bookings'];
  await Promise.all(sections.map(s => syncSectionData(s)));
}

// ── GETTER HELPERS ───────────────────────────────────────────────
function getCinemaName(id) { const c = db.cinemas.find(x => String(x.id) === String(id)); return c ? c.name : '—'; }
function getMovieTitle(id) { const m = db.movies.find(x => String(x.id) === String(id)); return m ? m.title : '—'; }
function getHallName(id) { const h = db.halls.find(x => String(x.id) === String(id)); return h ? h.name : '—'; }
function getUserName(id) {
  const u = db.users.find(x => String(x.id) === String(id));
  return u ? `${u.first_name || u.firstName || ''} ${u.last_name || u.lastName || ''}`.trim() : '—';
}

function snackUnitPrice(name) {
  if (!name) return 0;
  const s = db.snacks.find(x => x.name && x.name.toLowerCase() === String(name).trim().toLowerCase());
  return s ? s.price : 0;
}

function parseTags(str) {
  if (Array.isArray(str)) return str;
  if (typeof str !== 'string') return [];
  return (str || '').split(',').map(s => s.trim()).filter(Boolean);
}

function calcBookingTotals(record) {
  if (!record) return { ticketsSubtotal: 0, snacksSubtotal: 0, tax: 0, discount: 0, total: 0 };
  const seatCount = Array.isArray(record.seats) ? record.seats.length : parseTags(record.seats).length;
  const ticketsSubtotal = seatCount * (Number(record.pricePerSeat) || 0);
  
  let snacksSubtotal = 0;
  parseTags(record.snacksText).forEach(pair => {
    const [name, qty] = pair.split(':');
    if (name && qty) snacksSubtotal += snackUnitPrice(name) * Number(qty);
  });
  const tax = Number(record.taxAmount) || 0;
  const discount = Number(record.discountAmount) || 0;
  const total = ticketsSubtotal + snacksSubtotal + tax - discount;
  return { ticketsSubtotal, snacksSubtotal, tax, discount, total };
}

// ── CONFIGURATIONS ───────────────────────────────────────────────
const CONFIGS = {
  movies: {
    label: 'Movies',
    subtitle: 'Create, edit and manage movies',
    data: () => db.movies,
    search: (r, t) => (r.title || '').toLowerCase().includes(t),
    filters: [
      { key: 'ageRating', label: 'Age Rating', options: () => ['G', 'PG', 'PG-13', 'R', 'NC-17'], match: (r, v) => r.ageRating === v },
      { key: 'genre', label: 'Genre', options: () => [...new Set(db.movies.flatMap(m => m.genres || []))], match: (r, v) => (r.genres || []).includes(v) }
    ],
    columns: [
      { label: 'Title', sortKey: 'title', render: r => r.title || '—' },
      { label: 'Genres', render: r => (r.genres || []).join(', ') || '—' },
      { label: 'Release Date', sortKey: 'releaseDate', render: r => r.releaseDate || '—' },
      { label: 'Age Rating', sortKey: 'ageRating', render: r => r.ageRating || '—' },
      { label: 'Status', render: r => r.status || '—' }
    ],
    rowActions: r => [{ label: 'Showtimes', onClick: () => goToFiltered('showtimes', r.title) }],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'runningTime', label: 'Running Time (min)', type: 'number' },
      { name: 'genres', label: 'Genres (comma separated)', type: 'tags' },
      { name: 'releaseDate', label: 'Release Date', type: 'date' },
      { name: 'ageRating', label: 'Age Rating', type: 'select', options: () => ['G', 'PG', 'PG-13', 'R', 'NC-17'] },
      { name: 'starring', label: 'Starring (comma separated)', type: 'tags' },
      { name: 'posterUrl', label: 'Poster URL', type: 'text' },
      { name: 'trailerUrl', label: 'Trailer URL', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: () => ['Now Showing', 'Coming Soon', 'Ended'] }
    ]
  },

  cinemas: {
    label: 'Cinemas',
    subtitle: 'Manage cinema branches',
    data: () => db.cinemas,
    search: (r, t) => (r.name || '').toLowerCase().includes(t),
    filters: [],
    columns: [
      { label: 'Name', sortKey: 'name', render: r => r.name || '—' },
      { label: 'City', sortKey: 'city', render: r => r.city || '—' },
      { label: 'Location', render: r => r.location || r.address || '—' },
      { label: 'Halls', render: r => db.halls.filter(h => String(h.cinemaId) === String(r.id)).length }
    ],
    rowActions: r => [{ label: 'View Halls', onClick: () => goToFiltered('halls', r.name) }],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'city', label: 'City', type: 'text', required: true },
      { name: 'location', label: 'Location', type: 'text' }
    ]
  },

  halls: {
    label: 'Halls',
    subtitle: 'Manage halls and seat layouts',
    data: () => db.halls,
    search: (r, t) => (r.name || '').toLowerCase().includes(t),
    filters: [
      { key: 'type', label: 'Type', options: () => ['Standard', 'IMAX', '4DX', 'VIP'], match: (r, v) => r.type === v }
    ],
    columns: [
      { label: 'Name', sortKey: 'name', render: r => r.name || '—' },
      { label: 'Type', sortKey: 'type', render: r => r.type || 'Standard' },
      { label: 'Rows x Cols', render: r => `${r.totalRows || 8} x ${r.totalCols || 10}` }
    ],
    rowActions: r => [{ label: 'Seat Layout', onClick: () => showHallLayout(r) }],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'select', options: () => ['Standard', 'IMAX', '4DX', 'VIP'] },
      { name: 'totalRows', label: 'Total Rows', type: 'number', required: true },
      { name: 'totalCols', label: 'Total Columns', type: 'number', required: true }
    ],
    beforeSave: newRecord => { if (!newRecord.cinemaId) newRecord.cinemaId = db.cinemas[0]?.id || 1; }
  },

  snacks: {
    label: 'Snacks',
    subtitle: 'Manage snacks menu',
    data: () => db.snacks,
    search: (r, t) => (r.name || '').toLowerCase().includes(t),
    filters: [{ key: 'category', label: 'Category', options: () => SNACK_CATEGORIES, match: (r, v) => r.category === v }],
    columns: [
      { label: 'Name', sortKey: 'name', render: r => r.name || '—' },
      { label: 'Price', sortKey: 'price', render: r => `EGP ${r.price || 0}` },
      { label: 'Category', sortKey: 'category', render: r => r.category || '—' }
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'price', label: 'Price (EGP)', type: 'number', required: true },
      { name: 'imageUrl', label: 'Image URL', type: 'text' },
      { name: 'category', label: 'Category', type: 'select', options: () => SNACK_CATEGORIES },
      { name: 'customCategory', label: 'Custom Category Name', type: 'text', showIf: r => r?.category === 'Other' }
    ]
  },

  showtimes: {
    label: 'Showtimes',
    subtitle: 'Manage movie showtimes',
    defaultSort: { key: 'startTime', dir: 'asc' },
    data: () => db.showtimes,
    search: (r, t) => getMovieTitle(r.movieId).toLowerCase().includes(t),
    filters: [
      { key: 'movieId', label: 'Movie', options: () => db.movies.map(m => ({ value: m.id, label: m.title })), match: (r, v) => String(r.movieId) === String(v) },
      { key: 'hallId', label: 'Hall', options: () => db.halls.map(h => ({ value: h.id, label: h.name })), match: (r, v) => String(r.hallId) === String(v) }
    ],
    columns: [
      { label: 'Movie', render: r => getMovieTitle(r.movieId) },
      { label: 'Hall', render: r => getHallName(r.hallId) },
      { label: 'Price', sortKey: 'price', render: r => `EGP ${r.price || 0}` },
      { label: 'Start Time', sortKey: 'startTime', render: r => r.startTime ? new Date(r.startTime).toLocaleString() : '—' },
      { label: 'End Time', render: () => 'Auto' }
    ],
    fields: [
      { name: 'movieId', label: 'Movie', type: 'select', required: true, options: () => db.movies.map(m => ({ value: m.id, label: m.title })) },
      { name: 'hallId', label: 'Hall', type: 'select', required: true, options: () => db.halls.map(h => ({ value: h.id, label: h.name })) },
      { name: 'price', label: 'Price (EGP)', type: 'number', required: true },
      { name: 'startTime', label: 'Start Time', type: 'datetime-local', required: true }
    ]
  },

  users: {
    label: 'Users',
    subtitle: 'Manage users and staff',
    data: () => db.users,
    search: (r, t) => `${r.first_name || r.firstName || ''} ${r.last_name || r.lastName || ''} ${r.email || ''}`.toLowerCase().includes(t),
    filters: [{ key: 'role', label: 'Role', options: () => ['user', 'staff', 'admin'], match: (r, v) => r.role === v }],
    columns: [
      { label: 'Name', sortKey: 'first_name', render: r => getUserName(r.id) },
      { label: 'Email', sortKey: 'email', render: r => r.email || '—' },
      { label: 'Role', sortKey: 'role', render: r => r.role || 'user' },
      { label: 'Phone', render: r => r.phone || '—' }
    ],
    rowActions: r => [{ label: 'Bookings', onClick: () => goToFiltered('bookings', getUserName(r.id)) }],
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text', required: true },
      { name: 'last_name', label: 'Last Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'text', required: true },
      { name: 'password', label: 'Password', type: 'password', hideOnEdit: true },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'role', label: 'Role', type: 'select', options: () => ['user', 'staff', 'admin'] },
      { name: 'assignedCinemaId', label: 'Assigned Cinema (staff/admin)', type: 'select', options: () => [{ value: '', label: '—' }, ...db.cinemas.map(c => ({ value: c.id, label: c.name }))] },
      { name: 'birthdate', label: 'Birthdate', type: 'date' },
      { name: 'gender', label: 'Gender', type: 'select', options: () => ['Male', 'Female'] }
    ]
  },

  bookings: {
    label: 'Bookings',
    subtitle: 'Manage bookings, refunds and payments',
    data: () => db.bookings,
    search: (r, t) => `${r.id} ${getUserName(r.userId)}`.toLowerCase().includes(t),
    filters: [
      { key: 'paymentStatus', label: 'Payment', options: () => ['pending', 'paid', 'failed', 'refunded'], match: (r, v) => r.paymentStatus === v },
      { key: 'bookingStatus', label: 'Booking', options: () => ['confirmed', 'cancelled'], match: (r, v) => r.bookingStatus === v }
    ],
    columns: [
      { label: 'ID', sortKey: 'id', render: r => `#${r.id}` },
      { label: 'User', render: r => getUserName(r.userId) },
      { label: 'Showtime', render: r => {
        const st = db.showtimes.find(s => String(s.id) === String(r.showtimeId));
        return st ? `${getMovieTitle(st.movieId)} — ${new Date(st.startTime).toLocaleString()}` : '—';
      }},
      { label: 'Total', render: r => `EGP ${calcBookingTotals(r).total}` },
      { label: 'Payment', render: r => `<span class="badge ${r.paymentStatus || 'pending'}">${r.paymentStatus || 'pending'}</span>` },
      { label: 'Status', render: r => `<span class="badge ${r.bookingStatus || 'confirmed'}">${r.bookingStatus || 'confirmed'}</span>` }
    ],
    rowActions: r => r.paymentStatus !== 'refunded' ? [{ label: 'Refund', onClick: () => openRefundModal(r) }] : [],
    fields: [
      { name: 'userId', label: 'User', type: 'select', required: true, options: () => db.users.map(u => ({ value: u.id, label: `${u.first_name || u.firstName} ${u.last_name || u.lastName}` })) },
      { name: 'showtimeId', label: 'Showtime', type: 'select', required: true, options: () => db.showtimes.map(s => ({ value: s.id, label: `${getMovieTitle(s.movieId)} — ${new Date(s.startTime).toLocaleString()}` })) },
      { name: 'seats', label: 'Seats (comma separated, e.g. A1,A2)', type: 'tags' },
      { name: 'seatType', label: 'Seat Type', type: 'select', options: () => ['Standard', 'VIP', 'IMAX'] },
      { name: 'pricePerSeat', label: 'Price per Seat', type: 'number' },
      { name: 'snacksText', label: 'Snacks (name:qty, comma separated)', type: 'text' },
      { name: 'taxAmount', label: 'Tax Amount', type: 'number' },
      { name: 'discountAmount', label: 'Discount Amount', type: 'number' },
      { name: 'paymentStatus', label: 'Payment Status', type: 'select', options: () => ['pending', 'paid', 'failed', 'refunded'] },
      { name: 'bookingStatus', label: 'Booking Status', type: 'select', options: () => ['confirmed', 'cancelled'] }
    ],
    isBookingForm: true
  }
};

let currentSection = 'dashboard';
let searchTerm = '';
let activeFilters = {};
let sortKey = null;
let sortDir = 'asc';
let currentPage = 1;
let rowsPerPage = 10;
let pendingSearch = null;

const statsGrid = document.getElementById('statsGrid');
const sectionContent = document.getElementById('sectionContent');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const adminPage = document.getElementById('adminPage');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

function goToFiltered(section, term) {
  pendingSearch = term;
  switchSection(section);
}

async function switchSection(section) {
  currentSection = section;
  searchTerm = pendingSearch || '';
  pendingSearch = null;
  activeFilters = {};
  sortKey = CONFIGS[section]?.defaultSort?.key || null;
  sortDir = CONFIGS[section]?.defaultSort?.dir || 'asc';
  currentPage = 1;

  navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === section));
  if (adminPage) adminPage.classList.toggle('dashboard-active', section === 'dashboard');

  if (section === 'dashboard') {
    if (pageTitle) pageTitle.textContent = 'Admin Dashboard 🎬';
    if (pageSubtitle) pageSubtitle.textContent = "Here's what's happening across CineMisr today";
    if (statsGrid) statsGrid.classList.remove('hidden');
    
    renderStats(); // Immediate render
    await syncAllData(); // Async API update
    renderStats(); // Re-render with fetched API data
    return;
  }

  if (statsGrid) statsGrid.classList.add('hidden');
  const cfg = CONFIGS[section];
  if (pageTitle) pageTitle.textContent = cfg.label;
  if (pageSubtitle) pageSubtitle.textContent = cfg.subtitle;
  
  renderSection(section); // Immediate render
  await syncSectionData(section);
  renderSection(section); // Re-render with API data
}

function renderStats() {
  const revenue = db.bookings.reduce((s, b) => s + calcBookingTotals(b).total, 0);
  if (statsGrid) {
    statsGrid.innerHTML = `
      <div class="stat-card"><div class="stat-icon">🎬</div><div class="stat-value">${db.movies.length}</div><div class="stat-label">Movies</div></div>
      <div class="stat-card"><div class="stat-icon">🎟️</div><div class="stat-value">${db.bookings.length}</div><div class="stat-label">Bookings</div></div>
      <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-value">${db.users.length}</div><div class="stat-label">Users</div></div>
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-value">EGP ${revenue}</div><div class="stat-label">Revenue</div></div>
    `;
  }

  const moviesHtml = db.movies.map(m => {
    const imgUrl = MOVIE_IMAGES[m.title] || m.posterUrl;
    const thumb = imgUrl
      ? `<img class="movie-thumb" src="${imgUrl}" alt="${m.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    return `
    <div class="movie-item">
      ${thumb}
      <div class="movie-thumb-placeholder" style="${imgUrl ? 'display:none' : ''}">🎬</div>
      <div class="movie-info">
        <strong>${m.title || 'Untitled'}</strong>
        <span>${(m.genres || []).join(' · ')} &nbsp;•&nbsp; ${m.runningTime || 120} min</span>
      </div>
      <div class="movie-status"><span class="badge confirmed">${m.status || 'Showing'}</span></div>
    </div>`;
  }).join('');

  const showtimesHtml = db.showtimes.map(s => {
    const d = s.startTime ? new Date(s.startTime) : new Date();
    const hm = d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    const dy = d.toLocaleDateString([], {month:'short', day:'numeric'});
    return `
    <div class="showtime-item">
      <div class="showtime-time">${hm}<small>${dy}</small></div>
      <div class="showtime-info">
        <strong>${getMovieTitle(s.movieId)}</strong>
        <span>${getHallName(s.hallId)}</span>
      </div>
      <div class="showtime-price">EGP ${s.price || 0}</div>
    </div>`;
  }).join('');

  const lastMovieTitle = db.showtimes.length ? getMovieTitle(db.showtimes[db.showtimes.length - 1]?.movieId) : 'Movie';
  const firstUser = db.users[0]?.first_name || 'Guest';

  const activitiesHtml = [
    { color:'green',  text:`New booking #${db.bookings.length || 1} confirmed`, time:'2 min ago' },
    { color:'yellow', text:`Showtime updated for ${lastMovieTitle}`, time:'15 min ago' },
    { color:'green',  text:`User ${firstUser} registered`, time:'1 hr ago' },
    { color:'green',  text:`Total Revenue: EGP ${revenue}`, time:'Today' }
  ].map(a => `
    <div class="activity-item">
      <div class="activity-dot ${a.color}"></div>
      <div class="activity-text"><p>${a.text}</p><time>${a.time}</time></div>
    </div>`).join('');

  if (sectionContent) {
    sectionContent.innerHTML = `
      <div class="dashboard-body">
        <div class="dash-col">
          <div class="section-card">
            <div class="section-card-header">
              <h3>🎬 Now Showing</h3>
              <a href="#" onclick="switchSection('movies');return false">View all →</a>
            </div>
            <div class="movie-list">${moviesHtml || '<div class="empty-note">No movies found.</div>'}</div>
          </div>
          <div class="section-card">
            <div class="section-card-header">
              <h3>📅 Upcoming Showtimes</h3>
              <a href="#" onclick="switchSection('showtimes');return false">View all →</a>
            </div>
            <div class="showtime-list">${showtimesHtml || '<div class="empty-note">No showtimes found.</div>'}</div>
          </div>
        </div>
        <div class="dash-col">
          <div class="section-card" style="overflow:hidden">
            <img src="${CINEMA_IMG}" alt="Cinema" style="width:100%;height:160px;object-fit:cover;display:block;border-bottom:1px solid var(--border)">
            <div class="mini-stat-row">
              <div class="mini-stat"><div class="val">${db.cinemas.length}</div><div class="lbl">Cinemas</div></div>
              <div class="mini-stat"><div class="val">${db.halls.length}</div><div class="lbl">Halls</div></div>
              <div class="mini-stat"><div class="val">${db.snacks.length}</div><div class="lbl">Snacks</div></div>
              <div class="mini-stat"><div class="val">${db.showtimes.length}</div><div class="lbl">Shows</div></div>
            </div>
          </div>
          <div class="section-card">
            <div class="section-card-header">
              <h3>⚡ Recent Activity</h3>
            </div>
            <div class="activity-list">${activitiesHtml}</div>
          </div>
        </div>
      </div>
    `;
  }
}

function renderSection(section) {
  const cfg = CONFIGS[section];
  let rows = cfg.data().slice();

  if (searchTerm) rows = rows.filter(r => cfg.search(r, searchTerm.toLowerCase()));
  Object.keys(activeFilters).forEach(key => {
    const val = activeFilters[key];
    if (!val) return;
    const filterCfg = cfg.filters?.find(f => f.key === key);
    if (filterCfg) rows = rows.filter(r => filterCfg.match(r, val));
  });

  if (sortKey) {
    rows.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;
  const pageRows = rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const filtersHtml = (cfg.filters || []).map(f => {
    const opts = typeof f.options === 'function' ? f.options() : f.options;
    const optHtml = opts.map(o => {
      const value = typeof o === 'object' ? o.value : o;
      const label = typeof o === 'object' ? o.label : o;
      return `<option value="${value}" ${activeFilters[f.key] == value ? 'selected' : ''}>${label}</option>`;
    }).join('');
    return `<select data-filter-key="${f.key}"><option value="">${f.label}: All</option>${optHtml}</select>`;
  }).join('');

  let pageNumbersHtml = '';
  if (totalPages > 1) {
    for (let p = 1; p <= totalPages; p++) {
      pageNumbersHtml += `<button class="${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }
  }

  if (sectionContent) {
    sectionContent.innerHTML = `
      <div class="section-toolbar">
        <div class="toolbar-filters">
          <input type="text" id="searchInput" placeholder="Search ${cfg.label.toLowerCase()}..." value="${searchTerm}">
          ${filtersHtml}
        </div>
        <button type="button" class="add-btn" id="addBtn">+ Add ${cfg.label.slice(0, -1)}</button>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead><tr>
            ${cfg.columns.map(c => `<th class="${c.sortKey ? 'sortable' : ''}" data-sort-key="${c.sortKey || ''}">${c.label}${sortKey === c.sortKey && c.sortKey ? `<span class="sort-arrow">${sortDir === 'asc' ? '▲' : '▼'}</span>` : ''}</th>`).join('')}
            <th>Actions</th>
          </tr></thead>
          <tbody>
            ${pageRows.length === 0 ? `<tr><td colspan="${cfg.columns.length + 1}"><div class="empty-note">No ${cfg.label.toLowerCase()} found.</div></td></tr>` : pageRows.map(r => `
              <tr>
                ${cfg.columns.map(c => `<td>${c.render(r)}</td>`).join('')}
                <td>
                  <button class="table-action-btn" data-action="edit" data-id="${r.id}">Edit</button>
                  <button class="table-action-btn danger" data-action="delete" data-id="${r.id}">Delete</button>
                  ${(cfg.rowActions ? cfg.rowActions(r) : []).map((a, i) => `<button class="table-action-btn" data-action="extra" data-id="${r.id}" data-extra="${i}">${a.label}</button>`).join('')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="pagination">
          <div>Rows per page: <select id="rowsPerPage">
            <option value="5" ${rowsPerPage === 5 ? 'selected' : ''}>5</option>
            <option value="10" ${rowsPerPage === 10 ? 'selected' : ''}>10</option>
            <option value="20" ${rowsPerPage === 20 ? 'selected' : ''}>20</option>
          </select></div>
          ${totalPages > 1 ? `<div class="page-numbers">${pageNumbersHtml}</div>` : ''}
        </div>
      </div>
    `;
  }

  document.getElementById('searchInput')?.addEventListener('input', e => { searchTerm = e.target.value; currentPage = 1; renderSection(section); });
  document.getElementById('addBtn')?.addEventListener('click', () => openFormModal(section, null));
  document.getElementById('rowsPerPage')?.addEventListener('change', e => { rowsPerPage = Number(e.target.value); currentPage = 1; renderSection(section); });

  sectionContent?.querySelectorAll('.page-numbers button').forEach(btn => {
    btn.addEventListener('click', () => { currentPage = Number(btn.dataset.page); renderSection(section); });
  });

  sectionContent?.querySelectorAll('[data-filter-key]').forEach(sel => {
    sel.addEventListener('change', e => { activeFilters[e.target.dataset.filterKey] = e.target.value; currentPage = 1; renderSection(section); });
  });

  sectionContent?.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sortKey;
      if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortKey = key; sortDir = 'asc'; }
      renderSection(section);
    });
  });

  sectionContent?.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const record = cfg.data().find(r => String(r.id) === String(id));
      if (btn.dataset.action === 'edit') openFormModal(section, record);
      else if (btn.dataset.action === 'delete') deleteRecord(section, record);
      else if (btn.dataset.action === 'extra') cfg.rowActions(record)[Number(btn.dataset.extra)].onClick();
    });
  });
}

async function deleteRecord(section, record) {
  if (!confirm(`Delete this ${CONFIGS[section].label.slice(0, -1).toLowerCase()}? This cannot be undone.`)) return;

  if (typeof api !== 'undefined') {
    try {
      await api.delete(`/${section}/${record._id || record.id}`);
    } catch (err) {
      console.warn(`Failed to delete record via API:`, err.message);
    }
  }

  if (CONFIGS[section].onDelete) CONFIGS[section].onDelete(record);
  db[section] = db[section].filter(r => String(r.id) !== String(record.id));
  renderSection(section);
  if (currentSection === 'dashboard') renderStats();
}

const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

function closeModal() { 
  if (modalOverlay) modalOverlay.classList.add('hidden'); 
  if (modalBody) modalBody.innerHTML = ''; 
}

document.getElementById('modalClose')?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

function fieldValue(field, record) {
  if (!record) return '';
  const v = record[field.name];
  if (field.type === 'tags') return Array.isArray(v) ? v.join(', ') : (v || '');
  return v ?? '';
}

function renderField(field, record) {
  if (field.hideOnEdit && record) return '';
  if (field.showIf && !field.showIf(record)) return `<div class="form-group field-${field.name}" style="display:none;">${fieldInputOnly(field, record)}</div>`;
  return `<div class="form-group field-${field.name}">${fieldInputOnly(field, record)}</div>`;
}

function fieldInputOnly(field, record) {
  const val = fieldValue(field, record);
  if (field.type === 'textarea') {
    return `<label>${field.label}</label><textarea name="${field.name}">${val}</textarea>`;
  }
  if (field.type === 'select') {
    const opts = typeof field.options === 'function' ? field.options() : field.options;
    const optHtml = opts.map(o => {
      const value = typeof o === 'object' ? o.value : o;
      const label = typeof o === 'object' ? o.label : o;
      return `<option value="${value}" ${String(val) === String(value) ? 'selected' : ''}>${label}</option>`;
    }).join('');
    return `<label>${field.label}</label><select name="${field.name}">${optHtml}</select>`;
  }
  return `<label>${field.label}</label><input type="${field.type === 'tags' ? 'text' : field.type}" name="${field.name}" value="${val}" ${field.required ? 'required' : ''}>`;
}

function openFormModal(section, record) {
  const cfg = CONFIGS[section];
  if (modalTitle) modalTitle.textContent = record ? `Edit ${cfg.label.slice(0, -1)}` : `Add ${cfg.label.slice(0, -1)}`;

  const fieldsHtml = cfg.fields.map(f => renderField(f, record)).join('');
  const summaryHtml = cfg.isBookingForm ? `<div class="computed-summary" id="bookingSummary"></div>` : '';

  if (modalBody) {
    modalBody.innerHTML = `
      <form class="admin-form" id="entityForm">
        ${summaryHtml}
        ${fieldsHtml}
        <button type="submit" class="btn-primary" style="width:100%;">${record ? 'Save Changes' : 'Create'}</button>
      </form>
    `;
  }
  if (modalOverlay) modalOverlay.classList.remove('hidden');

  if (section === 'snacks') {
    const categorySelect = document.querySelector('#entityForm [name="category"]');
    const customField = document.querySelector('.field-customCategory');
    const toggleCustom = () => { if (customField) customField.style.display = categorySelect?.value === 'Other' ? 'block' : 'none'; };
    categorySelect?.addEventListener('change', toggleCustom);
    toggleCustom();
  }

  if (cfg.isBookingForm) {
    const updateSummary = () => {
      const form = document.getElementById('entityForm');
      if (!form) return;
      const fd = new FormData(form);
      const temp = {
        seats: parseTags(fd.get('seats')),
        pricePerSeat: fd.get('pricePerSeat'),
        snacksText: fd.get('snacksText'),
        taxAmount: fd.get('taxAmount'),
        discountAmount: fd.get('discountAmount')
      };
      const t = calcBookingTotals(temp);
      const summaryElem = document.getElementById('bookingSummary');
      if (summaryElem) {
        summaryElem.innerHTML = `
          <div><span>Tickets Subtotal</span><span>EGP ${t.ticketsSubtotal}</span></div>
          <div><span>Snacks Subtotal</span><span>EGP ${t.snacksSubtotal}</span></div>
          <div><span>Tax</span><span>EGP ${t.tax}</span></div>
          <div><span>Discount</span><span>-EGP ${t.discount}</span></div>
          <div class="total"><span>Total</span><span>EGP ${t.total}</span></div>
        `;
      }
    };
    document.getElementById('entityForm')?.addEventListener('input', updateSummary);
    updateSummary();
  }

  document.getElementById('entityForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newRecord = record ? { ...record } : { id: nextId[section]++ };

    cfg.fields.forEach(f => {
      if (f.hideOnEdit && record) return;
      let val = fd.get(f.name);
      if (f.type === 'tags') val = parseTags(val);
      else if (f.type === 'number') val = val === '' ? 0 : Number(val);
      newRecord[f.name] = val;
    });

    if (section === 'snacks' && newRecord.category === 'Other' && newRecord.customCategory) {
      newRecord.category = newRecord.customCategory;
    }
    delete newRecord.customCategory;

    if (cfg.beforeSave) cfg.beforeSave(newRecord);

    if (typeof api !== 'undefined') {
      try {
        if (record) {
          const res = await api.put(`/${section}/${record.id}`, newRecord);
          if (res.data) Object.assign(newRecord, normalizeRecord(res.data));
        } else {
          const res = await api.post(`/${section}`, newRecord);
          if (res.data) Object.assign(newRecord, normalizeRecord(res.data));
        }
      } catch (err) {
        console.warn(`Failed to save record to API endpoint /${section}:`, err.message);
      }
    }

    if (record) {
      const idx = db[section].findIndex(r => String(r.id) === String(record.id));
      if (idx !== -1) db[section][idx] = newRecord;
    } else {
      db[section].push(newRecord);
    }

    closeModal();
    renderSection(section);
    if (currentSection === 'dashboard') renderStats();
  });
}

function openRefundModal(booking) {
  const totals = calcBookingTotals(booking);
  if (modalTitle) modalTitle.textContent = `Refund Booking #${booking.id}`;
  if (modalBody) {
    modalBody.innerHTML = `
      <form class="admin-form" id="refundForm">
        <div class="form-group"><label>Refund Amount</label><input type="number" name="refundedAmount" value="${totals.total}"></div>
        <div class="form-group"><label>Reason</label><textarea name="reason" required></textarea></div>
        <div class="form-group"><label>Refunded At</label><input type="date" name="refundedAt" value="${new Date().toISOString().slice(0, 10)}"></div>
        <button type="submit" class="btn-primary" style="width:100%;">Confirm Refund</button>
      </form>
    `;
  }
  if (modalOverlay) modalOverlay.classList.remove('hidden');

  document.getElementById('refundForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const refundData = {
      refundedAmount: Number(fd.get('refundedAmount')),
      reason: fd.get('reason'),
      refundedAt: fd.get('refundedAt')
    };

    if (typeof api !== 'undefined') {
      try {
        await api.post(`/bookings/${booking.id}/refund`, refundData);
      } catch (err) {
        console.warn(`Failed to process API refund request:`, err.message);
      }
    }

    booking.refundDetails = refundData;
    booking.paymentStatus = 'refunded';
    closeModal();
    renderSection('bookings');
  });
}

function showHallLayout(hall) {
  if (modalTitle) modalTitle.textContent = `${hall.name} — Seat Layout`;
  let grid = '<div class="hall-preview">';
  for (let r = 0; r < (hall.totalRows || 8); r++) {
    grid += '<div class="seat-row">';
    for (let c = 1; c <= (hall.totalCols || 10); c++) {
      grid += `<div class="seat" style="pointer-events:none;">${c}</div>`;
    }
    grid += '</div>';
  }
  grid += '</div>';
  if (modalBody) modalBody.innerHTML = grid;
  if (modalOverlay) modalOverlay.classList.remove('hidden');
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    switchSection(link.dataset.section);
  });
});

// Immediate entry point trigger
switchSection('dashboard');