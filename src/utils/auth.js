// Real client-side Authentication Engine with Web Crypto SHA-256 hashing

const ACCOUNTS_KEY = 'whiteroom_accounts';
const SESSION_KEY = 'whiteroom_session';

// Helper: Convert ArrayBuffer to Hex String
function buf2hex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

// Generate random salt
function generateSalt(length = 16) {
  const arr = new Uint8Array(length);
  window.crypto.getRandomValues(arr);
  return buf2hex(arr.buffer);
}

// SHA-256 Hash with salt
export async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(password + ':' + salt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return buf2hex(hashBuffer);
}

// Get all stored accounts
export function getStoredAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveStoredAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts', e);
  }
}

// Seed default demo account if none exist
export async function ensureDemoAccount() {
  const accounts = getStoredAccounts();
  if (accounts.length === 0) {
    const salt = generateSalt();
    const passwordHash = await hashPassword('whiteroom', salt);
    const demoUser = {
      id: 'usr_ayanokoji',
      username: 'ayanokoji',
      email: 'ayanokoji@whiteroom.edu',
      displayName: 'Ayanokoji Kiyotaka',
      studentId: 'WR-GEN4-401',
      classRank: 'Class 1-D / Rank S',
      generation: '4th Generation Demonic Curriculum',
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80'
    };
    saveStoredAccounts([demoUser]);
    return demoUser;
  }
  return accounts[0];
}

// Register a new user
export async function registerUser({
  username,
  email,
  password,
  displayName,
  studentId,
  classRank
}) {
  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 5) {
    return { success: false, error: 'Password must be at least 5 characters long.' };
  }

  const accounts = getStoredAccounts();
  const existing = accounts.find(
    a => a.username.toLowerCase() === cleanUsername || a.email.toLowerCase() === cleanEmail
  );
  if (existing) {
    return { success: false, error: 'An account with that username or email already exists.' };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const userId = `usr_${Date.now()}`;

  const newUser = {
    id: userId,
    username: cleanUsername,
    email: cleanEmail,
    displayName: displayName.trim() || cleanUsername,
    studentId: studentId.trim() || `WR-${Math.floor(100 + Math.random() * 900)}`,
    classRank: classRank || 'Class 1-D',
    generation: 'Focus Sanctuary Student',
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
    avatar: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=300&q=80'
  };

  accounts.push(newUser);
  saveStoredAccounts(accounts);

  // Set active session
  setSession(newUser);

  return { success: true, user: sanitizeUser(newUser) };
}

// Login with username or email
export async function loginUser(usernameOrEmail, password) {
  const term = usernameOrEmail.trim().toLowerCase();
  if (!term || !password) {
    return { success: false, error: 'Please provide both username/email and password.' };
  }

  await ensureDemoAccount();
  const accounts = getStoredAccounts();
  const user = accounts.find(
    a => a.username.toLowerCase() === term || a.email.toLowerCase() === term
  );

  if (!user) {
    return { success: false, error: 'No account found with this username or email.' };
  }

  const testHash = await hashPassword(password, user.salt);
  if (testHash !== user.passwordHash) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  saveStoredAccounts(accounts);

  // Set active session
  setSession(user);

  return { success: true, user: sanitizeUser(user) };
}

// Session management
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    const accounts = getStoredAccounts();
    const user = accounts.find(a => a.id === session.userId);
    return user ? sanitizeUser(user) : null;
  } catch (e) {
    return null;
  }
}

export function setSession(user) {
  try {
    const session = {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      token: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to set session', e);
  }
}

export function logoutUser() {
  try {
    localStorage.removeItem(SESSION_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

// Remove sensitive hash and salt from user object before giving to UI
function sanitizeUser(user) {
  const { passwordHash, salt, ...safe } = user;
  return safe;
}

// User-scoped data storage helpers
export function getUserStorageKey(userId, key) {
  if (!userId) return `whiteroom_${key}`;
  return `whiteroom_u_${userId}_${key}`;
}

export function loadUserData(userId, key, fallback) {
  try {
    const storageKey = getUserStorageKey(userId, key);
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function saveUserData(userId, key, value) {
  try {
    const storageKey = getUserStorageKey(userId, key);
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save user data for ${key}`, e);
  }
}

// Google Client ID configuration helper
const GOOGLE_CLIENT_ID_KEY = 'whiteroom_google_client_id';

export function getGoogleClientId() {
  return localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || '';
}

export function saveGoogleClientId(clientId) {
  if (clientId) {
    localStorage.setItem(GOOGLE_CLIENT_ID_KEY, clientId.trim());
  } else {
    localStorage.removeItem(GOOGLE_CLIENT_ID_KEY);
  }
}

// Parse Google JWT Token without external dependencies
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Register or Login via Google Account
export function registerOrLoginGoogleUser({
  googleId,
  email,
  name,
  picture
}) {
  const cleanEmail = email.trim().toLowerCase();
  const accounts = getStoredAccounts();

  let user = accounts.find(
    a => (a.googleId && a.googleId === googleId) || a.email.toLowerCase() === cleanEmail
  );

  if (user) {
    // Update existing user with Google details
    user.googleId = googleId || user.googleId;
    user.avatar = picture || user.avatar;
    user.lastLogin = new Date().toISOString();
    saveStoredAccounts(accounts);
  } else {
    // Create new Google-linked student account
    const username = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `student_${Date.now()}`;
    const id = `usr_google_${googleId || Date.now()}`;
    user = {
      id,
      googleId: googleId || `gid_${Date.now()}`,
      username,
      email: cleanEmail,
      displayName: name || 'Google Scholar',
      studentId: `WR-G-${Math.floor(100 + Math.random() * 900)}`,
      classRank: 'Class 1-A / Rank S',
      generation: 'Google Linked Student Curriculum',
      createdAt: new Date().toISOString(),
      avatar: picture || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80',
      isGoogleAuth: true
    };
    accounts.push(user);
    saveStoredAccounts(accounts);
  }

  setSession(user);
  return { success: true, user: sanitizeUser(user) };
}
