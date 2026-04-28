import { useEffect, useMemo } from "react";
import { getCurrentUser, listRequests } from "../../utils/requests";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function statusBadge(status) {
  const map = {
    Submitted: "bg-red-600 text-white",
    Assigned: "bg-blue-600 text-white",
    Resolved: "bg-green-600 text-white",
  };
  return map[status] ?? "bg-muted text-foreground";
}

export default function MyRequests() {
  const user = useMemo(() => getCurrentUser(), []);
  const items = useMemo(() => listRequests(), []);

  useEffect(() => {
    // Items are initialized from state initializer
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <p className="text-sm text-muted-foreground">My requests</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Requests{user?.name ? ` for ${user.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track what you submitted and see updates as staff process it.
          </p>
        </div>

        <a
          href="/student/submit"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
        >
          New request
        </a>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center text-card-foreground shadow-sm">
          <h2 className="text-lg font-semibold">No requests yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            When you submit a request, it will show up here with its status.
          </p>
          <div className="mt-5">
            <a
              href="/student/submit"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
            >
              Submit your first request
            </a>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold">{r.title}</h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(
                        r.status
                      )}`}
                    >
                      {r.status}
                    </span>
                    <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 text-xs font-medium">
                      {r.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {r.category} • {r.location}
                  </p>
                </div>

                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Submitted:</span>{" "}
                  {formatDate(r.createdAt)}
                </div>
              </div>

              <p className="mt-3 text-sm text-foreground">{r.description}</p>

              {Array.isArray(r.attachments) && r.attachments.length > 0 ? (
                <div className="mt-4">
                  <div className="text-sm font-semibold">Photos</div>
                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                          className="h-28 w-full object-cover transition group-hover:scale-[1.02]"
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

