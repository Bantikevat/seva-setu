/**
 * SEVA SETU — Premium Frontend
 * -------------------------------------------------
 * Apple-quality interactions + real backend
 */

// ─────────────────────────────────────────
//  CONFIG & STATE
// ─────────────────────────────────────────
const AUTH_API = 'http://localhost:3001';
const USER_API = 'http://localhost:3002';

const state = {
  phone: '',
  token: localStorage.getItem('seva_token') || null,
  user:  null,
  currentSlide: 0,
  selectedAddrType: 'Ghar',
  theme: localStorage.getItem('seva_theme') || 'light',
};

// Apply saved theme
document.documentElement.setAttribute('data-theme', state.theme);

// ─────────────────────────────────────────
//  THEME
// ─────────────────────────────────────────
function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('seva_theme', state.theme);
  showToast(state.theme === 'dark' ? '🌙 Dark mode on' : '☀️ Light mode on');
}

// ─────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.querySelector('.toast-msg').textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.className = 'toast', 2500);
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

async function apiCall(url, method = 'GET', body = null, useToken = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (useToken && state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (error) {
    console.error('API error:', error);
    return {
      ok: false,
      data: { message: 'Server se connect nahi ho saka. Services chal rahi hain?' }
    };
  }
}

function setButtonLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) {
    btn.classList.add('loading');
    btn.disabled = true;
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

// ─────────────────────────────────────────
//  ONBOARDING
// ─────────────────────────────────────────
function nextSlide() {
  state.currentSlide++;

  if (state.currentSlide > 2) {
    showScreen('screen-login');
    return;
  }

  // Update slides
  document.querySelectorAll('.onboard-slide').forEach((s, i) => {
    s.classList.toggle('active', i === state.currentSlide);
  });

  // Update dots
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === state.currentSlide);
  });

  // Update button text on last slide
  if (state.currentSlide === 2) {
    document.querySelector('#btn-next .btn-label, #btn-next span:first-child').textContent = "Let's Start";
  }
}

// ─────────────────────────────────────────
//  AUTHENTICATION
// ─────────────────────────────────────────
async function sendOtp() {
  const phoneInput = document.getElementById('phone');
  const errorDiv   = document.getElementById('phone-error');
  const phone = phoneInput.value.trim();

  errorDiv.textContent = '';

  if (!/^\d{10}$/.test(phone)) {
    errorDiv.textContent = '10 digit ka phone number daalo';
    phoneInput.focus();
    return;
  }

  if (!/^[6-9]/.test(phone)) {
    errorDiv.textContent = 'Indian number 6, 7, 8, 9 se shuru hota hai';
    return;
  }

  setButtonLoading('btn-send-otp', true);

  const result = await apiCall(`${AUTH_API}/auth/send-otp`, 'POST', { phone });

  setButtonLoading('btn-send-otp', false);

  if (result.ok) {
    state.phone = phone;
    document.getElementById('otp-phone-display').textContent = `+91 ${phone}`;
    showScreen('screen-otp');
    showToast('OTP bhej diya!', 'success');

    setTimeout(() => document.querySelector('.otp-cell').focus(), 300);
  } else {
    errorDiv.textContent = result.data.message;
    showToast(result.data.message, 'error');
  }
}

async function verifyOtp() {
  const inputs = document.querySelectorAll('.otp-cell');
  const errorDiv = document.getElementById('otp-error');
  const otp = Array.from(inputs).map((i) => i.value).join('');

  errorDiv.textContent = '';

  if (otp.length !== 6) {
    errorDiv.textContent = '6 digit ka OTP daalo';
    return;
  }

  setButtonLoading('btn-verify', true);

  const result = await apiCall(`${AUTH_API}/auth/verify-otp`, 'POST', {
    phone: state.phone,
    otp,
  });

  setButtonLoading('btn-verify', false);

  if (result.ok) {
    state.token = result.data.data.token;
    state.user  = result.data.data.user;
    localStorage.setItem('seva_token', state.token);
    localStorage.setItem('seva_user', JSON.stringify(state.user));

    showToast('Welcome! 🎉', 'success');
    setTimeout(() => loadHomeScreen(), 600);
  } else {
    errorDiv.textContent = result.data.message;
    showToast(result.data.message, 'error');

    inputs.forEach((i) => { i.value = ''; i.classList.remove('filled'); });
    inputs[0].focus();
  }
}

