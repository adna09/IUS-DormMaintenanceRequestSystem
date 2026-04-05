import { theme } from "../styles/theme";

export default function Navbar({ user }) {
  return (
    <div style={{
      height:60,
      background:theme.colors.navy,
      color:"#fff",
      display:"flex",
      alignItems:"center",
      justifyContent:"space-between",
      padding:"0 20px",
    
    }}>
      <b>Dorm System</b>
      {user && <span>{user.role}</span>}
    </div>
  );
}