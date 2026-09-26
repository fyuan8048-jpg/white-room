// Bulletproof Authentication Engine for White Room Sanctuary
// Supports Web Crypto SHA-256 with universal synchronous fallback,
// multi-user isolation, Smart Sign-In, and 1-click Google Account link.

const ACCOUNTS_KEY = 'whiteroom_accounts';
const SESSION_KEY = 'whiteroom_session';

// Universal cryptographic hash function (never fails or throws)
export async function hashPassword(password, salt = 'wr_sanctuary_salt') {
  if (!password) password = 'default_pass';
  
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle?.digest) {
      const enc = new TextEncoder();
      const data = enc.encode(`${password}:${salt}`);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // Fall back to robust JS hashing below
  }

  // Universal fallback hash (DJB2 + SDBM double hash)
  let h1 = 5381;
  let h2 = 52711;
  const str = `${password}__${salt}__whiteroom_masterpiece`;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    h1 = ((h1 << 5) + h1) ^ code;
    h2 = ((h2 << 5) + h2) ^ code;
  }
  return `hash_${Math.abs(h1).toString(16)}_${Math.abs(h2).toString(16)}`;
}

// Generate random salt safely
function generateSalt(length = 16) {
  try {
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      const arr = new Uint8Array(length);
      window.crypto.getRandomValues(arr);
      return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {}
  return `salt_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

// Read all accounts from storage
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
    console.error('Failed to save accounts to localStorage', e);
  }
}

// Seed pre-loaded demo student (Ayanokoji Kiyotaka)
export async function ensureDemoAccount() {
  const accounts = getStoredAccounts();
  const existing = accounts.find(a => a.username === 'ayanokoji');
  if (!existing) {
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
    accounts.push(demoUser);
    saveStoredAccounts(accounts);
    return demoUser;
  }
  return existing;
}

// Register a new student account
export async function registerUser({
  username,
  email,
  password,
  displayName,
  studentId,
  classRank
}) {
  const cleanUsername = (username || '').trim().toLowerCase();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanUsername || cleanUsername.length < 2) {
    return { success: false, error: 'Username must be at least 2 characters.' };
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters.' };
  }

  await ensureDemoAccount();
  const accounts = getStoredAccounts();

  // Check if username or email already registered
  const existing = accounts.find(
    a => a.username.toLowerCase() === cleanUsername || (cleanEmail && a.email.toLowerCase() === cleanEmail)
  );

  if (existing) {
    return { success: false, error: 'An account with this username or email already exists. Try signing in!' };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(cleanPassword, salt);
  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newUser = {
    id: userId,
    username: cleanUsername,
    email: cleanEmail || `${cleanUsername}@whiteroom.local`,
    displayName: (displayName || '').trim() || cleanUsername,
    studentId: (studentId || '').trim() || `WR-${Math.floor(100 + Math.random() * 900)}`,
    classRank: classRank || 'Class 1-D / Rank A',
    generation: 'Focus Sanctuary Student',
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
    avatar: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=300&q=80'
  };

  accounts.push(newUser);
  saveStoredAccounts(accounts);

  setSession(newUser);
  return { success: true, user: sanitizeUser(newUser) };
}

// Log in with username or email
export async function loginUser(usernameOrEmail, password) {
  const term = (usernameOrEmail || '').trim().toLowerCase();
  const pass = (password || '').trim();

  if (!term || !pass) {
    return { success: false, error: 'Please enter both username/email and password.' };
  }

  await ensureDemoAccount();
  const accounts = getStoredAccounts();

  const user = accounts.find(
    a => a.username.toLowerCase() === term || (a.email && a.email.toLowerCase() === term)
  );

  if (!user) {
    return { 
      success: false, 
      notFound: true,
      error: `No account found for "${term}". Click Register to create it!` 
    };
  }

  const testHash = await hashPassword(pass, user.salt);
  if (testHash !== user.passwordHash) {
    return { success: false, error: 'Incorrect password for this student dossier.' };
  }

  user.lastLogin = new Date().toISOString();
  saveStoredAccounts(accounts);

  setSession(user);
  return { success: true, user: sanitizeUser(user) };
}

// Quick / Smart Authentication: Log in if exists, or auto-create if new
export async function smartAuth(usernameOrEmail, password) {
  const term = (usernameOrEmail || '').trim().toLowerCase();
  const pass = (password || '').trim();

  if (!term || !pass) {
    return { success: false, error: 'Please enter both username/email and password.' };
  }

  await ensureDemoAccount();
  const accounts = getStoredAccounts();

  const user = accounts.find(
    a => a.username.toLowerCase() === term || (a.email && a.email.toLowerCase() === term)
  );

  if (user) {
    // Attempt normal login
    const testHash = await hashPassword(pass, user.salt);
    if (testHash !== user.passwordHash) {
      return { success: false, error: 'Incorrect password for this account.' };
    }
    setSession(user);
    return { success: true, user: sanitizeUser(user), isNew: false };
  } else {
    // Auto-create account on the spot
    const isEmail = term.includes('@');
    return registerUser({
      username: isEmail ? term.split('@')[0] : term,
      email: isEmail ? term : `${term}@whiteroom.local`,
      password: pass,
      displayName: isEmail ? term.split('@')[0] : term
    });
  }
}

// Register or Login via Google Account
export function registerOrLoginGoogleUser({
  googleId,
  email,
  name,
  picture
}) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const accounts = getStoredAccounts();

  let user = accounts.find(
    a => (a.googleId && a.googleId === googleId) || (cleanEmail && a.email.toLowerCase() === cleanEmail)
  );

  if (user) {
    user.googleId = googleId || user.googleId || `gid_${Date.now()}`;
    user.avatar = picture || user.avatar;
    user.lastLogin = new Date().toISOString();
    saveStoredAccounts(accounts);
  } else {
    const rawName = name || cleanEmail.split('@')[0] || 'Google Scholar';
    const username = cleanEmail ? cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : `student_${Date.now()}`;
    const id = `usr_google_${googleId || Date.now()}`;

    user = {
      id,
      googleId: googleId || `gid_${Date.now()}`,
      username,
      email: cleanEmail || `${username}@gmail.com`,
      displayName: rawName,
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

// Session Management
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
      token: `tok_${Date.now()}`,
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
    return raw !== null ? JSON.parse(raw) : fallback;
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

// Google OAuth Helpers
const GOOGLE_CLIENT_ID_KEY = 'whiteroom_google_client_id';

export function getGoogleClientId() {
  try {
    return localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || '';
  } catch (e) {
    return '';
  }
}

export function saveGoogleClientId(clientId) {
  try {
    if (clientId) {
      localStorage.setItem(GOOGLE_CLIENT_ID_KEY, clientId.trim());
    } else {
      localStorage.removeItem(GOOGLE_CLIENT_ID_KEY);
    }
  } catch (e) {}
}

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
