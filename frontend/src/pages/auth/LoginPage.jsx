import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/ius-logo.png";
import { apiLogin } from "../../utils/api";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        // fallback to localStorage mock when backend is unreachable
        const fallbackRole = email.includes("admin") ? "admin" : email.includes("staff") ? "staff" : "student";
        const user = { role: fallbackRole, name: email.split("@")[0] };
        localStorage.setItem("token", "mock-token");
        localStorage.setItem("user", JSON.stringify(user));
        
        if (fallbackRole === "admin") navigate("/admin/dashboard");
        else if (fallbackRole === "staff") navigate("/staff/dashboard");
        else navigate("/student/dashboard");
        
        return;
      }

      // real API success
      localStorage.setItem("token", res.token);
      
      const role = res.role.toLowerCase();
      localStorage.setItem("user", JSON.stringify({ role, name: res.fullName }));

      if (role === "student") navigate("/student/dashboard");
      else if (role === "maintenancestaff") navigate("/staff/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
      else navigate("/student/dashboard");

    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-900 via-sky-700 to-sky-500">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl sm:p-10">
        <div className="flex flex-col items-center gap-2">
          <img src={logo} alt="IUS logo" className="h-14 w-14" />
          <h1 className="text-xl font-bold tracking-tight text-sky-900">
            IUS Dorm System
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          {/* EMAIL */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Email address
            </label>
            <input
              type="email"
              placeholder="e.g., admin@dormmanagement.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {error}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Seed admin: <strong>admin@dormmanagement.local</strong> / <strong>AdminPassword123!</strong>
          </p>
        </form>
      </div>
    </div>
  );
}