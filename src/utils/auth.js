// Authentication Engine with Google OAuth 2.0 Integration for I HATE PDF

const AUTH_KEY = 'ihatepdf_user_session';

export function getCurrentUser() {
  try {
    const saved = localStorage.getItem(AUTH_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

// Decode Google JWT Token from Google Identity Services
export function parseGoogleJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Login from real Google OAuth credential JWT
export function loginWithGoogleCredential(credential) {
  const payload = parseGoogleJwt(credential);
  if (!payload) throw new Error('Invalid Google credential token');

  const user = {
    id: 'g_' + (payload.sub || Date.now()),
    name: payload.name || payload.given_name || payload.email.split('@')[0],
    email: payload.email,
    avatar: payload.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${payload.email}`,
    provider: 'google',
    createdAt: new Date().toISOString()
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

// Direct Google User login
export function loginWithCustomGoogle({ name, email, avatar } = {}) {
  const user = {
    id: 'g_' + Date.now(),
    name: name || (email ? email.split('@')[0] : 'Google User'),
    email: email || 'user@gmail.com',
    avatar: avatar || `https://lh3.googleusercontent.com/a/default-user=s96-c`,
    provider: 'google',
    createdAt: new Date().toISOString()
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

export function loginUser({ email, password }) {
  const user = {
    id: 'usr_' + Date.now(),
    name: email.split('@')[0],
    email: email,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
    provider: 'email',
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

export function signupUser({ name, email, password }) {
  const user = {
    id: 'usr_' + Date.now(),
    name: name || email.split('@')[0],
    email: email,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
    provider: 'email',
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

export function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
}
