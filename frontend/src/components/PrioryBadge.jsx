const PRIORITY = {
  low: { label: "Low", bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", dot: "bg-gray-400" },
  medium: { label: "Medium", bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200", dot: "bg-blue-500" },
  high: { label: "High", bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-300", dot: "bg-orange-500" },
  urgent: { label: "Urgent", bg: "bg-red-50", text: "text-red-800", border: "border-red-200", dot: "bg-red-500" },
};

export default function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] ?? PRIORITY.low;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${p.bg} ${p.text} ${p.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
      {p.label}
    </span>
  );
}