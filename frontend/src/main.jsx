import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import "./index.css";
import AppRouter from "./router/AppRouter.jsx";
import { msalInstance } from "./auth/msalInstance";
import { getApiScopes } from "./auth/msalConfig";

async function start() {
  await msalInstance.initialize();

  try {
    const result = await msalInstance.handleRedirectPromise();
    if (result?.account) {
      msalInstance.setActiveAccount(result.account);
    } else {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) msalInstance.setActiveAccount(accounts[0]);
    }

    const account = msalInstance.getActiveAccount();
    if (account) {
      try {
        const scopes = getApiScopes();
        if (scopes.length > 0) {
          const tokenRes = await msalInstance.acquireTokenSilent({ scopes, account }).catch(() => null);
          const accessToken = tokenRes?.accessToken ?? null;
          if (accessToken) {
            const meRes = await fetch("/api/auth/me", {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (meRes.ok) {
              const me = await meRes.json();
              localStorage.setItem("authProvider", "azure");
              localStorage.setItem("token", accessToken);
              const role = (me.role || "").toLowerCase() === "staff" ? "maintenancestaff" : (me.role || "").toLowerCase();
              localStorage.setItem("user", JSON.stringify({ role, name: me.fullName }));
              
              // Navigate to dashboard based on role BEFORE rendering the app
              if (role === "student") window.location.href = "/student/dashboard";
              else if (role === "maintenancestaff") window.location.href = "/staff/dashboard";
              else if (role === "admin") window.location.href = "/admin/dashboard";
              else window.location.href = "/student/dashboard";
              return; // Stop further execution
            }
          }
        }
      } catch {
        // ignore — fall through to render app
      }
    }
  } catch (err) {
    console.warn("MSAL redirect handling error (continuing):", err);
  }

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <AppRouter />
      </MsalProvider>
    </StrictMode>,
  );
}

start();