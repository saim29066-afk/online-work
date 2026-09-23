import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ShieldCheck,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  Layers,
  Settings,
  TrendingUp,
  ChevronRight,
  Loader2,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-700 gap-3 font-semibold">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm">Loading admin analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 bg-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-950 text-white shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-[10px] font-bold uppercase tracking-wider mb-1 border border-purple-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-300" /> Super Admin Control Room
          </div>
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-white">
            Platform Management & Financials
          </h1>
          <p className="text-[11px] sm:text-xs text-purple-200 mt-0.5 font-medium">
            Real-time live accounting of student manual slips, cashouts, and platform investments.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/admin/settings"
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Settings className="w-3.5 h-3.5 text-purple-300" /> Gateway Settings
          </Link>
        </div>
      </div>

      {/* Real Financials & KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Real Total Deposited */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-teal-900 uppercase tracking-tight">
              Real Deposits
            </span>
            <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <h2 className="text-base sm:text-xl font-black text-teal-950 leading-tight">
            Rs. {Number(stats?.totalDeposited || 0).toLocaleString()}
          </h2>
          <p className="text-[9.5px] text-teal-800 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0" /> Verified Slips
          </p>
        </div>

        {/* Real Total Withdrawn */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-cyan-900 uppercase tracking-tight">
              Real Paid Out
            </span>
            <div className="w-6 h-6 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <h2 className="text-base sm:text-xl font-black text-cyan-950 leading-tight">
            Rs. {Number(stats?.totalWithdrawn || 0).toLocaleString()}
          </h2>
          <p className="text-[9.5px] text-cyan-800 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-cyan-600 shrink-0" /> Transferred Payouts
          </p>
        </div>

        {/* Total Registered Students */}
        <Link
          to="/admin/users"
          className="p-3 sm:p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 shadow-2xs hover:border-indigo-400 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-tight">
              Registered Students
            </span>
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <h2 className="text-base sm:text-xl font-black text-indigo-950 leading-tight">
            {stats?.totalUsers || 0}
          </h2>
          <p className="text-[9.5px] text-indigo-800 font-semibold mt-1">
            Manage students →
          </p>
        </Link>

        {/* Pending Deposits Box */}
        <Link
          to="/admin/deposits"
          className={`p-3 sm:p-3.5 rounded-xl border transition-all shadow-2xs ${
            stats?.pendingDeposits > 0
              ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400/20'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-amber-950 uppercase tracking-tight">
              Pending Slips
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <h2 className="text-base sm:text-xl font-black text-slate-900 leading-tight">
            {stats?.pendingDeposits || 0}
          </h2>
          <p className="text-[9.5px] text-amber-900 font-semibold mt-1 flex items-center gap-1">
            {stats?.pendingDeposits > 0 ? '⚠️ Slips awaiting approval' : 'All slips processed'}
          </p>
        </Link>

        {/* Pending Withdrawals Box */}
        <Link
          to="/admin/withdrawals"
          className={`p-3 sm:p-3.5 rounded-xl border transition-all shadow-2xs ${
            stats?.pendingWithdrawals > 0
              ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400/20'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-rose-950 uppercase tracking-tight">
              Pending Payouts
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <h2 className="text-base sm:text-xl font-black text-slate-900 leading-tight">
            {stats?.pendingWithdrawals || 0}
          </h2>
          <p className="text-[9.5px] text-rose-900 font-semibold mt-1 flex items-center gap-1">
            {stats?.pendingWithdrawals > 0 ? '⚠️ Cashouts awaiting transfer' : 'No pending payouts'}
          </p>
        </Link>

        {/* Active Investment Plans */}
        <Link
          to="/admin/plans"
          className="p-3 sm:p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 shadow-2xs hover:border-purple-400 transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-purple-950 uppercase tracking-tight">
              Active Plans
            </span>
            <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <h2 className="text-base sm:text-xl font-black text-purple-950 leading-tight">
            {stats?.activeInvestments || 0}
          </h2>
          <p className="text-[9.5px] text-purple-800 font-semibold mt-1">
            Edit plans & rates →
          </p>
        </Link>
      </div>

      {/* Action Navigation Panels */}
      <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider pt-1">
        Quick Admin Navigation
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        <Link
          to="/admin/plans"
          className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between hover:border-purple-500 hover:shadow-xs transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">Edit Investment Plans</p>
              <p className="text-[10px] text-slate-500 font-medium">Change prices, ROI & durations</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/admin/deposits"
          className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between hover:border-teal-500 hover:shadow-xs transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">Approve Deposit Slips</p>
              <p className="text-[10px] text-slate-500 font-medium">Verify TIDs & credit wallets</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/admin/withdrawals"
          className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between hover:border-rose-500 hover:shadow-xs transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">Process Withdrawals</p>
              <p className="text-[10px] text-slate-500 font-medium">Transfer funds or fail/reject</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/admin/users"
          className="p-4 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-between hover:border-cyan-500 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-100 text-cyan-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Manage Students</p>
              <p className="text-xs text-slate-600 font-medium">Adjust balances & restrictions</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>

        <Link
          to="/admin/settings"
          className="p-4 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-between hover:border-purple-500 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Gateway Settings</p>
              <p className="text-xs text-slate-600 font-medium">Update payment mobile numbers</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>

        <Link
          to="/admin/support"
          className="p-4 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-between hover:border-blue-500 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Student Support</p>
              <p className="text-xs text-slate-600 font-medium">Reply to helpdesk tickets</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
