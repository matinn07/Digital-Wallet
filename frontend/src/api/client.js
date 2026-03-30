// Set this to your Render backend URL after deployment
const API_URL = import.meta.env.VITE_API_URL || "https://digital-wallet-u596.onrender.com" || 'http://localhost:4000';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error || data?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.details = data?.details;
    throw err;
  }

  return data;
}

export { apiFetch };

