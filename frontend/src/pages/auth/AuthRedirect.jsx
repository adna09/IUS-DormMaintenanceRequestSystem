import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { getApiScopes } from "../../auth/msalConfig";

export default function AuthRedirect() {
  const { instance } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const scopes = getApiScopes();
      const accounts = instance.getAllAccounts();
      const account = accounts[0] ?? null;
      if (!account) {
        navigate("/login", { replace: true });
        return;
      }
      instance.setActiveAccount(account);
      try {
        const silent = await instance.acquireTokenSilent({ scopes, account }).catch(() => null);
        const accessToken = silent?.accessToken ?? localStorage.getItem("token");
        if (!accessToken) {
          navigate("/login", { replace: true });
          return;
        }
        const meRes = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${accessToken}` } });
        if (!meRes.ok) return navigate("/login", { replace: true });
        const me = await meRes.json();
        localStorage.setItem("authProvider", "azure");
        localStorage.setItem("token", accessToken);
        const role = (me.role || "").toLowerCase() === "staff" ? "maintenancestaff" : (me.role || "").toLowerCase();
        localStorage.setItem("user", JSON.stringify({ role, name: me.fullName }));
        if (role === "student") navigate("/student/dashboard", { replace: true });
        else if (role === "maintenancestaff") navigate("/staff/dashboard", { replace: true });
        else if (role === "admin") navigate("/admin/dashboard", { replace: true });
        else navigate("/student/dashboard", { replace: true });
      } catch {
        navigate("/login", { replace: true });
      }
    })();
  }, [instance, navigate]);

  return <div>Completing sign-in…</div>;
}