async function logout() {
  if (state.token) {
    await apiCall(`${AUTH_API}/auth/logout`, 'POST', null, true);
  }

  state.token = null;
  state.user  = null;
  localStorage.removeItem('seva_token');
  localStorage.removeItem('seva_user');

  showToast('Logout ho gaye', 'success');
  showScreen('screen-login');

  document.getElementById('phone').value = '';
  document.querySelectorAll('.otp-cell').forEach((i) => i.value = '');
}

// ─────────────────────────────────────────
//  HOME / PROFILE
// ─────────────────────────────────────────
async function loadHomeScreen() {
  showScreen('screen-home');
  await loadProfile();
}

async function loadProfile() {
  const result = await apiCall(`${USER_API}/users/me`, 'GET', null, true);

  if (result.ok) {
    const user = result.data.data;
    state.user = user;

    const nameDisplay = user.name || 'Set your name';
    document.getElementById('profile-name').textContent  = nameDisplay;
    document.getElementById('profile-phone').textContent = `+91 ${user.phone}`;

    const greetingEl = document.getElementById('greeting-name');
    greetingEl.textContent = user.name
      ? `Hello ${user.name.split(' ')[0]}! 👋`
      : 'Namaste! 👋';
  }

  await loadAddresses();
}

async function loadAddresses() {
  const list = document.getElementById('addresses-list');
  if (!list) return;

  const result = await apiCall(`${USER_API}/users/addresses`, 'GET', null, true);

  if (result.ok) {
    const addresses = result.data.data.addresses;

    if (addresses.length === 0) {
      list.innerHTML = `
        <div class="empty-state" style="padding: 24px;">
          <div class="empty-icon">📍</div>
          <p class="empty-title">No addresses yet</p>
          <p class="empty-desc">Add your first address</p>
        </div>
      `;
      return;
    }

    list.innerHTML = addresses.map((addr) => {
      const icon = addr.label === 'Office' ? '💼' : addr.label === 'Other' ? '📍' : '🏠';
      return `
        <div class="address-card ${addr.isDefault ? 'default' : ''}">
          <div class="address-icon">${icon}</div>
          <div class="address-info">
            <div class="address-row1">
              <span class="address-label">${addr.label}</span>
              ${addr.isDefault ? '<span class="default-badge">DEFAULT</span>' : ''}
            </div>
            <div class="address-text">${addr.fullAddress}</div>
          </div>
        </div>
      `;
    }).join('');
  } else {
    list.innerHTML = '<p style="text-align:center; color: var(--text-tertiary); padding: 20px;">Could not load addresses</p>';
  }
}

// ─────────────────────────────────────────
//  PROFILE EDIT
// ─────────────────────────────────────────
function showProfileEdit() {
  document.getElementById('edit-name').value  = state.user?.name  || '';
  document.getElementById('edit-email').value = state.user?.email || '';
  openModal('modal-profile');
}

async function saveProfile() {
  const name  = document.getElementById('edit-name').value.trim();
  const email = document.getElementById('edit-email').value.trim();

  if (name && name.length < 2) {
    showToast('Naam kam se kam 2 letter ka', 'error');
    return;
  }

  const result = await apiCall(`${USER_API}/users/me`, 'PUT', { name, email }, true);

  if (result.ok) {
    closeModal('modal-profile');
    showToast('Profile updated!', 'success');
    await loadProfile();
  } else {
    showToast(result.data.message, 'error');
  }
}

