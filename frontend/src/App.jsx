import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import LiveWithdrawalTicker from './components/LiveWithdrawalTicker';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import NoticeBanner from './components/NoticeBanner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Plans from './pages/Plans';
import MyPlans from './pages/MyPlans';
import DailyBonus from './pages/DailyBonus';
import Deposit from './pages/Deposit';
import DepositHistory from './pages/DepositHistory';
import Withdraw from './pages/Withdraw';
import WithdrawHistory from './pages/WithdrawHistory';
import Referrals from './pages/Referrals';
import ReferralHistory from './pages/ReferralHistory';
import Support from './pages/Support';
import MyTickets from './pages/MyTickets';
import Profile from './pages/Profile';

// Admin Pages (Strictly protected with AdminRoute)
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageDeposits from './pages/Admin/ManageDeposits';
import ManageWithdrawals from './pages/Admin/ManageWithdrawals';
import ManageUsers from './pages/Admin/ManageUsers';
import ManagePlans from './pages/Admin/ManagePlans';
import GatewaySettings from './pages/Admin/GatewaySettings';
import AdminSupport from './pages/Admin/AdminSupport';

// Protected Route wrappers
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-800 text-xs font-bold">Loading app...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // If user is Admin, redirect away from student personal routes to Admin Control Room
  if (isAdmin) return <Navigate to="/admin" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 text-xs">Verifying admin access...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // If not admin, redirect student directly to dashboard with zero admin leak
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NoticeBanner />
      <Navbar />
      <LiveWithdrawalTicker />
      
      <main className="flex-1 pb-16 lg:pb-0">
        <Routes>
          {/* Public Student Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/support" element={<Support />} />

          {/* Student Dedicated Pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-plans"
            element={
              <ProtectedRoute>
                <MyPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily-bonus"
            element={
              <ProtectedRoute>
                <DailyBonus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposit"
            element={
              <ProtectedRoute>
                <Deposit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposit-history"
            element={
              <ProtectedRoute>
                <DepositHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw"
            element={
              <ProtectedRoute>
                <Withdraw />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdraw-history"
            element={
              <ProtectedRoute>
                <WithdrawHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/referrals"
            element={
              <ProtectedRoute>
                <Referrals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/referral-history"
            element={
              <ProtectedRoute>
                <ReferralHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Pages (Hidden and inaccessible to students) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/deposits"
            element={
              <AdminRoute>
                <ManageDeposits />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/withdrawals"
            element={
              <AdminRoute>
                <ManageWithdrawals />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <ManageUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/plans"
            element={
              <AdminRoute>
                <ManagePlans />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <GatewaySettings />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/support"
            element={
              <AdminRoute>
                <AdminSupport />
              </AdminRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
