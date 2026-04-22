export default function StaffDashboard() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">Staff</p>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the sidebar to manage assigned requests and view resolved items.
        </p>
      </div>
    </div>
  );
}