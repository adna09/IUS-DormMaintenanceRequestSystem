import { useMemo } from "react";
import { listRequests } from "../../utils/requests";
import { isOverdue } from "../../utils/sla";
import { Wrench, CheckCircle, Clock, AlertTriangle } from "lucide-react";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={[
            "inline-flex h-10 w-10 items-center justify-center rounded-lg",
            accent ?? "bg-sky-100 text-sky-600",
          ].join(" ")}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  const data = useMemo(() => {
    const all = listRequests();
    const maintenance = all.filter(
      (r) => (r.type ?? "Maintenance") === "Maintenance"
    );
    const pending = maintenance.filter((r) => r.status === "Submitted");
    const assigned = maintenance.filter((r) => r.status === "Assigned");
    const resolved = maintenance.filter((r) => r.status === "Resolved");
    const overdue = maintenance
      .filter((r) => r.status !== "Resolved")
      .filter((r) => isOverdue(r));

    const recent = [...maintenance]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    return { pending, assigned, resolved, overdue, recent };
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header */}
      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">Staff</p>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of maintenance requests assigned to the staff team.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Pending"
          value={data.pending.length}
          accent="bg-amber-100 text-amber-600"
        />
        <StatCard
          icon={Wrench}
          label="Assigned"
          value={data.assigned.length}
          accent="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Resolved"
          value={data.resolved.length}
          accent="bg-green-100 text-green-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue"
          value={data.overdue.length}
          accent="bg-red-100 text-red-600"
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <a
          href="/staff/assigned"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
        >
          View assigned requests
        </a>
        <a
          href="/staff/resolve"
          className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          View resolved requests
        </a>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="text-sm font-semibold">Recent requests</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Latest maintenance requests from students.
        </p>

        {data.recent.length === 0 ? (
          <div className="mt-4 text-sm text-muted-foreground">
            No requests submitted yet.
          </div>
        ) : (
          <div className="mt-4 divide-y overflow-hidden rounded-lg border">
            {data.recent.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.studentName} • {r.category} • {r.location}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "rounded-full px-2.5 py-1 text-xs font-medium text-white",
                      r.status === "Resolved"
                        ? "bg-green-600"
                        : r.status === "Assigned"
                          ? "bg-blue-600"
                          : "bg-amber-500",
                    ].join(" ")}
                  >
                    {r.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}