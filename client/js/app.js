// DOM Elements
const usernameInput = document.getElementById('usernameInput');
const domainName = document.getElementById('domainName');
const setBtn = document.getElementById('setBtn');
const copyBtn = document.getElementById('copyBtn');
const refreshBtn = document.getElementById('refreshBtn');
const countdown = document.getElementById('countdown');
const emailList = document.getElementById('emailList');
const emailCount = document.getElementById('emailCount');
const emailView = document.getElementById('emailView');
const backBtn = document.getElementById('backBtn');
const deleteBtn = document.getElementById('deleteBtn');
const viewSubject = document.getElementById('viewSubject');
const viewFrom = document.getElementById('viewFrom');
const viewDate = document.getElementById('viewDate');
const viewBody = document.getElementById('viewBody');

// State
let currentUsername = '';
let currentEmailId = null;
let countdownTime = 3600;
let countdownInterval = null;
let domain = 'ghostmail.local';

// Socket.io
const socket = io();

// Get domain from server
async function fetchDomain() {
  try {
    const res = await fetch('/api/domain');
    const data = await res.json();
    domain = data.domain;
    domainName.textContent = domain;
  } catch (e) {
    // Use default
  }
}

// Initialize
async function init() {
  await fetchDomain();

  // Check localStorage for existing email
  const saved = localStorage.getItem('ghostmail');
  if (saved) {
    const { username, expiry } = JSON.parse(saved);
    if (expiry > Date.now()) {
      setUsername(username, false);
      countdownTime = Math.floor((expiry - Date.now()) / 1000);
      startCountdown();
      return;
    }
  }
  // Generate random if no saved or expired
  await generateRandomEmail();
  startCountdown();
}

// Set username (custom or random)
function setUsername(username, resetTimer = true) {
  // Leave old room
  if (currentUsername) {
    socket.emit('leave', currentUsername);
  }

  // Sanitize username
  username = username.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!username) {
    showToast('Invalid username');
    return false;
  }

  currentUsername = username;
  usernameInput.value = username;

  // Save to localStorage
  const expiry = resetTimer ? Date.now() + (3600 * 1000) : JSON.parse(localStorage.getItem('ghostmail'))?.expiry || Date.now() + (3600 * 1000);
  localStorage.setItem('ghostmail', JSON.stringify({
    username: currentUsername,
    expiry
  }));

  // Join new room
  socket.emit('join', currentUsername);

  // Reset countdown if new
  if (resetTimer) {
    countdownTime = 3600;
  }

  // Fetch inbox
  fetchInbox();
  return true;
}

// Generate random email
async function generateRandomEmail() {
  try {
    const res = await fetch('/api/generate', { method: 'POST' });
    const data = await res.json();
    setUsername(data.username);
  } catch (error) {
    console.error('Error generating email:', error);
    // Fallback to client-side random
    const random = Math.random().toString(36).substring(2, 10);
    setUsername(random);
  }
}

// Set custom email from input
function setCustomEmail() {
  const username = usernameInput.value.trim();
  if (username) {
    if (setUsername(username)) {
      showToast(`Email set: ${username}@${domain}`);
    }
  } else {
    showToast('Enter a username');
  }
}

// Fetch inbox
async function fetchInbox() {
  try {
    const res = await fetch(`/api/inbox/${currentUsername}`);
    const emails = await res.json();
    renderEmailList(emails);
  } catch (error) {
    console.error('Error fetching inbox:', error);
  }
}

// Render email list
function renderEmailList(emails) {
  emailCount.textContent = `${emails.length} email${emails.length !== 1 ? 's' : ''}`;

  if (emails.length === 0) {
    emailList.innerHTML = '<p class="empty-state">Waiting for emails...</p>';
    return;
  }

  emailList.innerHTML = emails.map(email => `
    <div class="email-item ${email.read ? '' : 'unread'}" data-id="${email._id}">
      <span class="from">${escapeHtml(email.from)}</span>
      <span class="subject">${escapeHtml(email.subject)}</span>
      <span class="time">${formatTime(email.createdAt)}</span>
    </div>
  `).join('');

  document.querySelectorAll('.email-item').forEach(item => {
    item.addEventListener('click', () => openEmail(item.dataset.id));
  });
}

// Open email
async function openEmail(id) {
  try {
    const res = await fetch(`/api/email/${id}`);
    const email = await res.json();

    currentEmailId = id;
    viewSubject.textContent = email.subject;
    viewFrom.textContent = email.from;
    viewDate.textContent = formatTime(email.createdAt);
    viewBody.innerHTML = email.html || `<pre>${escapeHtml(email.text)}</pre>`;

    emailView.classList.remove('hidden');

    const item = document.querySelector(`[data-id="${id}"]`);
    if (item) item.classList.remove('unread');
  } catch (error) {
    console.error('Error opening email:', error);
  }
}

// Delete email
async function deleteEmail() {
  if (!currentEmailId) return;

  try {
    await fetch(`/api/email/${currentEmailId}`, { method: 'DELETE' });
    closeEmailView();
    await fetchInbox();
    showToast('Email deleted');
  } catch (error) {
    console.error('Error deleting email:', error);
  }
}

// Close email view
function closeEmailView() {
  emailView.classList.add('hidden');
  currentEmailId = null;
}

// Copy email to clipboard
async function copyEmail() {
  const fullEmail = `${currentUsername}@${domain}`;
  try {
    await navigator.clipboard.writeText(fullEmail);
    showToast('Copied!');
  } catch (error) {
    // Fallback
    const temp = document.createElement('input');
    temp.value = fullEmail;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    showToast('Copied!');
  }
}

// Show toast
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// Start countdown
function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    countdownTime--;

    if (countdownTime <= 0) {
      generateRandomEmail();
      return;
    }

    const minutes = Math.floor(countdownTime / 60);
    const seconds = countdownTime % 60;
    countdown.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

// Format time
function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago (${time})`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;

  return time;
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Socket events
socket.on('newEmail', () => {
  showToast('New email received!');
  fetchInbox();
});

socket.on('connect', () => {
  if (currentUsername) {
    socket.emit('join', currentUsername);
    fetchInbox();
  }
});

// Event listeners
setBtn.addEventListener('click', setCustomEmail);
copyBtn.addEventListener('click', copyEmail);
refreshBtn.addEventListener('click', generateRandomEmail);
backBtn.addEventListener('click', closeEmailView);
deleteBtn.addEventListener('click', deleteEmail);

// Enter key to set email
usernameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    setCustomEmail();
  }
});

// Initialize
init();
