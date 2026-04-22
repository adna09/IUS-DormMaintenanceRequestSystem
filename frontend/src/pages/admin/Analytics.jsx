import { useMemo } from "react";
import { listRequests } from "../../utils/requests";
import { getSlaHoursForRequest, isOverdue } from "../../utils/sla";

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

export default function Analytics() {
  const stats = useMemo(() => {
    const items = listRequests();
    const open = items.filter((r) => r.status !== "Resolved");
    const overdue = open.filter((r) => isOverdue(r));

    const byStatus = items.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});

    const byType = items.reduce((acc, r) => {
      const t = r.type ?? "Maintenance";
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {});

    const overdueByCategory = overdue.reduce((acc, r) => {
      const key = r.type === "Maintenance" ? r.category ?? "Uncategorized" : r.type ?? "Other";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const slaBuckets = open.reduce((acc, r) => {
      const h = getSlaHoursForRequest(r);
      const key = h <= 24 ? "≤24h" : h <= 72 ? "≤72h" : "≤96h+"; // simple view
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return {
      total: items.length,
      open: open.length,
      overdue: overdue.length,
      byStatus,
      byType,
      overdueByCategory,
      slaBuckets,
    };
  }, []);

  const statusMax = Math.max(...Object.values(stats.byStatus), 0);
  const typeMax = Math.max(...Object.values(stats.byType), 0);
  const overdueMax = Math.max(...Object.values(stats.overdueByCategory), 0);
  const slaMax = Math.max(...Object.values(stats.slaBuckets), 0);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">Admin</p>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Charts and SLA signals. Cleaning is expected faster; heating fixes may take longer.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="mt-1 text-2xl font-semibold">{stats.total}</div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">Open</div>
          <div className="mt-1 text-2xl font-semibold">{stats.open}</div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="text-sm text-muted-foreground">Overdue</div>
          <div className="mt-1 text-2xl font-semibold text-destructive">{stats.overdue}</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="text-sm font-semibold">Requests by status</div>
          <div className="mt-3 space-y-3">
            {Object.entries(stats.byStatus).map(([k, v]) => (
              <BarRow key={k} label={k} value={v} max={statusMax} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="text-sm font-semibold">Requests by type</div>
          <div className="mt-3 space-y-3">
            {Object.entries(stats.byType).map(([k, v]) => (
              <BarRow key={k} label={k} value={v} max={typeMax} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="text-sm font-semibold">Open requests by SLA target</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Based on category keywords (cleaning ≤24h, heater ~72h, etc.).
          </div>
          <div className="mt-3 space-y-3">
            {Object.entries(stats.slaBuckets).map(([k, v]) => (
              <BarRow key={k} label={k} value={v} max={slaMax} />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="text-sm font-semibold">Overdue breakdown</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Which categories are missing their target resolution time.
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.keys(stats.overdueByCategory).length === 0 ? (
            <div className="text-sm text-muted-foreground">No overdue requests.</div>
          ) : (
            Object.entries(stats.overdueByCategory).map(([k, v]) => (
              <div key={k} className="rounded-xl border bg-background p-4">
                <BarRow label={k} value={v} max={overdueMax} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

