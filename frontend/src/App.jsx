import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/dashboard/Dashboard';
import BillingLayout from './pages/billing/BillingLayout';
import BillingList from './pages/billing/BillingList';
import BillingIssue from './pages/billing/BillingIssue';
import SuperAdminLayout from './pages/superadmin/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminCompanies from './pages/superadmin/SuperAdminCompanies';
import SuperAdminAuditLogs from './pages/superadmin/SuperAdminAuditLogs';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/billing" element={<BillingLayout />}>
            <Route index element={<BillingList />} />
            <Route path="issue" element={<BillingIssue />} />
          </Route>
          <Route path="/admin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="companies" element={<SuperAdminCompanies />} />
            <Route path="audit" element={<SuperAdminAuditLogs />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
