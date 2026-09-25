const db = {
  movies: [
    { id: 1, title: 'Inception', description: 'A mind-bending heist thriller.', runningTime: 148, genres: ['Sci-Fi', 'Action'], releaseDate: '2010-07-16', ageRating: 'PG-13', starring: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt'], posterUrl: '', trailerUrl: '', status: 'Now Showing' },
    { id: 2, title: 'The Batman', description: 'Batman investigates Gotham corruption.', runningTime: 176, genres: ['Action', 'Crime'], releaseDate: '2022-03-04', ageRating: 'PG-13', starring: ['Robert Pattinson', 'Zoë Kravitz'], posterUrl: '', trailerUrl: '', status: 'Now Showing' }
  ],
  cinemas: [
    { id: 1, name: 'CineMisr October', city: '6th of October', location: 'Mall of Arabia' }
  ],
  halls: [
    { id: 1, cinemaId: 1, name: 'Hall 1', type: 'Standard', totalRows: 8, totalCols: 10 },
    { id: 2, cinemaId: 1, name: 'Hall 2 IMAX', type: 'IMAX', totalRows: 10, totalCols: 12 }
  ],
  snacks: [
    { id: 1, name: 'Popcorn', price: 45, imageUrl: '', category: 'Popcorn' },
    { id: 2, name: 'Pepsi', price: 25, imageUrl: '', category: 'Beverage' },
    { id: 3, name: 'Candy Mix', price: 30, imageUrl: '', category: 'Candy' }
  ],
  showtimes: [
    { id: 1, movieId: 1, hallId: 1, price: 100, startTime: '2026-09-28T18:30' },
    { id: 2, movieId: 2, hallId: 2, price: 120, startTime: '2026-09-29T21:00' }
  ],
  users: [
    { id: 1, first_name: 'Karim', last_name: 'Mamdouh', email: 'karim@example.com', phone: '01000000000', role: 'user', assignedCinemaId: null, birthdate: '2000-01-01', gender: 'Male' },
    { id: 2, first_name: 'Admin', last_name: 'User', email: 'admin@cinemisr.com', phone: '01111111111', role: 'admin', assignedCinemaId: null, birthdate: '1995-05-05', gender: 'Female' }
  ],
  bookings: [
    { id: 1, userId: 1, showtimeId: 1, seats: ['A1', 'A2'], seatType: 'Standard', pricePerSeat: 100, snacksText: 'Popcorn:1', taxAmount: 5, discountAmount: 0, paymentStatus: 'paid', bookingStatus: 'confirmed', refundDetails: null }
  ]
};

const nextId = { movies: 3, cinemas: 2, halls: 3, snacks: 4, showtimes: 3, users: 3, bookings: 2 };
const SNACK_CATEGORIES = ['Popcorn', 'Beverage', 'Candy', 'Combos', 'Nachos', 'Other'];

function getCinemaName(id) { const c = db.cinemas.find(x => x.id === id); return c ? c.name : '—'; }
function getMovieTitle(id) { const m = db.movies.find(x => x.id === id); return m ? m.title : '—'; }
function getHallName(id) { const h = db.halls.find(x => x.id === id); return h ? h.name : '—'; }
function getUserName(id) { const u = db.users.find(x => x.id === id); return u ? `${u.first_name} ${u.last_name}` : '—'; }

function snackUnitPrice(name) {
  const s = db.snacks.find(x => x.name.toLowerCase() === name.trim().toLowerCase());
  return s ? s.price : 0;
}

function parseTags(str) { return (str || '').split(',').map(s => s.trim()).filter(Boolean); }

function calcBookingTotals(record) {
  const ticketsSubtotal = (record.seats ? record.seats.length : 0) * (Number(record.pricePerSeat) || 0);
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

const CONFIGS = {
  movies: {
    label: 'Movies',
    subtitle: 'Create, edit and manage movies',
    data: () => db.movies,
    search: (r, t) => r.title.toLowerCase().includes(t),
    filters: [
      { key: 'ageRating', label: 'Age Rating', options: () => ['G', 'PG', 'PG-13', 'R', 'NC-17'], match: (r, v) => r.ageRating === v },
      { key: 'genre', label: 'Genre', options: () => [...new Set(db.movies.flatMap(m => m.genres))], match: (r, v) => r.genres.includes(v) }
    ],
    columns: [
      { label: 'Title', sortKey: 'title', render: r => r.title },
      { label: 'Genres', render: r => r.genres.join(', ') },
      { label: 'Release Date', sortKey: 'releaseDate', render: r => r.releaseDate },
      { label: 'Age Rating', sortKey: 'ageRating', render: r => r.ageRating },
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
    ],
    onDelete: r => { db.showtimes = db.showtimes.filter(s => s.movieId !== r.id); }
  },

  cinemas: {
    label: 'Cinemas',
    subtitle: 'Manage cinema branches',
    data: () => db.cinemas,
    search: (r, t) => r.name.toLowerCase().includes(t),
    filters: [],
    columns: [
      { label: 'Name', sortKey: 'name', render: r => r.name },
      { label: 'City', sortKey: 'city', render: r => r.city },
      { label: 'Location', render: r => r.location },
      { label: 'Halls', render: r => db.halls.filter(h => h.cinemaId === r.id).length }
    ],
    rowActions: r => [{ label: 'View Halls', onClick: () => goToFiltered('halls', r.name) }],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'city', label: 'City', type: 'text', required: true },
      { name: 'location', label: 'Location', type: 'text' }
    ],
    onDelete: r => {
      const hallIds = db.halls.filter(h => h.cinemaId === r.id).map(h => h.id);
      db.showtimes = db.showtimes.filter(s => !hallIds.includes(s.hallId));
      db.halls = db.halls.filter(h => h.cinemaId !== r.id);
    }
  },

  halls: {
    label: 'Halls',
    subtitle: 'Manage halls and seat layouts',
    data: () => db.halls,
    search: (r, t) => r.name.toLowerCase().includes(t),
    filters: [
      { key: 'type', label: 'Type', options: () => ['Standard', 'IMAX', '4DX', 'VIP'], match: (r, v) => r.type === v }
    ],
    columns: [
      { label: 'Name', sortKey: 'name', render: r => r.name },
      { label: 'Type', sortKey: 'type', render: r => r.type },
      { label: 'Rows x Cols', render: r => `${r.totalRows} x ${r.totalCols}` }
    ],
    rowActions: r => [{ label: 'Seat Layout', onClick: () => showHallLayout(r) }],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'select', options: () => ['Standard', 'IMAX', '4DX', 'VIP'] },
      { name: 'totalRows', label: 'Total Rows', type: 'number', required: true },
      { name: 'totalCols', label: 'Total Columns', type: 'number', required: true }
    ],
    beforeSave: newRecord => { if (!newRecord.cinemaId) newRecord.cinemaId = db.cinemas[0]?.id || 1; },
    onDelete: r => { db.showtimes = db.showtimes.filter(s => s.hallId !== r.id); }
  },

  snacks: {
    label: 'Snacks',
    subtitle: 'Manage snacks menu',
    data: () => db.snacks,
    search: (r, t) => r.name.toLowerCase().includes(t),
    filters: [{ key: 'category', label: 'Category', options: () => SNACK_CATEGORIES, match: (r, v) => r.category === v }],
    columns: [
      { label: 'Name', sortKey: 'name', render: r => r.name },
      { label: 'Price', sortKey: 'price', render: r => `EGP ${r.price}` },
      { label: 'Category', sortKey: 'category', render: r => r.category }
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
      { label: 'Price', sortKey: 'price', render: r => `EGP ${r.price}` },
      { label: 'Start Time', sortKey: 'startTime', render: r => new Date(r.startTime).toLocaleString() },
      { label: 'End Time', render: () => 'Auto (backend)' }
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
    search: (r, t) => `${r.first_name} ${r.last_name} ${r.email}`.toLowerCase().includes(t),
    filters: [{ key: 'role', label: 'Role', options: () => ['user', 'staff', 'admin'], match: (r, v) => r.role === v }],
    columns: [
      { label: 'Name', sortKey: 'first_name', render: r => `${r.first_name} ${r.last_name}` },
      { label: 'Email', sortKey: 'email', render: r => r.email },
      { label: 'Role', sortKey: 'role', render: r => r.role },
      { label: 'Phone', render: r => r.phone }
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
      { label: 'Showtime', render: r => `${getMovieTitle(db.showtimes.find(s => s.id === r.showtimeId)?.movieId)} — ${new Date(db.showtimes.find(s => s.id === r.showtimeId)?.startTime || '').toLocaleString()}` },
      { label: 'Total', render: r => `EGP ${calcBookingTotals(r).total}` },
      { label: 'Payment', render: r => `<span class="badge ${r.paymentStatus}">${r.paymentStatus}</span>` },
      { label: 'Status', render: r => `<span class="badge ${r.bookingStatus}">${r.bookingStatus}</span>` }
    ],
    rowActions: r => r.paymentStatus !== 'refunded' ? [{ label: 'Refund', onClick: () => openRefundModal(r) }] : [],
    fields: [
      { name: 'userId', label: 'User', type: 'select', required: true, options: () => db.users.map(u => ({ value: u.id, label: `${u.first_name} ${u.last_name}` })) },
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

function switchSection(section) {
  currentSection = section;
  searchTerm = pendingSearch || '';
  pendingSearch = null;
  activeFilters = {};
  sortKey = CONFIGS[section]?.defaultSort?.key || null;
  sortDir = CONFIGS[section]?.defaultSort?.dir || 'asc';
  currentPage = 1;

  navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === section));
  adminPage.classList.toggle('dashboard-active', section === 'dashboard');

  if (section === 'dashboard') {
    pageTitle.textContent = 'Admin Dashboard 🎬';
    pageSubtitle.textContent = "Here's what's happening across CineMisr today";
    statsGrid.classList.remove('hidden');
    renderStats();
    sectionContent.innerHTML = '';
    return;
  }

  statsGrid.classList.add('hidden');
  const cfg = CONFIGS[section];
  pageTitle.textContent = cfg.label;
  pageSubtitle.textContent = cfg.subtitle;
  renderSection(section);
}

function renderStats() {
  const revenue = db.bookings.reduce((s, b) => s + calcBookingTotals(b).total, 0);
  statsGrid.innerHTML = `
    <div class="stat-card"><div class="stat-icon">🎬</div><div class="stat-value">${db.movies.length}</div><div class="stat-label">Movies</div></div>
    <div class="stat-card"><div class="stat-icon">🎟️</div><div class="stat-value">${db.bookings.length}</div><div class="stat-label">Bookings</div></div>
    <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-value">${db.users.length}</div><div class="stat-label">Users</div></div>
    <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-value">EGP ${revenue}</div><div class="stat-label">Revenue</div></div>
  `;
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

  document.getElementById('searchInput').addEventListener('input', e => { searchTerm = e.target.value; currentPage = 1; renderSection(section); });
  document.getElementById('addBtn').addEventListener('click', () => openFormModal(section, null));
  document.getElementById('rowsPerPage').addEventListener('change', e => { rowsPerPage = Number(e.target.value); currentPage = 1; renderSection(section); });

  sectionContent.querySelectorAll('.page-numbers button').forEach(btn => {
    btn.addEventListener('click', () => { currentPage = Number(btn.dataset.page); renderSection(section); });
  });

  sectionContent.querySelectorAll('[data-filter-key]').forEach(sel => {
    sel.addEventListener('change', e => { activeFilters[e.target.dataset.filterKey] = e.target.value; currentPage = 1; renderSection(section); });
  });

  sectionContent.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sortKey;
      if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortKey = key; sortDir = 'asc'; }
      renderSection(section);
    });
  });

  sectionContent.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const record = cfg.data().find(r => r.id === id);
      if (btn.dataset.action === 'edit') openFormModal(section, record);
      else if (btn.dataset.action === 'delete') deleteRecord(section, record);
      else if (btn.dataset.action === 'extra') cfg.rowActions(record)[Number(btn.dataset.extra)].onClick();
    });
  });
}

