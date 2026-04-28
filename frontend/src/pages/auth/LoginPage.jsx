import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/ius-logo.png";

export default function LoginPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!role) {
      setError("Please select a role");
      return;
    }

    if (password !== "password") {
      setError("Incorrect password");
      return;
    }

    const user = { role, name: name.trim() };

    localStorage.setItem("token", "mock-token");
    localStorage.setItem("user", JSON.stringify(user));

    if (role === "student") navigate("/student/dashboard");
    else if (role === "staff") navigate("/staff/dashboard");
    else if (role === "admin") navigate("/admin/dashboard");
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
          {/* NAME */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Full name
            </label>
            <input
              type="text"
              placeholder="e.g., Aldin Cimic"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* ROLE */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Select role</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
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
            className="w-full rounded-lg bg-sky-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.98]"
          >
            Sign in
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Default password: <strong>password</strong>
          </p>
        </form>
      </div>
    </div>
  );
}