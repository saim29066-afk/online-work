import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  TrendingUp,
  Users,
  ShieldCheck,
  LogOut,
  UserPlus,
  Zap,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Menu,
  X,
  User,
  History,
  MessageSquare,
  Gift,
  Settings
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/admin/login';
  const showAuth = isAuthenticated && !!user && !isAuthPage;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo */}
          <Link
            to={showAuth ? (isAdmin ? '/admin' : '/dashboard') : '/'}
            className="flex items-center gap-2 group"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform ${
              isAdmin ? 'bg-purple-600' : 'bg-emerald-600'
            }`}>
              {isAdmin ? (
                <ShieldCheck className="w-4.5 h-4.5 text-white stroke-[2.5]" />
              ) : (
                <TrendingUp className="w-4 h-4 text-white stroke-[2.5]" />
              )}
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 flex items-center gap-0.5">
                {isAdmin ? (
                  <>ADMIN<span className="text-purple-600">PORTAL</span></>
                ) : (
                  <>STUDENT<span className="text-emerald-600">INVEST</span></>
                )}
              </span>
              <span className="text-[9px] block -mt-1 font-bold text-slate-700 uppercase tracking-wider">
                {isAdmin ? 'System Control Room' : 'Daily Bonus • 50% Referral'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 text-xs">
            {showAuth ? (
              isAdmin ? (
                /* Admin-Only Dedicated Nav Items (No student deposit/withdraw options) */
                <>
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      isActive('/admin')
                        ? 'bg-purple-100 text-purple-900 font-extrabold border border-purple-300 shadow-2xs'
                        : 'text-slate-800 hover:text-purple-900 hover:bg-slate-100'
                    }`}
                  >
                    Overview
                  </Link>
                  <Link
                    to="/admin/deposits"
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      isActive('/admin/deposits')
                        ? 'bg-purple-100 text-purple-900 font-extrabold border border-purple-300 shadow-2xs'
                        : 'text-slate-800 hover:text-purple-900 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-teal-600" />
                    Deposit Slips
                  </Link>
                  <Link
                    to="/admin/withdrawals"
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      isActive('/admin/withdrawals')
                        ? 'bg-purple-100 text-purple-900 font-extrabold border border-purple-300 shadow-2xs'
                        : 'text-slate-800 hover:text-purple-900 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                    Withdrawals
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      isActive('/admin/users')
                        ? 'bg-purple-100 text-purple-900 font-extrabold border border-purple-300 shadow-2xs'
                        : 'text-slate-800 hover:text-purple-900 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-cyan-600" />
                    Manage Students
                  </Link>
                  <Link
                    to="/admin/plans"
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      isActive('/admin/plans')
                        ? 'bg-purple-100 text-purple-900 font-extrabold border border-purple-300 shadow-2xs'
                        : 'text-slate-800 hover:text-purple-900 hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    Investment Plans
                  </Link>
                  <Link
                    to="/admin/settings"
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      isActive('/admin/settings')
                        ? 'bg-purple-100 text-purple-900 font-extrabold border border-purple-300 shadow-2xs'
                        : 'text-slate-800 hover:text-purple-900 hover:bg-slate-100'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-700" />
                    Gateway Settings
                  </Link>
                  <Link
                    to="/admin/support"
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      isActive('/admin/support')
                        ? 'bg-purple-100 text-purple-900 font-extrabold border border-purple-300 shadow-2xs'
                        : 'text-slate-800 hover:text-purple-900 hover:bg-slate-100'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    Support
                  </Link>
                </>
              ) : (
                /* Student-Only Nav Items */
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      isActive('/dashboard')
                        ? 'bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300'
                        : 'text-slate-800 hover:text-emerald-900 hover:bg-slate-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/my-plans"
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      isActive('/my-plans')
                        ? 'bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300'
                        : 'text-slate-800 hover:text-emerald-900 hover:bg-slate-100'
                    }`}
                  >
                    My Plans
                  </Link>
                  <Link
                    to="/daily-bonus"
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      isActive('/daily-bonus')
                        ? 'bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300'
                        : 'text-slate-800 hover:text-emerald-900 hover:bg-slate-100'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    Daily Claim
                  </Link>
                  <Link
                    to="/deposit"
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      isActive('/deposit')
                        ? 'bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300'
                        : 'text-slate-800 hover:text-emerald-900 hover:bg-slate-100'
                    }`}
                  >
                    Deposit
                  </Link>
                  <Link
                    to="/withdraw"
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      isActive('/withdraw')
                        ? 'bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300'
                        : 'text-slate-800 hover:text-emerald-900 hover:bg-slate-100'
                    }`}
                  >
                    Withdraw
                  </Link>
                  <Link
                    to="/referrals"
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      isActive('/referrals')
                        ? 'bg-amber-100 text-amber-900 font-extrabold border border-amber-300'
                        : 'text-slate-800 hover:text-amber-900 hover:bg-slate-100'
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-600" />
                    Referrals (50%)
                  </Link>
                  <Link
                    to="/support"
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      isActive('/support')
                        ? 'bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300'
                        : 'text-slate-800 hover:text-emerald-900 hover:bg-slate-100'
                    }`}
                  >
                    Support
                  </Link>
                </>
              )
            ) : (
              <>
                <Link to="/" className="px-3 py-1.5 rounded-lg font-bold text-slate-800 hover:text-slate-950 hover:bg-slate-100">
                  Home
                </Link>
                <Link to="/support" className="px-3 py-1.5 rounded-lg font-bold text-slate-800 hover:text-slate-950 hover:bg-slate-100">
                  Helpdesk
                </Link>
              </>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {showAuth ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  /* Admin Role Badge (No student wallet balance) */
                  <div className="flex items-center gap-1.5 bg-purple-100 border border-purple-300 px-3 py-1 rounded-full text-xs font-black text-purple-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                    <span>Administrator</span>
                  </div>
                ) : (
                  /* Student Wallet Balance */
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full text-xs">
                    <Wallet className="w-3.5 h-3.5 text-emerald-700 font-bold" />
                    <span className="font-black text-emerald-800">
                      Rs. {Number(user?.balance || 0).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Profile shortcut for student */}
                {!isAdmin && (
                  <Link
                    to="/profile"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                    title="My Profile"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors font-bold"
                >
                  <LogOut className="w-4 h-4" />
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-1.5 rounded-lg bg-slate-100 text-slate-800"
                >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs">
                <Link
                  to="/login"
                  className="px-3 py-1.5 font-bold text-slate-800 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition-all flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register (+Rs.150 Free)
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && showAuth && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 text-xs shadow-md">
          {isAdmin ? (
            /* Admin Mobile Drawer */
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-bold flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Overview</span>
              </Link>
              <Link
                to="/admin/deposits"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold flex items-center gap-2"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-teal-600" />
                <span>Deposit Slips</span>
              </Link>
              <Link
                to="/admin/withdrawals"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold flex items-center gap-2"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                <span>Withdrawals</span>
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold flex items-center gap-2"
              >
                <Users className="w-3.5 h-3.5 text-cyan-600" />
                <span>Students</span>
              </Link>
              <Link
                to="/admin/plans"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold flex items-center gap-2"
              >
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>Plans</span>
              </Link>
              <Link
                to="/admin/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 text-slate-700" />
                <span>Settings</span>
              </Link>
            </div>
          ) : (
            /* Student Mobile Drawer */
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/my-plans"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold flex items-center gap-2"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>My Plans</span>
              </Link>
              <Link
                to="/daily-bonus"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Daily Claim</span>
              </Link>
              <Link
                to="/deposit-history"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold flex items-center gap-2"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-teal-600" />
                <span>Deposit History</span>
              </Link>
              <Link
                to="/withdraw-history"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold flex items-center gap-2"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                <span>Withdraw History</span>
              </Link>
              <Link
                to="/referral-history"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold flex items-center gap-2"
              >
                <Gift className="w-3.5 h-3.5 text-amber-600" />
                <span>50% Bonus Log</span>
              </Link>
              <Link
                to="/my-tickets"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold flex items-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
                <span>My Tickets</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
