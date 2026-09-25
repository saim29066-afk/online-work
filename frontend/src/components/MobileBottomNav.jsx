import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Users,
  Settings
} from 'lucide-react';

const MobileBottomNav = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const adminNavItems = [
    { path: '/admin', label: 'Overview', icon: ShieldCheck },
    { path: '/admin/deposits', label: 'Deposits', icon: ArrowDownLeft },
    { path: '/admin/withdrawals', label: 'Cashouts', icon: ArrowUpRight },
    { path: '/admin/users', label: 'Students', icon: Users },
    { path: '/admin/plans', label: 'Plans', icon: Layers }
  ];

  const studentNavItems = [
    { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { path: '/my-plans', label: 'Plans', icon: Layers },
    { path: '/daily-bonus', label: 'Claim', icon: Zap, isCenter: true },
    { path: '/deposit', label: 'Deposit', icon: ArrowDownLeft },
    { path: '/withdraw', label: 'Withdraw', icon: ArrowUpRight }
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t-2 border-slate-200 shadow-2xl pb-safe">
      <div className="flex items-center justify-between px-2 py-1.5 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          if (item.isCenter) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center -mt-5 relative group px-2"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
                    active
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-emerald-600/30'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white ring-4 ring-white shadow-emerald-500/20'
                  }`}
                >
                  <Icon className="w-6 h-6 fill-white" />
                </div>
                <span
                  className={`text-[11px] font-black mt-1 tracking-tight ${
                    active ? 'text-emerald-700 font-extrabold' : 'text-slate-800'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                active
                  ? isAdmin
                    ? 'text-purple-950 font-black bg-purple-50'
                    : 'text-emerald-950 font-black bg-emerald-50'
                  : 'text-slate-700 hover:text-slate-900 font-bold'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  active
                    ? isAdmin
                      ? 'text-purple-700 scale-110'
                      : 'text-emerald-600 scale-110'
                    : 'text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.3]" />
              </div>
              <span
                className={`text-[11px] mt-0.5 tracking-tight font-black ${
                  active
                    ? isAdmin
                      ? 'text-purple-900'
                      : 'text-emerald-800'
                    : 'text-slate-700'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
