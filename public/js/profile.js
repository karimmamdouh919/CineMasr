// ===== TODO: استبدل الداتا الوهمية دي بطلب حقيقي من Backend 1 (Auth & Users) =====
// مثال متوقع:
// const response = await fetch('/api/users/me', {
//   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
// });
// const user = await response.json();
function getMockUser() {
  return {
    name: 'Karim Mamdouh',
    email: 'karim@example.com',
    joinedAt: '2025-03-14'
  };
}

const user = getMockUser();
const container = document.getElementById('profileContent');

function renderProfile() {
  container.innerHTML = `
    <div class="glass-card">
      <div class="profile-field">
        <label>Full Name</label>
        <div class="field-value">${user.name}</div>
      </div>
      <div class="profile-field">
        <label>Email</label>
        <div class="field-value">${user.email}</div>
      </div>
      <div class="profile-field">
        <label>Member Since</label>
        <div class="field-value">${new Date(user.joinedAt).toLocaleDateString()}</div>
      </div>

      <div class="profile-actions">
        <button type="button" id="editProfileBtn" class="btn-secondary">Edit Profile</button>
        <a href="my-bookings.html" class="btn-primary" style="text-align:center; text-decoration:none; display:flex; align-items:center; justify-content:center;">View My Bookings</a>
      </div>
    </div>
  `;

  // TODO: زرار "Edit Profile" لسه مش بيعمل حاجة فعلياً.
  // لازم نتأكد الأول هل فيه PUT/PATCH endpoint لتحديث بيانات المستخدم
  // (مثلاً PUT /api/users/me) قبل ما نبني فورم التعديل.
  // لو موجود، هنبني هنا فورم زي فورم الـ Register تقريبًا (name/email + validation).
  document.getElementById('editProfileBtn').addEventListener('click', () => {
    alert('Edit profile is not available yet — waiting for backend update endpoint.');
  });
}

renderProfile();

// ===== Logout (مؤقت) =====
document.getElementById('logoutLink').addEventListener('click', (e) => {
  // TODO: لما يبقى فيه نظام token حقيقي، نمسح الـ token من localStorage هنا:
  // localStorage.removeItem('token');
  console.log('TODO: clear auth token on logout');
  // الرابط أصلاً بيوديك لـ login.html، فمفيش داعي لـ e.preventDefault()
});