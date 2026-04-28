import { useCallback, useEffect, useState } from "react";
import { listRequests, updateRequest } from "../../utils/requests";

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AssignedRequest() {
  const [items, setItems] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const refresh = useCallback(() => {
    const all = listRequests().filter((r) => r.status !== "Resolved");
    const filtered = showAll ? all : all.filter((r) => (r.type ?? "Maintenance") === "Maintenance");
    setItems(filtered);
  }, [showAll]);

  useEffect(() => {
     
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAll]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">Staff</p>
        <h1 className="text-2xl font-semibold tracking-tight">Maintenance requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Students submit problems (repairs/cleaning/etc.). Staff review, update status, and attach photos.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
            />
            Show non-maintenance requests too
          </label>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center shadow-sm">
          <div className="text-lg font-semibold">No active requests</div>
          <div className="mt-2 text-sm text-muted-foreground">New requests will appear here.</div>
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
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {r.studentName} • {r.category} • {r.location}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await updateRequest(r.id, { status: "Assigned" });
                      refresh();
                    }}
                    className="rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Mark assigned
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await updateRequest(r.id, { status: "Resolved" });
                      refresh();
                    }}
                    className="rounded-md bg-green-600 text-white px-3 py-2 text-sm font-medium hover:opacity-90"
                  >
                    Resolve
                  </button>
                </div>
              </div>

              <pre className="mt-3 whitespace-pre-wrap rounded-lg border bg-muted p-3 text-sm text-foreground">
                {r.description}
              </pre>

              <div className="mt-4 rounded-xl border bg-background p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold">Photos (staff)</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Upload photos for maintenance issues (before/after) or room condition if needed.
                    </div>
                  </div>

                  <label className="inline-flex cursor-pointer items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files ?? []);
                        e.target.value = "";
                        if (files.length === 0) return;

                        const urls = await Promise.all(files.map(toDataUrl));
                        const nextAttachments = [
                          ...(Array.isArray(r.attachments) ? r.attachments : []),
                          ...urls.map((url, idx) => ({
                            id: crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${idx}`,
                            url,
                            name: files[idx]?.name ?? "photo",
                            uploadedAt: new Date().toISOString(),
                            uploadedBy: "staff",
                          })),
                        ];

                        await updateRequest(r.id, { attachments: nextAttachments });
                        refresh();
                      }}
                    />
                    Upload photos
                  </label>
                </div>

                {Array.isArray(r.attachments) && r.attachments.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                ) : (
                  <div className="mt-3 text-xs text-muted-foreground">No photos uploaded yet.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

