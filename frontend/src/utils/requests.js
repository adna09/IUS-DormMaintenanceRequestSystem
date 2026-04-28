const STORAGE_KEY = "studentRequests";

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function getCurrentUser() {
  return safeParse(localStorage.getItem("user"), null);
}

export function listRequests() {
  const items = safeParse(localStorage.getItem(STORAGE_KEY), []);
  return Array.isArray(items) ? items : [];
}

export function createRequest(payload) {
  const user = getCurrentUser();
  const newRequest = {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    status: "Submitted",
    studentName: user?.name ?? "Student",
    studentRole: user?.role ?? "student",
    type: payload?.type ?? "Maintenance",
    ...payload,
  };

  const next = [newRequest, ...listRequests()];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return newRequest;
}

export function updateRequest(id, patch) {
  const items = listRequests();
  const next = items.map((r) => (r.id === id ? { ...r, ...patch } : r));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next.find((r) => r.id === id) ?? null;
}

export function clearAllRequests() {
  localStorage.removeItem(STORAGE_KEY);
}