function deleteRecord(section, record) {
  if (!confirm(`Delete this ${CONFIGS[section].label.slice(0, -1).toLowerCase()}? This cannot be undone.`)) return;
  if (CONFIGS[section].onDelete) CONFIGS[section].onDelete(record);
  db[section] = db[section].filter(r => r.id !== record.id);
  renderSection(section);
  if (currentSection === 'dashboard') renderStats();
}

const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

function closeModal() { modalOverlay.classList.add('hidden'); modalBody.innerHTML = ''; }
document.getElementById('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

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
  modalTitle.textContent = record ? `Edit ${cfg.label.slice(0, -1)}` : `Add ${cfg.label.slice(0, -1)}`;

  const fieldsHtml = cfg.fields.map(f => renderField(f, record)).join('');
  const summaryHtml = cfg.isBookingForm ? `<div class="computed-summary" id="bookingSummary"></div>` : '';

  modalBody.innerHTML = `
    <form class="admin-form" id="entityForm">
      ${summaryHtml}
      ${fieldsHtml}
      <button type="submit" class="btn-primary" style="width:100%;">${record ? 'Save Changes' : 'Create'}</button>
    </form>
  `;
  modalOverlay.classList.remove('hidden');

  if (section === 'snacks') {
    const categorySelect = document.querySelector('#entityForm [name="category"]');
    const customField = document.querySelector('.field-customCategory');
    const toggleCustom = () => { customField.style.display = categorySelect.value === 'Other' ? 'block' : 'none'; };
    categorySelect.addEventListener('change', toggleCustom);
    toggleCustom();
  }

  if (cfg.isBookingForm) {
    const updateSummary = () => {
      const form = document.getElementById('entityForm');
      const fd = new FormData(form);
      const temp = {
        seats: parseTags(fd.get('seats')),
        pricePerSeat: fd.get('pricePerSeat'),
        snacksText: fd.get('snacksText'),
        taxAmount: fd.get('taxAmount'),
        discountAmount: fd.get('discountAmount')
      };
      const t = calcBookingTotals(temp);
      document.getElementById('bookingSummary').innerHTML = `
        <div><span>Tickets Subtotal</span><span>EGP ${t.ticketsSubtotal}</span></div>
        <div><span>Snacks Subtotal</span><span>EGP ${t.snacksSubtotal}</span></div>
        <div><span>Tax</span><span>EGP ${t.tax}</span></div>
        <div><span>Discount</span><span>-EGP ${t.discount}</span></div>
        <div class="total"><span>Total</span><span>EGP ${t.total}</span></div>
      `;
    };
    document.getElementById('entityForm').addEventListener('input', updateSummary);
    updateSummary();
  }

  document.getElementById('entityForm').addEventListener('submit', e => {
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

    if (record) {
      const idx = db[section].findIndex(r => r.id === record.id);
      db[section][idx] = newRecord;
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
  modalTitle.textContent = `Refund Booking #${booking.id}`;
  modalBody.innerHTML = `
    <form class="admin-form" id="refundForm">
      <div class="form-group"><label>Refund Amount</label><input type="number" name="refundedAmount" value="${totals.total}"></div>
      <div class="form-group"><label>Reason</label><textarea name="reason" required></textarea></div>
      <div class="form-group"><label>Refunded At</label><input type="date" name="refundedAt" value="${new Date().toISOString().slice(0, 10)}"></div>
      <button type="submit" class="btn-primary" style="width:100%;">Confirm Refund</button>
    </form>
  `;
  modalOverlay.classList.remove('hidden');

  document.getElementById('refundForm').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    booking.refundDetails = {
      refundedAmount: Number(fd.get('refundedAmount')),
      reason: fd.get('reason'),
      refundedAt: fd.get('refundedAt')
    };
    booking.paymentStatus = 'refunded';
    closeModal();
    renderSection('bookings');
  });
}

function showHallLayout(hall) {
  modalTitle.textContent = `${hall.name} — Seat Layout`;
  let grid = '<div class="hall-preview">';
  for (let r = 0; r < hall.totalRows; r++) {
    grid += '<div class="seat-row">';
    for (let c = 1; c <= hall.totalCols; c++) {
      grid += `<div class="seat" style="pointer-events:none;">${c}</div>`;
    }
    grid += '</div>';
  }
  grid += '</div>';
  modalBody.innerHTML = grid;
  modalOverlay.classList.remove('hidden');
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    switchSection(link.dataset.section);
  });
});

switchSection('dashboard');