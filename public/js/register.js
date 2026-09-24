const registerForm = document.getElementById('registerForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const formError = document.getElementById('formError');

const registerBtn = document.getElementById('registerBtn');

function validateEmail(value) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value.trim());
}

function clearErrors() {
  [nameError, emailError, passwordError, confirmPasswordError, formError].forEach(el => {
    el.textContent = '';
  });
  [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(el => {
    el.classList.remove('input-invalid');
  });
}

function setLoading(isLoading) {
  registerBtn.disabled = isLoading;
  registerBtn.querySelector('.btn-text').hidden = isLoading;
  registerBtn.querySelector('.btn-loader').hidden = !isLoading;
}

registerForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  clearErrors();

  let isValid = true;

  if (!nameInput.value.trim()) {
    nameError.textContent = 'Full name is required';
    nameInput.classList.add('input-invalid');
    isValid = false;
  }

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
  } else if (passwordInput.value.length < 6) {
    passwordError.textContent = 'Password must be at least 6 characters';
    passwordInput.classList.add('input-invalid');
    isValid = false;
  }

  if (!confirmPasswordInput.value) {
    confirmPasswordError.textContent = 'Please confirm your password';
    confirmPasswordInput.classList.add('input-invalid');
    isValid = false;
  } else if (confirmPasswordInput.value !== passwordInput.value) {
    confirmPasswordError.textContent = 'Passwords do not match';
    confirmPasswordInput.classList.add('input-invalid');
    isValid = false;
  }

  if (!isValid) return;

  setLoading(true);

  try {
    // TODO: replace this with the real backend call
    // once we confirm the exact register endpoint (URL, field names, response shape)
    //
    // Expected example (will be adjusted after inspection):
    // const response = await fetch('/api/auth/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     name: nameInput.value.trim(),
    //     email: emailInput.value.trim(),
    //     password: passwordInput.value
    //   })
    // });
    // const data = await response.json();
    // if (!response.ok) throw new Error(data.message || 'Registration failed');
    // window.location.href = 'login.html';

    console.log('TODO: connect to real register endpoint');
    await new Promise(resolve => setTimeout(resolve, 800)); // temporary simulated delay only

  } catch (err) {
    formError.textContent = err.message || 'Something went wrong, please try again';
  } finally {
    setLoading(false);
  }
});
// Show/hide password toggle
document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', function () {
    const targetInput = document.getElementById(this.dataset.target);
    const isPassword = targetInput.type === 'password';
    targetInput.type = isPassword ? 'text' : 'password';
    this.textContent = isPassword ? '🙈' : '👁';
    this.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  });
});