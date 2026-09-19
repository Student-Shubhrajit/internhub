// =============================================
// api.js — single place that talks to the backend
// =============================================

// Relative path: works on localhost:3000 and on any host you deploy to.
const BASE_URL = "http://localhost:3000/api";

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;   // Bearer prefix matters
  return headers;
};

// Wraps fetch so a 400/401/500 becomes a thrown Error instead of silent junk.
async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { headers: getHeaders(), ...options });
  } catch (networkErr) {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
  }
  if (!res.ok) {
    throw new Error((data && data.message) || `Request failed (${res.status})`);
  }
  return data;
}

// ---------- AUTH ----------
export const registerUser = (userData) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(userData) });

export const loginUser = (userData) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify(userData) });

// ---------- TASKS ----------
export const createTask = (taskData) =>
  request('/tasks', { method: 'POST', body: JSON.stringify(taskData) });

export const getTasks = () => request('/tasks');

// ---------- SUBMISSIONS ----------
export const submitTask = (data) =>
  request('/submissions', { method: 'POST', body: JSON.stringify(data) });

export const getSubmissions = () => request('/submissions');

export const updateSubmissionStatus = (id, status) =>
  request(`/submissions/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
