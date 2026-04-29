/**
 * Centralized API client for the Dorm Maintenance backend.
 *
 * - Attaches the JWT token from localStorage to every request.
 * - Falls back to null (so pages can use localStorage data) when the
 *   backend is unreachable.
 */

const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    // If unauthorized, redirect to login
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return null;
    }
    
    // Vite proxy returns 502/504 when backend is down
    if (res.status === 502 || res.status === 504) {
      console.warn(`[api] Backend unreachable (proxy returned ${res.status}), triggering fallback.`);
      return null;
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `API error ${res.status}`);
    }

    // 204 No Content
    if (res.status === 204) return null;

    return await res.json();
  } catch (err) {
    // Network failure without proxy
    if (err instanceof TypeError && err.message.includes("fetch")) {
      console.warn("[api] Backend definitely unreachable, returning null:", err.message);
      return null;
    }
    throw err;
  }
}

// ── Auth ──────────────────────────────────────────────

export async function apiLogin(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(dto) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

// ── Categories ────────────────────────────────────────

export async function apiGetCategories() {
  return request("/categories");
}

// ── Maintenance requests ──────────────────────────────

export async function apiCreateRequest(dto) {
  return request("/maintenance-requests", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function apiGetMyRequests() {
  return request("/maintenance-requests/my");
}
