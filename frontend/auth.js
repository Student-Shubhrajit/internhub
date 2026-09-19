// =============================================
// auth.js — Register & Login, backed by the API
// =============================================
import { loginUser, registerUser } from './api.js';

// ---- REGISTER ----
const registerForm = document.getElementById('registerForm');

if (registerForm) {
  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const msg    = document.getElementById('message');
    const button = registerForm.querySelector('button[type="submit"]');

    const payload = {
      name:     document.getElementById('name').value.trim(),
      email:    document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
      role:     document.getElementById('role').value
    };

    const adminCodeField = document.getElementById('adminCode');
    if (adminCodeField) payload.adminCode = adminCodeField.value.trim();

    button.disabled = true;
    msg.textContent = 'Creating account...';
    msg.className = 'message';

    try {
      const data = await registerUser(payload);

      localStorage.setItem('token', data.token);
      localStorage.setItem('loggedInUser', JSON.stringify(data.user));

      msg.textContent = '✅ Registered successfully! Redirecting...';
      msg.className = 'message success';

      setTimeout(() => {
        window.location.href = data.user.role === 'admin'
          ? 'admin-dashboard.html'
          : 'dashboard.html';
      }, 1200);
    } catch (err) {
      msg.textContent = `❌ ${err.message}`;
      msg.className = 'message error';
      button.disabled = false;
    }
  });
}

// ---- LOGIN ----
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const msg    = document.getElementById('message');
    const button = loginForm.querySelector('button[type="submit"]');

    const payload = {
      email:    document.getElementById('email').value.trim(),
      password: document.getElementById('password').value
    };

    button.disabled = true;
    msg.textContent = 'Signing in...';
    msg.className = 'message';

    try {
      const data = await loginUser(payload);

      // THIS is what was missing before: the token must be stored,
      // otherwise every later API call goes out unauthenticated.
      localStorage.setItem('token', data.token);
      localStorage.setItem('loggedInUser', JSON.stringify(data.user));

      msg.textContent = `✅ Welcome, ${data.user.name}! Redirecting...`;
      msg.className = 'message success';

      setTimeout(() => {
        window.location.href = data.user.role === 'admin'
          ? 'admin-dashboard.html'
          : 'dashboard.html';
      }, 1200);
    } catch (err) {
      msg.textContent = `❌ ${err.message}`;
      msg.className = 'message error';
      button.disabled = false;
    }
  });
}

// ---- LOGOUT ----
const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
  });
}
