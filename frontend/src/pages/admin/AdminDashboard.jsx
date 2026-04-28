import { useMemo } from "react";
import { listRequests } from "../../utils/requests";
import { getDueAt, isNew, isOverdue } from "../../utils/sla";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function BarRow({ label, value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const data = useMemo(() => {
    const items = listRequests();
    const maintenance = items.filter((r) => (r.type ?? "Maintenance") === "Maintenance");
    const roomSel = items.filter((r) => (r.type ?? "Maintenance") === "Room selection");

    const open = items.filter((r) => r.status !== "Resolved");
    const resolved = items.filter((r) => r.status === "Resolved");

    const overdue = open.filter((r) => isOverdue(r));
    const newlyReceived = open.filter((r) => isNew(r, 6));

    const byStatus = items.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});

    const recent = [...items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    return {
      items,
      maintenance,
      roomSel,
      open,
      resolved,
      overdue,
      newlyReceived,
      byStatus,
      recent,
    };
  }, []);

  const statusMax = Math.max(...Object.values(data.byStatus), 0);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">Admin overview</p>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor the workflow, SLA signals, and latest maintenance activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">Open</div>
          <div className="mt-1 text-2xl font-semibold">{data.open.length}</div>
          <div className="mt-1 text-xs text-muted-foreground">Not resolved yet</div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">Resolved</div>
          <div className="mt-1 text-2xl font-semibold">{data.resolved.length}</div>
          <div className="mt-1 text-xs text-muted-foreground">Completed requests</div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">Overdue</div>
          <div className="mt-1 text-2xl font-semibold text-destructive">{data.overdue.length}</div>
          <div className="mt-1 text-xs text-muted-foreground">Past SLA target</div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">New (last 6h)</div>
          <div className="mt-1 text-2xl font-semibold">{data.newlyReceived.length}</div>
          <div className="mt-1 text-xs text-muted-foreground">Recently received</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-1">
          <div className="text-sm font-semibold">By status</div>
          <div className="mt-3 space-y-3">
            {Object.entries(data.byStatus).map(([k, v]) => (
              <BarRow key={k} label={k} value={v} max={statusMax} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Recent requests</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Shows due time targets for maintenance categories (cleaning faster, heaters longer).
              </div>
            </div>
            <a
              href="/admin/requests"
              className="mt-3 inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted sm:mt-0"
            >
              View all
            </a>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border">
            <div className="grid grid-cols-12 gap-0 bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
              <div className="col-span-5">Title</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3">Due</div>
            </div>
            <div className="divide-y">
              {data.recent.map((r) => {
                const due = getDueAt(r);
                const overdue = isOverdue(r);
                const newFlag = isNew(r, 6);

                return (
                  <div key={r.id} className="grid grid-cols-12 gap-0 px-4 py-3 text-sm">
                    <div className="col-span-5 min-w-0">
                      <div className="truncate font-medium">{r.title}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {r.studentName} • {r.category} • {r.location}
                      </div>
                    </div>
                    <div className="col-span-2 text-xs">
                      <span className="rounded-full border bg-background px-2 py-1">
                        {r.type ?? "Maintenance"}
                      </span>
                    </div>
                    <div className="col-span-2 text-xs">
                      <span
                        className={[
                          "rounded-full px-2 py-1 text-white",
                          r.status === "Resolved"
                            ? "bg-green-600"
                            : r.status === "Assigned"
                              ? "bg-blue-600"
                              : "bg-red-600",
                        ].join(" ")}
                      >
                        {r.status}
                      </span>
                      {newFlag ? (
                        <span className="ml-2 rounded-full bg-accent px-2 py-1 text-accent-foreground">
                          New
                        </span>
                      ) : null}
                    </div>
                    <div className="col-span-3 text-xs">
                      {due ? (
                        <span className={overdue ? "font-medium text-destructive" : "text-muted-foreground"}>
                          {formatDate(due.toISOString())}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">Maintenance</div>
          <div className="mt-1 text-xl font-semibold">{data.maintenance.length}</div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">Room selection</div>
          <div className="mt-1 text-xl font-semibold">{data.roomSel.length}</div>
        </div>
      </div>
    </div>
  );
}