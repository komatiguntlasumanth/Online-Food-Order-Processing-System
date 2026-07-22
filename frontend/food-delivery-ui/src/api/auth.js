// Authentication utility — manages JWT tokens and authenticated API calls

// In production (Netlify), VITE_API_BASE_URL is the public ngrok URL, e.g. https://abc123.ngrok-free.app
// In local dev, it falls back to '/api' which Vite proxies to localhost:8080
const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';


// ──────────────── Token Management ────────────────
export function getToken() {
  return localStorage.getItem('swiggy_jwt_token');
}

export function setToken(token) {
  localStorage.setItem('swiggy_jwt_token', token);
}

export function removeToken() {
  localStorage.removeItem('swiggy_jwt_token');
  localStorage.removeItem('swiggy_user');
  localStorage.removeItem('swiggy_app_mode');
}

export function getUser() {
  const raw = localStorage.getItem('swiggy_user');
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user) {
  localStorage.setItem('swiggy_user', JSON.stringify(user));
}

export function isAuthenticated() {
  return !!getToken();
}

// ──────────────── Authenticated Fetch ────────────────
export async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

// ──────────────── OTP Authentication API ────────────────

/**
 * Sends a real OTP via Fast2SMS (Indian SMS gateway) by calling the backend.
 * The backend generates the OTP, stores it, and dispatches the SMS.
 */
export async function sendOtp(mobile, role) {
  const res = await fetch(`${API_BASE}/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, role }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Failed to send OTP. Please try again.');
  }

  // Dispatch custom event with the backend-generated OTP for visual simulation/fallback
  if (data.devOtp) {
    const event = new CustomEvent('swiggy-otp-sent', { 
      detail: { mobile, otp: data.devOtp, role } 
    });
    window.dispatchEvent(event);
  }

  console.log(`[OTP] OTP sent to +91${mobile}`);
  return true;
}

/**
 * Verifies the OTP with the backend, then logs in / registers the user.
 */
export async function verifyOtp(mobile, otp, role, fullName = '') {

  // Step 1: Verify OTP with the backend (Fast2SMS flow)
  const otpVerifyRes = await fetch(`${API_BASE}/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp }),
  });
  const otpData = await otpVerifyRes.json();
  if (!otpVerifyRes.ok || !otpData.success) {
    throw new Error(otpData.message || 'Invalid or expired OTP. Please try again.');
  }

  // Step 2: OTP verified — now login or register with the backend
  const dummyPassword = 'otp-secure-password-123';
  const displayFullName = fullName.trim() || `${role === 'DELIVERY' ? 'Partner' : 'Customer'} ${mobile.slice(-4)}`;
  const email = `${mobile}@swiggy-express.com`;

  try {
    // 1. Try to login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: mobile, password: dummyPassword }),
    });

    if (loginRes.ok) {
      const data = await loginRes.json();
      setToken(data.token);
      const user = { username: data.username, fullName: data.fullName || displayFullName, email: data.email, mobile, role };
      setUser(user);
      localStorage.setItem('swiggy_app_mode', role === 'DELIVERY' ? 'delivery-partner' : 'customer');
      return user;
    } else {
      // 2. If login failed (e.g. user doesn't exist), try to register
      const registerRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: mobile, email, password: dummyPassword, fullName: displayFullName }),
      });

      if (registerRes.ok) {
        const data = await registerRes.json();
        setToken(data.token);
        const user = { username: data.username, fullName: data.fullName || displayFullName, email: data.email, mobile, role };
        setUser(user);
        localStorage.setItem('swiggy_app_mode', role === 'DELIVERY' ? 'delivery-partner' : 'customer');
        return user;
      } else {
        const errData = await registerRes.json();
        throw new Error(errData.error || 'Sync with backend failed.');
      }
    }
  } catch (backendError) {
    console.warn('[Sync Warning] Backend offline or database sync failed. Falling back to local storage auth:', backendError.message);
    
    // Fallback: local login if backend is down or throws error
    const mockToken = `mock-jwt-token-for-${mobile}-${role}-${Date.now()}`;
    setToken(mockToken);
    
    const user = { username: mobile, fullName: displayFullName, email, mobile, role };
    setUser(user);
    localStorage.setItem('swiggy_app_mode', role === 'DELIVERY' ? 'delivery-partner' : 'customer');
    return user;
  }
}

// ──────────────── Auth API Calls (Legacy / Fallback) ────────────────
export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  setToken(data.token);
  setUser({ username: data.username, fullName: data.fullName, email: data.email });
  return data;
}

export async function registerUser({ username, email, password, fullName }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, fullName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  setToken(data.token);
  setUser({ username: data.username, fullName: data.fullName, email: data.email });
  return data;
}

export function logout() {
  removeToken();
  window.location.reload();
}