// ─────────────────────────────────────────
//  ADDRESS
// ─────────────────────────────────────────
function showAddressForm() {
  document.getElementById('addr-full').value = '';
  state.selectedAddrType = 'Ghar';
  document.querySelectorAll('.addr-type').forEach((b) => {
    b.classList.toggle('active', b.dataset.type === 'Ghar');
  });
  openModal('modal-address');
}

async function saveAddress() {
  const fullAddress = document.getElementById('addr-full').value.trim();

  if (fullAddress.length < 10) {
    showToast('Address kam se kam 10 letter ka', 'error');
    return;
  }

  const result = await apiCall(`${USER_API}/users/addresses`, 'POST', {
    label: state.selectedAddrType,
    fullAddress,
    latitude: 26.9124,
    longitude: 75.7873,
  }, true);

  if (result.ok) {
    closeModal('modal-address');
    showToast('Address added!', 'success');
    await loadAddresses();
  } else {
    showToast(result.data.message, 'error');
  }
}

// ─────────────────────────────────────────
//  ADDRESS TYPE BUTTONS
// ─────────────────────────────────────────
document.addEventListener('click', (e) => {
  if (e.target.closest('.addr-type')) {
    const btn = e.target.closest('.addr-type');
    document.querySelectorAll('.addr-type').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedAddrType = btn.dataset.type;
  }
});

// ─────────────────────────────────────────
//  OTP INPUT BEHAVIOR
// ─────────────────────────────────────────
document.querySelectorAll('.otp-cell').forEach((input, index) => {
  input.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');

    if (e.target.value) {
      e.target.classList.add('filled');
      const next = document.querySelector(`.otp-cell[data-index="${index + 1}"]`);
      if (next) next.focus();
    } else {
      e.target.classList.remove('filled');
    }

    const allFilled = Array.from(document.querySelectorAll('.otp-cell'))
      .every((i) => i.value.length === 1);
    if (allFilled) verifyOtp();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !e.target.value) {
      const prev = document.querySelector(`.otp-cell[data-index="${index - 1}"]`);
      if (prev) prev.focus();
    }
  });

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    document.querySelectorAll('.otp-cell').forEach((inp, i) => {
      inp.value = pasted[i] || '';
      if (inp.value) inp.classList.add('filled');
    });
    if (pasted.length === 6) verifyOtp();
  });
});

// ─────────────────────────────────────────
//  PHONE INPUT
// ─────────────────────────────────────────
document.getElementById('phone').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
});

document.getElementById('phone').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendOtp();
});

// ─────────────────────────────────────────
//  CATEGORY CARDS (Click handler)
// ─────────────────────────────────────────
document.querySelectorAll('.cat-card').forEach((card) => {
  card.addEventListener('click', () => {
    const name = card.querySelector('p').textContent;
    showToast(`${name} — Coming soon! 🚀`);
  });
});

// ─────────────────────────────────────────
//  STARTUP FLOW
// ─────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Seva Setu Premium UI');
  console.log('💡 Auth API:', AUTH_API);
  console.log('💡 User API:', USER_API);

  // Theme set
  document.documentElement.setAttribute('data-theme', state.theme);

  // Check if user already logged in
  if (state.token) {
    const result = await apiCall(`${USER_API}/users/me`, 'GET', null, true);
    if (result.ok) {
      state.user = result.data.data;
      await loadHomeScreen();
      // Refresh icons
      if (window.lucide) lucide.createIcons();
      return;
    } else {
      localStorage.removeItem('seva_token');
      localStorage.removeItem('seva_user');
      state.token = null;
    }
  }

  // Show splash for 2 seconds, then onboarding
  setTimeout(() => {
    showScreen('screen-onboard');
  }, 2200);

  // Refresh icons after a moment
  setTimeout(() => {
    if (window.lucide) lucide.createIcons();
  }, 100);
});

// Refresh icons whenever DOM changes
const iconRefresh = () => {
  setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 50);
};

// Refresh icons on screen change
const origShowScreen = showScreen;
window.showScreen = function(id) {
  origShowScreen(id);
  iconRefresh();
};
