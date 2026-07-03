import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ResidentDashboard from './pages/ResidentDashboard';
import RaiseComplaint from './pages/RaiseComplaint';
import ComplaintDetails from './pages/ComplaintDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaints from './pages/AdminComplaints';
import AdminNotices from './pages/AdminNotices';
import DashboardLayout from './layouts/DashboardLayout';

// Loading Fallback Spinner
const ScreenLoader = () => (
  <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3 text-slate-400">
    <div class="h-8 w-8 animate-spin border-4 border-indigo-600 border-t-transparent rounded-full"></div>
    <p class="text-sm font-semibold">Loading Portal...</p>
  </div>
);

// Protected Route Wrapper (Must be logged in)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <ScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

// Admin Protection (Must be Admin)
const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <ScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Admin') return <Navigate to="/resident/dashboard" replace />;

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Resident Protection (Must be Resident)
const ResidentRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <ScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'Resident') return <Navigate to="/admin/dashboard" replace />;

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Root Redirect Helper
const RootRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <ScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return user.role === 'Admin' ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/resident/dashboard" replace />
  );
};

const AppContent = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Resident Portals */}
      <Route
        path="/resident/dashboard"
        element={
          <ResidentRoute>
            <ResidentDashboard />
          </ResidentRoute>
        }
      />
      <Route
        path="/resident/raise-complaint"
        element={
          <ResidentRoute>
            <RaiseComplaint />
          </ResidentRoute>
        }
      />

      {/* Shared Details View (Protected by general session but details page performs role-filtering internally) */}
      <Route
        path="/complaints/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ComplaintDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Portals */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <AdminRoute>
            <AdminComplaints />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/notices"
        element={
          <AdminRoute>
            <AdminNotices />
          </AdminRoute>
        }
      />

      {/* Base/Fallback Navigation */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
