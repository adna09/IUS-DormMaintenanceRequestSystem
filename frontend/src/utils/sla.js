function toMs(hours) {
  return hours * 60 * 60 * 1000;
}

export function getSlaHoursForRequest(req) {
  const type = req?.type ?? "Maintenance";
  if (type !== "Maintenance") return 7 * 24; // room selection: 7 days

  const category = String(req?.category ?? "").toLowerCase();
  const title = String(req?.title ?? "").toLowerCase();
  const desc = String(req?.description ?? "").toLowerCase();
  const hay = `${category} ${title} ${desc}`;

  // Fastest: cleaning
  if (hay.includes("clean")) return 24;

  // Facility issues (water/electricity/heating) generally urgent
  if (hay.includes("water") || hay.includes("electric") || hay.includes("power")) return 24;

  // Heating issues: allow longer
  if (hay.includes("heater") || hay.includes("heating")) return 72;

  // Furniture / broken item
  if (hay.includes("furniture") || hay.includes("broken")) return 72;

  // Roommates/noise is more of a report/mediation
  if (hay.includes("roommate") || hay.includes("noise")) return 96;

  // Default maintenance target
  return 72;
}

export function getDueAt(req) {
  const created = req?.createdAt ? new Date(req.createdAt).getTime() : NaN;
  if (!Number.isFinite(created)) return null;
  return new Date(created + toMs(getSlaHoursForRequest(req)));
}

export function isOverdue(req, now = new Date()) {
  if ((req?.status ?? "") === "Resolved") return false;
  const due = getDueAt(req);
  if (!due) return false;
  return due.getTime() < now.getTime();
}

export function isNew(req, hours = 6, now = new Date()) {
  const created = req?.createdAt ? new Date(req.createdAt).getTime() : NaN;
  if (!Number.isFinite(created)) return false;
  return now.getTime() - created < toMs(hours);
}

