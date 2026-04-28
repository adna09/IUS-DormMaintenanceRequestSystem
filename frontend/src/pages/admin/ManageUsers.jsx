import { useCallback, useEffect, useState } from "react";
import { Users, Plus, Shield, Wrench, GraduationCap } from "lucide-react";

const STORAGE_KEY = "dormUsers";

function loadUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultUsers();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getDefaultUsers();
  } catch {
    return getDefaultUsers();
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getDefaultUsers() {
  const defaults = [
    {
      id: "1",
      name: "Amina Begovic",
      email: "amina@ius.edu.ba",
      role: "student",
      dormRoom: "A-100",
      active: true,
    },
    {
      id: "2",
      name: "Emir Hadzic",
      email: "emir@ius.edu.ba",
      role: "student",
      dormRoom: "B-200",
      active: true,
    },
    {
      id: "3",
      name: "Lina Kadic",
      email: "lina@ius.edu.ba",
      role: "student",
      dormRoom: "V-300",
      active: true,
    },
    {
      id: "4",
      name: "Tarik Mehmedovic",
      email: "tarik@ius.edu.ba",
      role: "staff",
      dormRoom: null,
      active: true,
    },
    {
      id: "5",
      name: "Admin User",
      email: "admin@ius.edu.ba",
      role: "admin",
      dormRoom: null,
      active: true,
    },
  ];
  saveUsers(defaults);
  return defaults;
}

const roleConfig = {
  student: {
    icon: GraduationCap,
    bg: "bg-sky-100 text-sky-700",
    label: "Student",
  },
  staff: { icon: Wrench, bg: "bg-amber-100 text-amber-700", label: "Staff" },
  admin: { icon: Shield, bg: "bg-purple-100 text-purple-700", label: "Admin" },
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "student",
    dormRoom: "",
  });

  const refresh = useCallback(() => setUsers(loadUsers()), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    const newUser = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      dormRoom: form.dormRoom.trim() || null,
      active: true,
    };

    const next = [...loadUsers(), newUser];
    saveUsers(next);
    setForm({ name: "", email: "", role: "student", dormRoom: "" });
    setShowForm(false);
    refresh();
  };

  const toggleActive = (id) => {
    const next = loadUsers().map((u) =>
      u.id === id ? { ...u, active: !u.active } : u
    );
    saveUsers(next);
    refresh();
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <p className="text-sm text-muted-foreground">Admin</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Manage users
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View, add, or deactivate users across all roles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Add user"}
        </button>
      </div>

      {/* Add-user form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-xl border bg-card p-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold">New user</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full name</label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g., Amina Begovic"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g., amina@ius.edu.ba"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Dorm room{" "}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g., A-100"
                value={form.dormRoom}
                onChange={(e) => setForm({ ...form, dormRoom: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
            >
              Create user
            </button>
          </div>
        </form>
      )}

      {/* Users table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="grid grid-cols-12 gap-0 bg-muted px-4 py-2.5 text-xs font-medium text-muted-foreground">
          <div className="col-span-4">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-1">Room</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {users.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No users found.
          </div>
        ) : (
          <div className="divide-y">
            {users.map((u) => {
              const rc = roleConfig[u.role] ?? roleConfig.student;
              const Icon = rc.icon;

              return (
                <div
                  key={u.id}
                  className={[
                    "grid grid-cols-12 items-center gap-0 px-4 py-3 text-sm",
                    !u.active ? "opacity-50" : "",
                  ].join(" ")}
                >
                  <div className="col-span-4 flex items-center gap-2">
                    <span
                      className={[
                        "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs",
                        rc.bg,
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="truncate font-medium">{u.name}</span>
                  </div>
                  <div className="col-span-3 truncate text-muted-foreground">
                    {u.email}
                  </div>
                  <div className="col-span-2">
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                        rc.bg,
                      ].join(" ")}
                    >
                      {rc.label}
                    </span>
                  </div>
                  <div className="col-span-1 text-muted-foreground">
                    {u.dormRoom ?? "—"}
                  </div>
                  <div className="col-span-2 text-right">
                    <button
                      type="button"
                      onClick={() => toggleActive(u.id)}
                      className={[
                        "rounded-md px-3 py-1.5 text-xs font-medium transition",
                        u.active
                          ? "border bg-background hover:bg-red-50 hover:text-red-700"
                          : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
                      ].join(" ")}
                    >
                      {u.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
