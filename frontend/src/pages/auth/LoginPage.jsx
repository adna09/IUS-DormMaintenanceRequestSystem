import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/ius-logo.png";
import { getApiScopes } from "../../auth/msalConfig";
import { apiLogin, apiRegister } from "../../utils/api";
import { resolveRoleForNavigation } from "../../utils/authRole";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { instance } = useMsal();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dormRoom, setDormRoom] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  useEffect(() => {
    const msg = location.state?.azureError;
    if (msg) {
      setError(msg);
      setMode("login");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const switchMode = (next) => {
    setMode(next);
    setError("");
  };

  const goToRoleHome = (roleString, fullName) => {
    const raw = String(roleString ?? "").toLowerCase();
    const role =
      raw === "maintenancestaff" || raw === "staff" ? "maintenancestaff" : raw;
    localStorage.setItem("user", JSON.stringify({ role, name: fullName }));
    if (role === "student") navigate("/student/dashboard");
    else if (role === "maintenancestaff") navigate("/staff/dashboard");
    else if (role === "admin") navigate("/admin/dashboard");
    else navigate("/student/dashboard");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await apiLogin(email.trim(), password);

      if (!res) {
        setError(
          "Unable to reach the server. Start the backend API (e.g. dotnet run) and ensure the Vite proxy can reach it. Your password was not checked.",
        );
        return;
      }

      localStorage.removeItem("authProvider");
      localStorage.setItem("token", res.token);
      const roleStr = resolveRoleForNavigation(res, email.trim());
      goToRoleHome(roleStr, res.fullName ?? res.FullName);
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !regPassword) {
      setError("Please fill in full name, email, and password");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (regPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const dto = {
        fullName: fullName.trim(),
        email: email.trim(),
        password: regPassword,
        ...(dormRoom.trim() ? { dormRoom: dormRoom.trim() } : {}),
        ...(phone.trim() ? { phoneNumber: phone.trim() } : {}),
      };

      const res = await apiRegister(dto);
      if (!res) {
        setError("Unable to reach the server. Try again.");
        return;
      }

      localStorage.removeItem("authProvider");
      localStorage.setItem("token", res.token);
      const roleStr = resolveRoleForNavigation(res, email.trim());
      goToRoleHome(roleStr, res.fullName ?? res.FullName);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setError("");
    const clientId = (import.meta.env.VITE_AZURE_CLIENT_ID ?? "").trim();
    if (!clientId) {
      setError(
        "Microsoft sign-in is missing VITE_AZURE_CLIENT_ID. Add it to frontend/.env.development and restart the dev server (Vite only reads env at startup).",
      );
      return;
    }
    const scopes = getApiScopes();
    if (scopes.length === 0) {
      setError(
        "Microsoft sign-in is missing VITE_AZURE_API_SCOPE (your API’s exposed scope, e.g. api://<app-id>/api_access). See .env.development.",
      );
      return;
    }
    try {
      // OIDC scopes + your API scope (custom API scope alone can fail until consented).
      const signInScopes = ["openid", "profile", ...scopes];
      await instance.loginRedirect({ scopes: signInScopes });
    } catch (e) {
      console.error("[Microsoft sign-in]", e);
      const msg =
        e?.message ||
        e?.errorCode ||
        (typeof e === "object" && e !== null ? JSON.stringify(e) : String(e));
      setError(msg || "Microsoft sign-in failed.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-sky-900 via-sky-700 to-sky-500">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl sm:p-10">
        <div className="flex flex-col items-center gap-2">
          <img src={logo} alt="IUS logo" className="h-14 w-14" />
          <h1 className="text-xl font-bold tracking-tight text-sky-900">
            IUS Dorm System
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Sign in to continue" : "Create an account"}
          </p>
        </div>

        <div className="mt-6 flex gap-1 rounded-lg border border-sky-200/80 bg-sky-50/50 p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              mode === "login"
                ? "bg-white text-sky-900 shadow-sm"
                : "text-sky-800/70 hover:text-sky-900"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              mode === "register"
                ? "bg-white text-sky-900 shadow-sm"
                : "text-sky-800/70 hover:text-sky-900"
            }`}
          >
            Register
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Email address
              </label>
              <input
                type="email"
                placeholder="admin@dormmanagement.local, you@student.com, …"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-lg border bg-background py-2.5 pl-3.5 pr-11 text-sm outline-none transition focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sky-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleMicrosoftLogin}
              disabled={loading}
              className="w-full rounded-lg border border-sky-800/20 bg-white px-4 py-2.5 text-sm font-semibold text-sky-900 shadow-sm transition hover:bg-sky-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Sign in with Microsoft
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Microsoft sign-in requires a matching user email in this app’s database.
            </p>

            <p className="text-center text-xs text-muted-foreground">
              <strong className="text-foreground">Demo admin</strong> (seed):{" "}
              <strong>admin@dormmanagement.local</strong> / AdminPassword123!
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Full name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Email address <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                placeholder="you@student.com or you@staff.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <p className="rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs text-sky-900">
              Role is chosen from your email domain:{" "}
              <strong>@student.com</strong> → student, <strong>@staff.com</strong> → maintenance staff.
              Other addresses register as students.
            </p>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-lg border bg-background py-2.5 pl-3.5 pr-11 text-sm outline-none transition focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  aria-label={showRegPassword ? "Hide password" : "Show password"}
                  aria-pressed={showRegPassword}
                  onClick={() => setShowRegPassword((v) => !v)}
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Confirm password <span className="text-red-600">*</span>
              </label>
              <input
                type={showRegPassword ? "text" : "password"}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Dorm room <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. A-100"
                value={dormRoom}
                onChange={(e) => setDormRoom(e.target.value)}
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Phone <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                type="tel"
                placeholder="+387 61 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sky-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
