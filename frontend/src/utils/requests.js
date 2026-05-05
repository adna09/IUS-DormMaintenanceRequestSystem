const STORAGE_KEY = "studentRequests";

function notifyRequestsChanged() {
  window.dispatchEvent(new CustomEvent("dorm-requests-changed"));
}

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/** Align API status values with staff/admin UI filters (Submitted / Assigned / Resolved). */
function mapApiStatusToUi(status) {
  const s = String(status ?? "");
  if (s === "Pending") return "Submitted";
  if (s === "InProgress") return "Assigned";
  if (s === "Cancelled") return "Resolved";
  return s;
}

function normalizePriority(p) {
  const s = String(p ?? "");
  if (s === "Critical") return "Urgent";
  return s;
}

/** Merge one API row into the local cache shape; preserves attachments from `existing`. */
function mapApiRowToLocal(row, existing) {
  const id = String(row.id ?? row.Id ?? "");
  const createdAt = row.createdAt ?? row.CreatedAt;
  const apiCat = row.categoryName ?? row.CategoryName ?? "";
  return {
    ...(existing && typeof existing === "object" ? existing : {}),
    id,
    title: row.title ?? row.Title ?? "",
    description: row.description ?? row.Description ?? "",
    location: row.location ?? row.Location ?? "",
    priority: normalizePriority(row.priority ?? row.Priority),
    status: mapApiStatusToUi(row.status ?? row.Status),
    type: "Maintenance",
    studentName: row.studentName ?? row.StudentName ?? existing?.studentName ?? "Student",
    studentRole: "student",
    studentEmail: row.studentEmail ?? row.StudentEmail ?? existing?.studentEmail,
    category: apiCat || existing?.category,
    categoryId: row.categoryId ?? row.CategoryId ?? existing?.categoryId,
    createdAt: createdAt ? new Date(createdAt).toISOString() : existing?.createdAt,
    updatedAt: row.updatedAt ?? row.UpdatedAt,
    source: "api",
  };
}

/**
 * Pull all maintenance requests from the API and merge into localStorage.
 * Keeps entries that exist only locally (offline mock). Keeps attachment blobs from local rows.
 * Call when staff/admin opens dashboards so the list matches SQL after refresh or new browser.
 */
function buildMergedListFromApiResponse(data, localSnap) {
  const localList = Array.isArray(localSnap) ? localSnap : listRequests();
  const byId = new Map(localList.map((r) => [String(r.id), { ...r }]));
  const apiIds = new Set();

  for (const row of data) {
    const id = String(row.id ?? row.Id ?? "");
    if (!id) continue;
    apiIds.add(id);
    const prev = byId.get(id);
    const merged = mapApiRowToLocal(row, prev);
    if (prev?.attachments?.length) merged.attachments = prev.attachments;
    byId.set(id, merged);
  }

  for (const r of localList) {
    const id = String(r.id);
    if (!apiIds.has(id)) byId.set(id, { ...r });
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function mergeAllRequestsFromApi() {
  const { apiGetAllRequests } = await import("./api.js");
  let data;
  try {
    data = await apiGetAllRequests();
  } catch {
    return null;
  }
  if (!data || !Array.isArray(data)) return null;

  const mergedList = buildMergedListFromApiResponse(data, listRequests());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedList));
  notifyRequestsChanged();
  return mergedList;
}

/**
 * Staff/admin UI: merged list from SQL (`MaintenanceRequests` / `MaintenanceRequest` entity via
 * GET /api/maintenance-requests), plus local-only rows and staff attachment blobs. Does not write localStorage.
 */
export async function fetchStaffRequestsMergedFromApi() {
  const { apiGetAllRequests } = await import("./api.js");
  let data;
  try {
    data = await apiGetAllRequests();
  } catch {
    return null;
  }
  if (!data || !Array.isArray(data)) return null;
  return buildMergedListFromApiResponse(data, listRequests());
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
  notifyRequestsChanged();
  return newRequest;
}

export function updateRequest(id, patch) {
  const sid = String(id);
  const items = listRequests();
  const next = items.map((r) => (String(r.id) === sid ? { ...r, ...patch } : r));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notifyRequestsChanged();
  return next.find((r) => r.id === id) ?? null;
}

export function clearAllRequests() {
  localStorage.removeItem(STORAGE_KEY);
  notifyRequestsChanged();
}

