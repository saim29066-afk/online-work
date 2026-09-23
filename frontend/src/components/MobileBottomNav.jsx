import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  User,
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
    { path: '/admin/plans', label: 'Plans', icon: Layers },
    { path: '/admin/settings', label: 'Settings', icon: Settings }
  ];

  const studentNavItems = [
    { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { path: '/my-plans', label: 'My Plans', icon: Layers },
    { path: '/daily-bonus', label: 'Claim', icon: Zap, highlight: true },
    { path: '/deposit', label: 'Deposit', icon: ArrowDownLeft },
    { path: '/withdraw', label: 'Withdraw', icon: ArrowUpRight },
    { path: '/referrals', label: 'Invite', icon: Gift },
    { path: '/profile', label: 'Me', icon: User }
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-safe">
      <div className="flex items-center justify-around py-1 px-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-lg transition-all ${
                active
                  ? isAdmin ? 'text-purple-700 font-black' : 'text-emerald-700 font-black'
                  : 'text-slate-600 hover:text-slate-900 font-bold'
              }`}
            >
              <div
                className={`p-1 rounded-md transition-all ${
                  active
                    ? isAdmin ? 'bg-purple-100 text-purple-700 scale-105' : 'bg-emerald-100 text-emerald-700 scale-105'
                    : ''
                }`}
              >
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
