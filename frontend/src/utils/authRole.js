/**
 * Resolves dashboard role after login/register.
 * Prefer JWT / API payload so the UI matches the database role; use email domain only as a fallback
 * (e.g. offline hints) so @staff.com never overrides a stored Student role or vice versa incorrectly.
 */

const ROLE_CLAIM_URIS = [
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role",
];

function parseJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function roleFromJwtPayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  for (const key of ROLE_CLAIM_URIS) {
    const v = payload[key];
    if (v != null && v !== "") return Array.isArray(v) ? v[0] : v;
  }
  if (payload.role != null && payload.role !== "") {
    return Array.isArray(payload.role) ? payload.role[0] : payload.role;
  }
  for (const [k, v] of Object.entries(payload)) {
    if (typeof k === "string" && k.includes("claims/role") && v != null && v !== "") {
      return Array.isArray(v) ? v[0] : v;
    }
  }
  return null;
}

function roleFromEmailDomain(email) {
  const em = String(email ?? "")
    .trim()
    .toLowerCase();
  if (em.endsWith("@staff.com")) return "MaintenanceStaff";
  if (em.endsWith("@student.com")) return "Student";
  return null;
}

/**
 * @param {object} res - Login/register JSON body (camelCase or PascalCase)
 * @param {string} [emailHint] - same address used to sign in/register
 */
export function resolveRoleForNavigation(res, emailHint) {
  const fromBody = res?.role ?? res?.Role;
  if (fromBody != null && String(fromBody).trim() !== "") return fromBody;

  const tok = res?.token ?? res?.Token;
  const fromJwt = roleFromJwtPayload(parseJwtPayload(tok));
  if (fromJwt != null && String(fromJwt).trim() !== "") return fromJwt;

  const fromDomain = roleFromEmailDomain(emailHint);
  if (fromDomain) return fromDomain;

  return "";
}
