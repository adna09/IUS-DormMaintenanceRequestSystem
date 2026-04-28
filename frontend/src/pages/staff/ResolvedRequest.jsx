import { useEffect, useState } from "react";
import { listRequests } from "../../utils/requests";

export default function ResolvedRequest() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(listRequests().filter((r) => r.status === "Resolved"));
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">Staff</p>
        <h1 className="text-2xl font-semibold tracking-tight">Resolved requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">Archive of completed requests.</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center shadow-sm">
          <div className="text-lg font-semibold">No resolved requests</div>
          <div className="mt-2 text-sm text-muted-foreground">
            When staff resolves a request, it will appear here.
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((r) => (
            <div key={r.id} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-base font-semibold">{r.title}</div>
                <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium">
                  {r.type ?? "Maintenance"}
                </span>
                <span className="rounded-full bg-green-600 px-2.5 py-1 text-xs font-medium text-white">
                  Resolved
                </span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {r.studentName} • {r.category} • {r.location}
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded-lg border bg-muted p-3 text-sm text-foreground">
                {r.description}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

