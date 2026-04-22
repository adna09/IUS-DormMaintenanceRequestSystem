import { useEffect, useState } from "react";
import { listRequests, updateRequest } from "../../utils/requests";

export default function AllRequests() {
  const [items, setItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState("All");

  const refresh = () => {
    const all = listRequests();
    const filtered =
      typeFilter === "All" ? all : all.filter((r) => (r.type ?? "Maintenance") === typeFilter);
    setItems(filtered);
  };

  useEffect(() => {
     
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">Admin</p>
        <h1 className="text-2xl font-semibold tracking-tight">All requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Supervise the workflow and monitor maintenance volume/status.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {["All", "Maintenance", "Room selection"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={[
                "rounded-full px-3 py-1 text-xs font-medium transition",
                typeFilter === t
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background hover:bg-muted",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center shadow-sm">
          <div className="text-lg font-semibold">No requests yet</div>
          <div className="mt-2 text-sm text-muted-foreground">Requests will appear here.</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((r) => (
            <div key={r.id} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-base font-semibold">{r.title}</div>
                    <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium">
                      {r.type ?? "Maintenance"}
                    </span>
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-xs font-medium text-white",
                        r.status === "Resolved"
                          ? "bg-green-600"
                          : r.status === "Assigned"
                            ? "bg-blue-600"
                            : "bg-red-600",
                      ].join(" ")}
                    >
                      {r.status}
                    </span>
                    <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium">
                      {r.priority}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {r.studentName} • {r.category} • {r.location}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateRequest(r.id, { status: "Assigned" });
                      refresh();
                    }}
                    className="rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Assign
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateRequest(r.id, { status: "Resolved" });
                      refresh();
                    }}
                    className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    Resolve
                  </button>
                </div>
              </div>

              <pre className="mt-3 whitespace-pre-wrap rounded-lg border bg-muted p-3 text-sm text-foreground">
                {r.description}
              </pre>

              {Array.isArray(r.attachments) && r.attachments.length > 0 ? (
                <div className="mt-4">
                  <div className="text-sm font-semibold">Photos</div>
                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {r.attachments.map((a) => (
                      <a
                        key={a.id ?? a.url}
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group overflow-hidden rounded-lg border bg-muted"
                        title={a.name}
                      >
                        <img
                          src={a.url}
                          alt={a.name ?? "attachment"}
                          className="h-24 w-full object-cover transition group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

