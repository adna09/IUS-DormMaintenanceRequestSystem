import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import LoginPage from "../pages/auth/LoginPage";

import StudentDashboard from "../pages/student/StudentDashboard";
import SubmitRequest from "../pages/student/SubmitRequest";
import MyRequests from "../pages/student/MyRequests";
import StaffDashboard from "../pages/staff/StaffDashboard";
import AssignedRequest from "../pages/staff/AssignedRequest";
import ResolvedRequest from "../pages/staff/ResolvedRequest";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import AllRequests from "../pages/admin/AllRequests";
import Analytics from "../pages/admin/Analytics";

// layout
function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <Navbar />

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />

        <div
          style={{
            flex: 1,
            padding: 20,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
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

        <Route
          path="/student/submit"
          element={
            <Protected>
              <Layout>
                <SubmitRequest />
              </Layout>
            </Protected>
          }
        />

        <Route
          path="/student/my-requests"
          element={
            <Protected>
              <Layout>
                <MyRequests />
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

        <Route
          path="/staff/assigned"
          element={
            <Protected>
              <Layout>
                <AssignedRequest />
              </Layout>
            </Protected>
          }
        />

        <Route
          path="/staff/resolve"
          element={
            <Protected>
              <Layout>
                <ResolvedRequest />
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

        <Route
          path="/admin/users"
          element={
            <Protected>
              <Layout>
                <ManageUsers />
              </Layout>
            </Protected>
          }
        />

        <Route
          path="/admin/requests"
          element={
            <Protected>
              <Layout>
                <AllRequests />
              </Layout>
            </Protected>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <Protected>
              <Layout>
                <Analytics />
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