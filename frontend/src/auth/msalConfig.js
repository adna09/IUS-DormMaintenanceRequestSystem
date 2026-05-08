import { LogLevel } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID ?? "";
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID ?? "";

export function getApiScopes() {
  const s = import.meta.env.VITE_AZURE_API_SCOPE;
  return s ? [s] : [];
}

export const msalConfig = {
  auth: {
    clientId,
    authority: tenantId
      ? `https://login.microsoftonline.com/${tenantId}`
      : "https://login.microsoftonline.com/common",
    redirectUri:
      import.meta.env.VITE_AZURE_REDIRECT_URI ||
      `${typeof window !== "undefined" ? window.location.origin : ""}/auth`,
    postLogoutRedirectUri:
      import.meta.env.VITE_AZURE_POST_LOGOUT_REDIRECT_URI ||
      `${typeof window !== "undefined" ? window.location.origin : ""}/login`,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
    },
  },
};
