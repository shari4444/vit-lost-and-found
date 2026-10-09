import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Auth Pages
import { StudentLoginPage } from './pages/auth/StudentLoginPage';
import { StudentSignupPage } from './pages/auth/StudentSignupPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { LandingPage } from './pages/LandingPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ReportLostItemPage } from './pages/student/ReportLostItemPage';
import { MyRequestsPage } from './pages/student/MyRequestsPage';
import { FoundItemsPage } from './pages/student/FoundItemsPage';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage';

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminLostRequestsPage } from './pages/admin/AdminLostRequestsPage';
import { AdminMatchManagementPage } from './pages/admin/AdminMatchManagementPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminAuditLogPage } from './pages/admin/AdminAuditLogPage';
import { AddFoundItemModal } from './pages/admin/AddFoundItemModal';

export const App = () => {
  const [adminFoundModalOpen, setAdminFoundModalOpen] = useState(false);

  return (
    <>
      <Routes>
        {/* Public & Authentication Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<StudentLoginPage />} />
        <Route path="/student/signup" element={<StudentSignupPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Student Protected Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout title="Student Dashboard">
                <StudentDashboard />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/report"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout title="Report Lost Item">
                <ReportLostItemPage />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/requests"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout title="My Lost Requests">
                <MyRequestsPage />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/found-items"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout title="Found Items Catalog">
                <FoundItemsPage />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout title="Notifications & Matches">
                <StudentNotificationsPage />
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout
                title="Operations Overview"
                onOpenNewFoundModal={() => setAdminFoundModalOpen(true)}
              >
                <AdminOverviewPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/lost-requests"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout
                title="Lost Requests Management"
                onOpenNewFoundModal={() => setAdminFoundModalOpen(true)}
              >
                <AdminLostRequestsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/match-management"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout
                title="Match Management Console"
                onOpenNewFoundModal={() => setAdminFoundModalOpen(true)}
              >
                <AdminMatchManagementPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout
                title="Students Directory"
                onOpenNewFoundModal={() => setAdminFoundModalOpen(true)}
              >
                <AdminStudentsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-log"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout
                title="System Audit Log"
                onOpenNewFoundModal={() => setAdminFoundModalOpen(true)}
              >
                <AdminAuditLogPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Admin Found Item Modal */}
      <AddFoundItemModal
        isOpen={adminFoundModalOpen}
        onClose={() => setAdminFoundModalOpen(false)}
        onItemAdded={() => {
          // Trigger refresh if needed or notify
        }}
      />
    </>
  );
};
