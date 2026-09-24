import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';
import PlanCard from '../components/PlanCard';
import {
  Wallet,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  Users,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  History,
  MessageSquare,
  ChevronRight,
  Loader2,
  Gift,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [investments, setInvestments] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_investments');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [availablePlans, setAvailablePlans] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_plans');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('cached_plans') && !localStorage.getItem('cached_investments');
  });
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMessage, setClaimMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      const [plansRes, invRes] = await Promise.allSettled([
        api.get('/plans'),
        api.get('/plans/my-investments')
      ]);

      if (plansRes.status === 'fulfilled' && plansRes.value.data.success) {
        setAvailablePlans(plansRes.value.data.plans);
        localStorage.setItem('cached_plans', JSON.stringify(plansRes.value.data.plans));
      }

      if (invRes.status === 'fulfilled' && invRes.value.data.success) {
        setInvestments(invRes.value.data.investments);
        localStorage.setItem('cached_investments', JSON.stringify(invRes.value.data.investments));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    refreshUser();
  }, []);

  const handleClaimDaily = async () => {
    setClaimLoading(true);
    setClaimMessage({ text: '', type: '' });
    try {
      const res = await api.post('/plans/claim-daily');
      if (res.data.success) {
        setClaimMessage({ text: res.data.message, type: 'success' });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 }
        });
        await refreshUser();
        await fetchData();
      }
    } catch (err) {
      setClaimMessage({
        text: err.response?.data?.message || 'Daily profit claim failed.',
        type: 'error'
      });
    } finally {
      setClaimLoading(false);
    }
  };

  const activePlans = investments.filter((i) => i.status === 'ACTIVE');
  const totalDailyProfit = activePlans.reduce((acc, curr) => acc + curr.dailyBonus, 0);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-5 space-y-3.5 bg-white">
      {/* Account Restriction Violation Alert Banner (If Restricted by Admin) */}
      {user?.isRestricted && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-2 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-rose-900 text-sm">Account Restricted for Policy Violation</h4>
            <p className="text-rose-700 mt-0.5">
              Reason: <strong className="text-rose-900">{user.restrictionReason || 'Violation of terms'}</strong>
            </p>
            <p className="text-[11px] text-rose-600 mt-1">
              Your withdrawals and plan purchases are temporarily blocked. Please contact{' '}
              <Link to="/support" className="font-bold underline text-rose-800">
                Helpdesk Support
              </Link>{' '}
              to resolve this issue.
            </p>
          </div>
        </div>
      )}

      {/* Top Welcome Card */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
              🎓 Student Investor
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
              🎁 Rs. 150 Free Bonus Credited
            </span>
            <span className="text-xs text-slate-600">
              Ref: <strong className="font-mono text-slate-900 font-bold">{user?.referralCode}</strong>
            </span>
          </div>
          <h1 className="text-base sm:text-xl font-black text-slate-900 leading-tight">Welcome, {user?.name || 'Student'}! 👋</h1>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Your university investment wallet and daily earning center.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          <Link
            to="/deposit"
            className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4" /> Deposit
          </Link>
          <Link
            to="/withdraw"
            className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs border border-slate-300 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 text-rose-600" /> Withdraw
          </Link>
        </div>
      </div>

      {/* Main KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Balance Card */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-emerald-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Wallet Balance</span>
            <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
            Rs. {Number(user?.balance || 0).toLocaleString()}
          </h2>
          <span className="text-[11px] text-emerald-700 mt-1 block font-bold">Ready for cashout</span>
        </div>

        {/* Daily Profit Rate */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-teal-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Daily Return</span>
            <Zap className="w-4 h-4 text-teal-600 shrink-0" />
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-teal-700 leading-tight">
            Rs. {totalDailyProfit} <span className="text-xs text-slate-500 font-normal">/ day</span>
          </h2>
          <span className="text-[11px] text-slate-600 mt-1 block font-medium">{activePlans.length} active plans</span>
        </div>

        {/* Total Earned */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-cyan-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Total Profits</span>
            <TrendingUp className="w-4 h-4 text-cyan-600 shrink-0" />
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
            Rs. {Number(user?.totalEarned || 0).toLocaleString()}
          </h2>
          <span className="text-[11px] text-slate-600 mt-1 block font-medium">Bonuses + Claims</span>
        </div>

        {/* 50% Referral Card */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-amber-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-tight">50% Invites</span>
            <Gift className="w-4 h-4 text-amber-600 shrink-0" />
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-amber-700 leading-tight">
            {user?.referrals?.length || user?._count?.referrals || 0} <span className="text-xs font-normal text-slate-500">Friends</span>
          </h2>
          <Link to="/referrals" className="text-[11px] text-amber-800 hover:underline mt-1 block font-bold">
            Invite for 50% cash →
          </Link>
        </div>
      </div>

      {/* Daily Profit Collection Action Card */}
      <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 24h Guaranteed Payout
          </div>
          <h3 className="text-sm sm:text-base font-black text-slate-900">
            Collect Today's Bonus (Rs. {totalDailyProfit})
          </h3>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Click every 24 hours to credit your active plan daily profits into your wallet.
          </p>

          {claimMessage.text && (
            <div
              className={`mt-2 p-2 rounded-xl text-xs flex items-center gap-1.5 ${
                claimMessage.type === 'success'
                  ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
              }`}
            >
              {claimMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{claimMessage.text}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleClaimDaily}
          disabled={claimLoading || activePlans.length === 0 || user?.isRestricted}
          className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
        >
          {claimLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Collecting...</span>
            </>
          ) : activePlans.length === 0 ? (
            <span>No Active Plan</span>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white" />
              <span>Collect Daily Rs. {totalDailyProfit}</span>
            </>
          )}
        </button>
      </div>

      {/* Investment Plans Section Directly on Dashboard */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Available Student Investment Plans</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Select any plan to start earning daily returns. Instant 50% referral commission for your inviter!
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : availablePlans.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
            No plans available at the moment. Please refresh.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {availablePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onPlanPurchased={fetchData} />
            ))}
          </div>
        )}
      </div>

      {/* Separate Dedicated Pages Grid */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-3 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Dedicated Services & Transaction History
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <Link
            to="/my-plans"
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-xs">My Active Plans</span>
            <span className="text-[11px] text-slate-500 font-medium">{activePlans.length} Active Plans</span>
          </Link>

          <Link
            to="/daily-bonus"
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-xs">Daily Bonus Room</span>
            <span className="text-[11px] text-slate-500 font-medium">24h Profit Collector</span>
          </Link>

          <Link
            to="/deposit-history"
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
              <History className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-xs">Deposit History</span>
            <span className="text-[11px] text-slate-500 font-medium">Track all slips</span>
          </Link>

          <Link
            to="/withdraw-history"
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-xs">Withdraw History</span>
            <span className="text-[11px] text-slate-500 font-medium">Cashout records</span>
          </Link>

          <Link
            to="/referral-history"
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Gift className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-xs">50% Bonus Log</span>
            <span className="text-[11px] text-slate-500 font-medium">Referral payouts</span>
          </Link>

          <Link
            to="/my-tickets"
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-xs">My Support Tickets</span>
            <span className="text-[11px] text-slate-500 font-medium">Admin responses</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
