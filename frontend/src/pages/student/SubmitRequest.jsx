import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, createRequest as mockCreateRequest } from "../../utils/requests";
import { apiGetCategories, apiCreateRequest } from "../../utils/api";

const priorities = ["Low", "Medium", "High", "Urgent"];
const defaultMockCategories = [
  { id: "mock-1", name: "Facility (water, heating, electricity)" },
  { id: "mock-2", name: "Room (furniture, broken item)" },
];

export default function SubmitRequest() {
  const navigate = useNavigate();
  const user = useMemo(() => getCurrentUser(), []);

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isApiMode, setIsApiMode] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGetCategories().then(data => {
      if (data) {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      } else {
        // Fallback
        setIsApiMode(false);
        setCategories(defaultMockCategories);
        setCategoryId(defaultMockCategories[0].id);
      }
    });
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Please add a short title.");
    if (!location.trim()) return setError("Please provide your room / location.");
    if (!description.trim()) return setError("Please describe the issue.");

    setLoading(true);

    try {
      if (isApiMode) {
        const priorityIndex = priorities.indexOf(priority);
        await apiCreateRequest({
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          priority: priorityIndex >= 0 ? priorityIndex : 1,
          categoryId: categoryId,
        });
      } else {
        const catName = categories.find(c => c.id === categoryId)?.name || categoryId;
        mockCreateRequest({
          type: "Maintenance",
          title: title.trim(),
          category: catName,
          location: location.trim(),
          priority,
          description: description.trim(),
        });
      }
      navigate("/student/my-requests");
    } catch(err) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Room / Location</label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g., Block A, Room 203"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loading || categories.length === 0}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
              disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit request"}
          </button>
        </div>
      </form>
    </div>
  );
}

