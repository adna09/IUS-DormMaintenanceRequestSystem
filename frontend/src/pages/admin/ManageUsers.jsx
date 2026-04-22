export default function ManageUsers() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">Admin</p>
        <h1 className="text-2xl font-semibold tracking-tight">Manage users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Placeholder screen (connect to backend later).
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="text-sm text-muted-foreground">
          When the backend is ready, this page can support:
          <ul className="mt-2 list-disc pl-5">
            <li>Create staff accounts</li>
            <li>Assign staff to dorm blocks</li>
            <li>Role changes and access control</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

