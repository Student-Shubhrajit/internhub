// =============================================
// tasks.js — Task submission, sent to the backend
// =============================================
import { submitTask } from './api.js';

const taskForm = document.getElementById('taskForm');

if (taskForm) {
  taskForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const msg    = document.getElementById('message');
    const button = taskForm.querySelector('button[type="submit"]');

    // A token, not a user object, is what the API needs
    if (!localStorage.getItem('token')) {
      window.location.href = 'login.html';
      return;
    }

    const payload = {
      title:       document.getElementById('taskTitle').value.trim(),
      category:    document.getElementById('taskCategory').value,
      description: document.getElementById('taskDescription').value.trim(),
      link:        document.getElementById('taskLink').value.trim()
    };

    if (!payload.title) {
      msg.textContent = '❌ Please enter a task title.';
      msg.className = 'message error';
      return;
    }

    button.disabled = true;
    msg.textContent = 'Submitting...';
    msg.className = 'message';

    try {
      await submitTask(payload);

      msg.textContent = '✅ Task submitted successfully!';
      msg.className = 'message success';
      taskForm.reset();

      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
    } catch (err) {
      msg.textContent = `❌ ${err.message}`;
      msg.className = 'message error';
      button.disabled = false;
    }
  });
}
