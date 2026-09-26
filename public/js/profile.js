async function loadProfile() {
  try {
    const res = await api.get('/users/profile');
    const user = res.data?.data?.user;
    if (user) renderProfile(user);
  } catch (err) {
    console.error('Failed to load profile:', err.message);
    document.getElementById('profileContent').innerHTML = `
      <div class="glass-card">
        <p style="color: red;">Failed to load profile. Please try again.</p>
      </div>
    `;
  }
}

function renderProfile(user) {
  const name = `${user.first_name} ${user.last_name}`;
  const joinedAt = user.createdAt || user.joinedAt || '';
  const container = document.getElementById('profileContent');

  container.innerHTML = `
    <div class="glass-card">
      <div class="profile-field">
        <label>Full Name</label>
        <div class="field-value">${name}</div>
      </div>
      <div class="profile-field">
        <label>Email</label>
        <div class="field-value">${user.email}</div>
      </div>
      <div class="profile-field">
        <label>Member Since</label>
        <div class="field-value">${joinedAt ? new Date(joinedAt).toLocaleDateString() : 'N/A'}</div>
      </div>

      <div class="profile-actions">
        <button type="button" id="editProfileBtn" class="btn-secondary">Edit Profile</button>
        <a href="my-bookings.html" class="btn-primary" style="text-align:center; text-decoration:none; display:flex; align-items:center; justify-content:center;">View My Bookings</a>
      </div>
    </div>
  `;

  document.getElementById('editProfileBtn').addEventListener('click', () => {
    alert('Edit profile is not available yet — waiting for backend update endpoint.');
  });
}

document.addEventListener('DOMContentLoaded', loadProfile);

// ===== Logout =====
document.getElementById('logoutLink').addEventListener('click', (e) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
});