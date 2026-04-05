import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import LoginPage from "../pages/auth/LoginPage";

import StudentDashboard from "../pages/student/StudentDashboard";
import StaffDashboard from "../pages/staff/StaffDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

// layout
function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <Navbar />

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />

        <div style={{ flex: 1, padding: 20, background: "#f4f6fb" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// auth check
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

function Protected({ children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<LoginPage />} />

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* STUDENT */}
        <Route
          path="/student/dashboard"
          element={
            <Protected>
              <Layout>
                <StudentDashboard />
              </Layout>
            </Protected>
          }
        />

        {/* STAFF */}
        <Route
          path="/staff/dashboard"
          element={
            <Protected>
              <Layout>
                <StaffDashboard />
              </Layout>
            </Protected>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <Protected>
              <Layout>
                <AdminDashboard />
              </Layout>
            </Protected>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}