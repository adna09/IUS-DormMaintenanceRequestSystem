import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRequest, getCurrentUser } from "../../utils/requests";

const categories = [
  "Facility (water, heating, electricity)",
  "Room (furniture, broken item)",
  "Roommates / noise",
  "Cleaning",
  "Other",
];

const priorities = ["Low", "Medium", "High", "Urgent"];

export default function SubmitRequest() {
  const navigate = useNavigate();
  const user = useMemo(() => getCurrentUser(), []);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Please add a short title.");
    if (!location.trim()) return setError("Please provide your room / location.");
    if (!description.trim()) return setError("Please describe the issue.");

    createRequest({
      type: "Maintenance",
      title: title.trim(),
      category,
      location: location.trim(),
      priority,
      description: description.trim(),
    });

    navigate("/student/my-requests");
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">Maintenance request</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Submit a request{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Report problems with facilities, your room, roommates, or anything that affects your stay.
        </p>
      </div>

      <form onSubmit={onSubmit} className="rounded-xl border bg-card p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g., Heater not working"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Room / Location</label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g., Block A, Room 203"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="min-h-32 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="What happened? When did it start? Anything staff should know?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Tip: Include what you tried (restart, switch, breaker, etc.) if relevant.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <a
            href="/student/my-requests"
            className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </a>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
          >
            Submit request
          </button>
        </div>
      </form>
    </div>
  );
}

