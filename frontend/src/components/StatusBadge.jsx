const STATUS = {
  pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", dot: "bg-amber-500" },
  assigned: { label: "Assigned", bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200", dot: "bg-blue-500" },
  in_progress: { label: "In Progress", bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-300", dot: "bg-orange-500" },
  resolved: { label: "Resolved", bg: "bg-green-50", text: "text-green-800", border: "border-green-200", dot: "bg-green-500" },
};

export default function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}