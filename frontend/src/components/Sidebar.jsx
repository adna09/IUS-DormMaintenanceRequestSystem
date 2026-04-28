import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Send,
  ListChecks,
  Shield,
  Wrench,
  Users,
  X,
} from "lucide-react";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export default function Sidebar({ open, onClose }) {
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

    maintenancestaff: [
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
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-sky-200 bg-sky-50 text-slate-900 transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Mobile close */}
        <div className="flex h-16 items-center justify-between border-b border-sky-200 px-5 lg:justify-start">
          <div className="leading-tight">
            <div className="text-sm font-semibold">IUS Dorm</div>
            <div className="text-xs text-slate-600">Student services</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-sky-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            {role.toUpperCase().replace("MAINTENANCESTAFF", "STAFF")}
          </div>

          <nav className="mt-5 space-y-1">
            {items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon ?? Home;

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    onClose?.();
                  }}
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
    </>
  );
}