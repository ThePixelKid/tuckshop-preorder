// Account Management - Registration & Authentication
import { db } from './firebase.js';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ============================================
// DOM ELEMENTS
// ============================================

const authForm = document.getElementById('authForm');
const regEmail = document.getElementById('regEmail');
const regPassword = document.getElementById('regPassword');
const regName = document.getElementById('regName');
const regFormSelect = document.getElementById('regFormSelect');
const authBtn = document.getElementById('authBtn');
const authTitle = document.getElementById('authTitle');
const toggleText = document.getElementById('toggleText');
const toggleLink = document.getElementById('toggleLink');
const authMessage = document.getElementById('authMessage');

// ============================================
// STATE
// ============================================

let isLoginMode = false;

// ============================================
// PASSWORD HASHING (for simplicity, use SHA-256)
// ============================================

async function sha256(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// ACCOUNT FUNCTIONS
// ============================================

async function registerAccount() {
  const email = regEmail.value.trim();
  const password = regPassword.value.trim();
  const name = regName.value.trim();
  const form = regFormSelect.value;

  // Validation
  if (!email || !password || !name || !form) {
    showMessage('Please fill all fields', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('Password must be at least 6 characters', 'error');
    return;
  }

  if (!email.includes('@')) {
    showMessage('Please enter a valid email', 'error');
    return;
  }

  try {
    authBtn.disabled = true;
    authBtn.textContent = 'Creating account...';

    // Check if email already exists
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      showMessage('Email already registered', 'error');
      authBtn.disabled = false;
      authBtn.textContent = 'Create Account';
      return;
    }

    // Hash password
    const passwordHash = await sha256(email + password);

    // Create user document
    const userId = `${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    await setDoc(doc(db, 'users', userId), {
      email: email,
      passwordHash: passwordHash,
      name: name,
      form: form,
      createdAt: new Date(),
      accountBalance: 0,
      isActive: true
    });

    showMessage('Account created successfully! Redirecting to login...', 'success');
    
    setTimeout(() => {
      regEmail.value = email;
      regPassword.value = password;
      regName.value = '';
      regFormSelect.value = '';
      toggleMode();
      authBtn.textContent = 'Create Account';
      authBtn.disabled = false;
    }, 1500);

  } catch (error) {
    console.error('Registration error:', error);
    showMessage('Error creating account: ' + error.message, 'error');
    authBtn.disabled = false;
    authBtn.textContent = 'Create Account';
  }
}

async function loginAccount() {
  const email = regEmail.value.trim();
  const password = regPassword.value.trim();

  if (!email || !password) {
    showMessage('Please enter email and password', 'error');
    return;
  }

  try {
    authBtn.disabled = true;
    authBtn.textContent = 'Logging in...';

    // Find user
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      showMessage('Email not found', 'error');
      authBtn.disabled = false;
      authBtn.textContent = 'Login';
      return;
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // Hash password and compare
    const passwordHash = await sha256(email + password);

    if (passwordHash !== userData.passwordHash) {
      showMessage('Incorrect password', 'error');
      authBtn.disabled = false;
      authBtn.textContent = 'Login';
      return;
    }

    // Store session
    sessionStorage.setItem('tuckshopUserId', userId);
    sessionStorage.setItem('tuckshopUserEmail', email);
    sessionStorage.setItem('tuckshopUserName', userData.name);
    sessionStorage.setItem('tuckshopUserForm', userData.form);

    showMessage('Login successful! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);

  } catch (error) {
    console.error('Login error:', error);
    showMessage('Error logging in: ' + error.message, 'error');
    authBtn.disabled = false;
    authBtn.textContent = 'Login';
  }
}

function toggleMode() {
  isLoginMode = !isLoginMode;

  if (isLoginMode) {
    authTitle.textContent = 'Login';
    authBtn.textContent = 'Login';
    regName.style.display = 'none';
    regFormSelect.style.display = 'none';
    regPassword.placeholder = 'Password';
    toggleText.innerHTML = 'Don\'t have an account? <a href="#" id="toggleLink">Register</a>';
  } else {
    authTitle.textContent = 'Create Account';
    authBtn.textContent = 'Create Account';
    regName.style.display = 'block';
    regFormSelect.style.display = 'block';
    regPassword.placeholder = 'Password (min 6 characters)';
    toggleText.innerHTML = 'Already have an account? <a href="#" id="toggleLink">Login</a>';
  }

  authMessage.innerHTML = '';
  authForm.reset();
  
  // Reattach toggle link listener
  document.getElementById('toggleLink').addEventListener('click', (e) => {
    e.preventDefault();
    toggleMode();
  });
}

function showMessage(msg, type) {
  authMessage.textContent = msg;
  authMessage.style.color = type === 'error' ? '#e53e3e' : '#22c55e';
  authMessage.style.padding = '12px';
  authMessage.style.borderRadius = '8px';
  authMessage.style.backgroundColor = type === 'error' ? '#fff5f5' : '#f0fdf4';
}

// ============================================
// EVENT LISTENERS
// ============================================

authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (isLoginMode) {
    loginAccount();
  } else {
    registerAccount();
  }
});

toggleLink.addEventListener('click', (e) => {
  e.preventDefault();
  toggleMode();
});

// Check if already logged in
if (sessionStorage.getItem('tuckshopUserId')) {
  window.location.href = 'index.html';
}
