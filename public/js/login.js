const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const formError = document.getElementById('formError');
const loginBtn = document.getElementById('loginBtn');

function validateEmail(value) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value.trim());
}

function clearErrors() {
  emailError.textContent = '';
  passwordError.textContent = '';
  formError.textContent = '';
  emailInput.classList.remove('input-invalid');
  passwordInput.classList.remove('input-invalid');
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  loginBtn.querySelector('.btn-text').hidden = isLoading;
  loginBtn.querySelector('.btn-loader').hidden = !isLoading;
}

loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  clearErrors();

  let isValid = true;

  if (!emailInput.value.trim()) {
    emailError.textContent = 'Email is required';
    emailInput.classList.add('input-invalid');
    isValid = false;
  } else if (!validateEmail(emailInput.value)) {
    emailError.textContent = 'Please enter a valid email';
    emailInput.classList.add('input-invalid');
    isValid = false;
  }

  if (!passwordInput.value) {
    passwordError.textContent = 'Password is required';
    passwordInput.classList.add('input-invalid');
    isValid = false;
  }

  if (!isValid) return;

  setLoading(true);

  try {
    // TODO: replace with real Backend 1 login endpoint
    await new Promise(resolve => setTimeout(resolve, 800));

    // TODO: replace with real token from backend response
    localStorage.setItem('cinemisr_token', 'mock-token');

    const redirectTo = localStorage.getItem('cinemisr_redirect_after_login') || 'index.html';
    localStorage.removeItem('cinemisr_redirect_after_login');
    window.location.href = redirectTo;

  } catch (err) {
    formError.textContent = err.message || 'Something went wrong, please try again';
  } finally {
    setLoading(false);
  }
});