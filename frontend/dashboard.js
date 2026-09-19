// =============================================
// dashboard.js — Intern + Admin dashboards
// Data comes from the API, not localStorage
// =============================================
import { getSubmissions, updateSubmissionStatus } from './api.js';

const user  = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
const token = localStorage.getItem('token');

if (!user || !token) {
  window.location.href = 'login.html';
}

// ---------- helpers ----------

// Inside a module, functions are NOT global — so inline onclick="" can never
// see them. Everything below is wired up with addEventListener instead.
function badgeClass(status) {
  if (status === 'Approved') return 'badge-approved';
  if (status === 'Rejected') return 'badge-rejected';
  return 'badge-pending';
}

// Submissions contain user-typed text; escape it before it touches innerHTML.
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d) ? '—' : d.toLocaleDateString('en-IN');
}

function showError(container, message) {
  const noData = document.getElementById('noData');
  if (noData) {
    noData.textContent = `⚠️ ${message}`;
    noData.style.display = 'block';
  }
}

// ---------- INTERN DASHBOARD ----------
const submissionsTable = document.getElementById('submissionsTable');
const welcomeMsg       = document.getElementById('welcomeMsg');
const noData           = document.getElementById('noData');

if (submissionsTable) {
  if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${user.name}!`;

  (async () => {
    try {
      // The backend already filters by the logged-in user.
      const myTasks = await getSubmissions();

      document.getElementById('totalCount').textContent    = myTasks.length;
      document.getElementById('pendingCount').textContent  = myTasks.filter(t => t.status === 'Pending').length;
      document.getElementById('approvedCount').textContent = myTasks.filter(t => t.status === 'Approved').length;

      if (!myTasks.length) {
        noData.style.display = 'block';
        return;
      }
      noData.style.display = 'none';

      submissionsTable.innerHTML = myTasks.map((task, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${esc(task.title)}</strong></td>
          <td>${esc(task.category)}</td>
          <td>${formatDate(task.created_at)}</td>
          <td><span class="badge ${badgeClass(task.status)}">${esc(task.status)}</span></td>
        </tr>
      `).join('');
    } catch (err) {
      showError(submissionsTable, err.message);
    }
  })();
}

// ---------- ADMIN DASHBOARD ----------
const adminTable = document.getElementById('adminTable');

if (adminTable) {
  if (user.role !== 'admin') {
    window.location.href = 'dashboard.html';
  }

  (async () => {
    try {
      const allTasks = await getSubmissions();

      const uniqueInterns = new Set(allTasks.map(t => t.internEmail));
      document.getElementById('totalInterns').textContent     = uniqueInterns.size;
      document.getElementById('totalSubmissions').textContent = allTasks.length;
      document.getElementById('pendingReview').textContent    = allTasks.filter(t => t.status === 'Pending').length;

      if (!allTasks.length) {
        document.getElementById('noData').style.display = 'block';
        return;
      }
      document.getElementById('noData').style.display = 'none';

      adminTable.innerHTML = allTasks.map((task, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${esc(task.internName)}</td>
          <td><strong>${esc(task.title)}</strong></td>
          <td>${esc(task.category)}</td>
          <td>${formatDate(task.created_at)}</td>
          <td><span class="badge ${badgeClass(task.status)}">${esc(task.status)}</span></td>
          <td>
            <button class="btn-approve" data-id="${task.id}" data-status="Approved">Approve</button>
            <button class="btn-reject"  data-id="${task.id}" data-status="Rejected">Reject</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      showError(adminTable, err.message);
    }
  })();

  // One listener for every row, now and in future renders.
  adminTable.addEventListener('click', async (e) => {
    const button = e.target.closest('button[data-id]');
    if (!button) return;

    button.disabled = true;
    try {
      await updateSubmissionStatus(button.dataset.id, button.dataset.status);
      location.reload();
    } catch (err) {
      alert(`Could not update status: ${err.message}`);
      button.disabled = false;
    }
  });
}

// ---------- LOGOUT ----------
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
  });
}
