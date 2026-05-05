/**
 * Centralized API client for the Dorm Maintenance backend.
 * Uses a local JWT (email/password) or a Microsoft Entra access token when authProvider is "azure".
 */

const API_BASE = "/api";

/** Public POST (login/register) — never sends a stored Bearer token so stale JWTs cannot break auth. */
async function requestPublic(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 502 || res.status === 504) {
      console.warn(`[api] Backend unreachable (proxy returned ${res.status}), triggering fallback.`);
      return null;
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `API error ${res.status}`);
    }

    if (res.status === 204) return null;

    return await res.json();
  } catch (err) {
    if (err instanceof TypeError && err.message.includes("fetch")) {
      console.warn("[api] Backend definitely unreachable, returning null:", err.message);
      return null;
    }
    throw err;
  }
}

async function authHeaders() {
  const provider = localStorage.getItem("authProvider");
  if (provider === "azure") {
    const { getAzureAccessToken } = await import("../auth/azureAuth.js");
    const t = await getAzureAccessToken();
    if (t) return { Authorization: `Bearer ${t}` };
  }
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeaders()),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("authProvider");
      window.location.href = "/login";
      return null;
    }

    if (res.status === 502 || res.status === 504) {
      console.warn(`[api] Backend unreachable (proxy returned ${res.status}), triggering fallback.`);
      return null;
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `API error ${res.status}`);
    }

    if (res.status === 204) return null;

    return await res.json();
  } catch (err) {
    if (err instanceof TypeError && err.message.includes("fetch")) {
      console.warn("[api] Backend definitely unreachable, returning null:", err.message);
      return null;
    }
    throw err;
  }
}

export async function apiLogin(email, password) {
  return requestPublic("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(dto) {
  return requestPublic("/auth/register", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function apiGetMe() {
  return request("/auth/me", { method: "GET" });
}

export async function apiGetCategories() {
  return request("/categories");
}

export async function apiCreateRequest(dto) {
  return request("/maintenance-requests", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function apiGetMyRequests() {
  return request("/maintenance-requests/my");
}

/** Staff and admin — full list from SQL for syncing the browser cache. */
export async function apiGetAllRequests() {
  return request("/maintenance-requests");
}
