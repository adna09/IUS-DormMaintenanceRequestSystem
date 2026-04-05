import { C, FONT } from "../styles/theme";

const PRIORITY = {
  low: { label:"Low", bg:"#f3f4f6", color:"#374151", border:"#d1d5db", dot:"#9ca3af" },
  medium: { label:"Medium", bg:"#eff6ff", color:"#1e40af", border:"#bfdbfe", dot:"#3b82f6" },
  high: { label:"High", bg:"#fff7ed", color:"#9a3412", border:"#fdba74", dot:"#f97316" },
  urgent: { label:"Urgent", bg:"#fef2f2", color:"#991b1b", border:"#fecaca", dot:"#ef4444" },
};

export default function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] || PRIORITY.low;

  return (
    <span style={{
      display:"inline-flex",
      alignItems:"center",
      gap:6,
      padding:"3px 10px",
      borderRadius:20,
      background:p.bg,
      color:p.color,
      border:`1px solid ${p.border}`,
      fontSize:12,
      fontWeight:700,
      fontFamily:FONT
    }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:p.dot }} />
      {p.label}
    </span>
  );
}