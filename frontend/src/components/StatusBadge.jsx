import { C, FONT } from "../styles/theme";

const STATUS = {
  pending: { label:"Pending", bg:"#fffbeb", color:"#92400e", border:"#fde68a", dot:"#f59e0b" },
  assigned: { label:"Assigned", bg:"#eff6ff", color:"#1e40af", border:"#bfdbfe", dot:"#3b82f6" },
  in_progress: { label:"In Progress", bg:"#fff7ed", color:"#9a3412", border:"#fdba74", dot:"#f97316" },
  resolved: { label:"Resolved", bg:"#f0fdf4", color:"#166534", border:"#86efac", dot:"#22c55e" },
};

export default function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;

  return (
    <span style={{
      display:"inline-flex",
      alignItems:"center",
      gap:6,
      padding:"3px 10px",
      borderRadius:20,
      background:s.bg,
      color:s.color,
      border:`1px solid ${s.border}`,
      fontSize:12,
      fontWeight:700,
      fontFamily:FONT
    }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:s.dot }} />
      {s.label}
    </span>
  );
}