import { LogOut } from "lucide-react";
import logo from "../assets/ius-logo.png";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export default function Navbar() {
  const user = getUser();
  return (
    <div className="sticky top-0 z-40 border-b border-sky-200 bg-sky-50/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="International University logo" className="h-9 w-9" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">International University</div>
            <div className="text-xs text-muted-foreground">Dorm Maintenance System</div>
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium">{user.name ?? "User"}</div>
              <div className="text-xs text-muted-foreground">{String(user.role ?? "").toUpperCase()}</div>
            </div>

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
              className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Not signed in</div>
        )}
      </div>
    </div>
  );
}