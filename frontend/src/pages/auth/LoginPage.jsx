import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from "../../styles/theme";

export default function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

    const handleLogin = () => {
    setError("");

    if (!role) {
        setError("Please select a role");
        return;
    }

    if (password !== "password") {
        setError("Incorrect password");
        return;
    }

    const user = { role };

    localStorage.setItem("token", "mock-token");
    localStorage.setItem("user", JSON.stringify(user));

    if (role === "student") navigate("/student/dashboard");
    else if (role === "staff") navigate("/staff/dashboard");
    else if (role === "admin") navigate("/admin/dashboard");
    };


  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    marginTop: 12,
    borderRadius: 10,
    border: `1px solid ${theme.colors.border}`,
    outline: "none",
    fontFamily: theme.font,
    fontSize: 14,
    boxSizing: "border-box",
  };

  const buttonStyle = {
    marginTop: 16,
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: theme.colors.navy,
    color: theme.colors.white,
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: theme.font,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.colors.navy}, ${theme.colors.mid})`,
        fontFamily: theme.font,
      }}
    >
      <div
        style={{
          background: theme.colors.white,
          padding: 40,
          borderRadius: 16,
          width: 380,
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <h2 style={{ color: theme.colors.navy, marginBottom: 5 }}>
          IUS Dorm System
        </h2>

        <p style={{ color: theme.colors.muted, marginBottom: 25 }}>
          Sign in to continue
        </p>

        {/* ROLE */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {/* ERROR */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: 10,
              borderRadius: 8,
              marginTop: 10,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* BUTTON */}
        <button onClick={handleLogin} style={buttonStyle}>
          Login
        </button>

        <p style={{ fontSize: 12, marginTop: 15, color: theme.colors.muted }}>
          Default password: <b>password</b>
        </p>
      </div>
    </div>
  );
}