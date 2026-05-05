import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { getApiScopes } from "../../auth/msalConfig";

export default function AuthRedirect() {
  const { instance } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const scopes = getApiScopes();

    if (scopes.length === 0) {
      navigate("/login", { replace: true });
      return;
    }

    (async () => {
      try {
        const result = await instance.handleRedirectPromise();
        if (cancelled) return;

        if (!result?.account) {
          navigate("/login", { replace: true });
          return;
        }

        instance.setActiveAccount(result.account);

        let accessToken = result.accessToken;
        if (!accessToken) {
          try {
            const silent = await instance.acquireTokenSilent({
              scopes,
              account: result.account,
            });
            accessToken = silent.accessToken;
          } catch (e) {
            if (e instanceof InteractionRequiredAuthError) {
              await instance.acquireTokenRedirect({
                scopes,
                account: result.account,
              });
              return;
            }
            throw e;
          }
        }

        const meRes = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!meRes.ok) {
          const body = await meRes.json().catch(() => ({}));
          localStorage.removeItem("authProvider");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", {
            replace: true,
            state: {
              azureError:
                body.message ||
                "Could not link your Microsoft account to an application user.",
            },
          });
          return;
        }

        const me = await meRes.json();
        localStorage.setItem("authProvider", "azure");
        localStorage.setItem("token", accessToken);
        let role = (me.role || "").toLowerCase();
        if (role === "staff") role = "maintenancestaff";
        localStorage.setItem("user", JSON.stringify({ role, name: me.fullName }));

        if (role === "student") navigate("/student/dashboard", { replace: true });
        else if (role === "maintenancestaff" || role === "staff")
          navigate("/staff/dashboard", { replace: true });
        else if (role === "admin") navigate("/admin/dashboard", { replace: true });
        else navigate("/student/dashboard", { replace: true });
      } catch {
        if (!cancelled) navigate("/login", { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [instance, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-sky-900 via-sky-700 to-sky-500">
      <p className="text-center text-sm text-white">Completing sign-in…</p>
    </div>
  );
}
