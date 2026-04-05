import { useNavigate, useLocation } from "react-router-dom";
import { theme } from "../styles/theme";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = getUser();
  if (!user) return null;

  const role = user.role;

  const menu = {
    student: [
      { label: "Dashboard", path: "/student/dashboard" },
      { label: "Submit Request", path: "/student/submit" },
      { label: "My Requests", path: "/student/my-requests" },
    ],

    staff: [
      { label: "Dashboard", path: "/staff/dashboard" },
      { label: "Assigned Requests", path: "/staff/assigned" },
      { label: "Resolve Requests", path: "/staff/resolve" },
    ],

    admin: [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Manage Users", path: "/admin/users" },
      { label: "All Requests", path: "/admin/requests" },
      { label: "Analytics", path: "/admin/analytics" },
    ],
  };

  const items = menu[role] || [];

  return (
    <div
      style={{
        width: 250,
        minHeight: "100vh",
        background: theme.colors.navy,
        color: "white",
        padding: 20,
      }}
    >
      {/* APP TITLE */}
      <h2 style={{ marginBottom: 20 }}>IUS Dorm</h2>

      {/* ROLE BADGE */}
      <div
        style={{
          fontSize: 12,
          marginBottom: 25,
          background: "rgba(255,255,255,0.12)",
          padding: "6px 10px",
          borderRadius: 8,
          display: "inline-block",
        }}
      >
        {role.toUpperCase()}
      </div>

      {/* MENU */}
      {items.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              cursor: "pointer",
              marginBottom: 8,
              background: isActive ? "rgba(255,255,255,0.25)" : "transparent",
              fontWeight: isActive ? "bold" : "normal",
              transition: "0.2s",
            }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
}