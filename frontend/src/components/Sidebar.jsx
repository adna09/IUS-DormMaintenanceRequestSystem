import { useNavigate, useLocation } from "react-router-dom";
import { Home, Send, ListChecks, Shield, Wrench, Users } from "lucide-react";
import logo from "../assets/ius-logo.png";

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
      { label: "Dashboard", path: "/student/dashboard", icon: Home },
      { label: "Submit Request", path: "/student/submit", icon: Send },
      { label: "My Requests", path: "/student/my-requests", icon: ListChecks },
    ],

    staff: [
      { label: "Dashboard", path: "/staff/dashboard", icon: Home },
      { label: "Assigned Requests", path: "/staff/assigned", icon: Wrench },
      { label: "Resolve Requests", path: "/staff/resolve", icon: ListChecks },
    ],

    admin: [
      { label: "Dashboard", path: "/admin/dashboard", icon: Shield },
      { label: "Manage Users", path: "/admin/users", icon: Users },
      { label: "All Requests", path: "/admin/requests", icon: ListChecks },
      { label: "Analytics", path: "/admin/analytics", icon: Home },
    ],
  };

  const items = menu[role] || [];

  return (
    <aside className="w-72 border-r border-sky-200 bg-sky-50 text-slate-900">
      <div className="flex h-16 items-center gap-3 border-b border-sky-200 px-5">
        <img src={logo} alt="International University logo" className="h-9 w-9" />
        <div className="leading-tight">
          <div className="text-sm font-semibold">IUS Dorm</div>
          <div className="text-xs text-slate-600">Student services</div>
        </div>
      </div>

      <div className="p-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          {role.toUpperCase()}
        </div>

        <nav className="mt-5 space-y-1">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon ?? Home;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={[
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-slate-700 hover:bg-sky-100 hover:text-slate-900",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}