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
  const [investments, setInvestments] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMessage, setClaimMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      const plansRes = await api.get('/plans');
      if (plansRes.data.success && Array.isArray(plansRes.data.plans)) {
        setAvailablePlans(plansRes.data.plans);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    }

    try {
      const invRes = await api.get('/plans/my-investments');
      if (invRes.data.success && Array.isArray(invRes.data.investments)) {
        setInvestments(invRes.data.investments);
      }
    } catch (err) {
      console.error('Failed to load investments:', err);
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
      <div className="glass-card p-3 sm:p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              🎓 Student Investor
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              🎁 Rs. 250 Free Bonus Credited
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500">
              Ref: <strong className="font-mono text-slate-800">{user?.referralCode}</strong>
            </span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">Welcome, {user?.name || 'Student'}! 👋</h1>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
            Your university investment wallet and daily earning center.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Link
            to="/deposit"
            className="flex-1 sm:flex-none py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-xs flex items-center justify-center gap-1 transition-colors"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Deposit
          </Link>
          <Link
            to="/withdraw"
            className="flex-1 sm:flex-none py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] border border-slate-300 flex items-center justify-center gap-1 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" /> Withdraw
          </Link>
        </div>
      </div>

      {/* Main KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {/* Balance Card */}
        <div className="glass-card p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-emerald-200/80">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-tight">Wallet Balance</span>
            <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
            Rs. {Number(user?.balance || 0).toLocaleString()}
          </h2>
          <span className="text-[8.5px] sm:text-[9.5px] text-emerald-600 mt-0.5 block font-medium">Ready for cashout</span>
        </div>

        {/* Daily Profit Rate */}
        <div className="glass-card p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-tight">Daily Return</span>
            <Zap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-teal-700 leading-tight">
            Rs. {totalDailyProfit} <span className="text-[9px] text-slate-500 font-normal">/ day</span>
          </h2>
          <span className="text-[8.5px] sm:text-[9.5px] text-slate-500 mt-0.5 block">{activePlans.length} active plans</span>
        </div>

        {/* Total Earned */}
        <div className="glass-card p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-tight">Total Profits</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
            Rs. {Number(user?.totalEarned || 0).toLocaleString()}
          </h2>
          <span className="text-[8.5px] sm:text-[9.5px] text-slate-500 mt-0.5 block">Bonuses + Claims</span>
        </div>

        {/* 50% Referral Card */}
        <div className="glass-card p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-amber-200/80">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] sm:text-[10px] font-semibold text-amber-800 uppercase tracking-tight">50% Invites</span>
            <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-amber-700 leading-tight">
            {user?.referrals?.length || user?._count?.referrals || 0} <span className="text-[9px] font-normal text-slate-500">Friends</span>
          </h2>
          <Link to="/referrals" className="text-[8.5px] sm:text-[9.5px] text-amber-700 hover:underline mt-0.5 block font-semibold">
            Invite for 50% cash →
          </Link>
        </div>
      </div>

      {/* Daily Profit Collection Action Card */}
      <div className="glass-card p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-emerald-200 bg-emerald-50/30 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-bold mb-0.5">
            <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> 24h Guaranteed Payout
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
            Collect Today's Bonus (Rs. {totalDailyProfit})
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
            Click every 24 hours to credit your active plan daily profits into your wallet.
          </p>

          {claimMessage.text && (
            <div
              className={`mt-1.5 p-1.5 rounded-lg text-xs flex items-center gap-1.5 ${
                claimMessage.type === 'success'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {claimMessage.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
              <span>{claimMessage.text}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleClaimDaily}
          disabled={claimLoading || activePlans.length === 0 || user?.isRestricted}
          className="w-full sm:w-auto py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50 shrink-0"
        >
          {claimLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Collecting...</span>
            </>
          ) : activePlans.length === 0 ? (
            <span>No Active Plan</span>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Collect Daily Rs. {totalDailyProfit}</span>
            </>
          )}
        </button>
      </div>

      {/* Investment Plans Section Directly on Dashboard */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Available Student Investment Plans</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Select any plan to start earning daily returns. Instant 50% referral commission for your inviter!
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          </div>
        ) : availablePlans.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
            No plans available at the moment. Please refresh.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {availablePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onPlanPurchased={fetchData} />
            ))}
          </div>
        )}
      </div>

      {/* Separate Dedicated Pages Grid */}
      <div className="glass-card p-4 rounded-xl space-y-2.5">
        <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
          Dedicated Services & Transaction Ledgers
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <Link
            to="/my-plans"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-1 transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800 text-[11px]">My Active Plans</span>
            <span className="text-[9px] text-slate-500">{activePlans.length} Active Plans</span>
          </Link>

          <Link
            to="/daily-bonus"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-1 transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800 text-[11px]">Daily Bonus Room</span>
            <span className="text-[9px] text-slate-500">24h Profit Collector</span>
          </Link>

          <Link
            to="/deposit-history"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-1 transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700">
              <History className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800 text-[11px]">Deposit Ledger</span>
            <span className="text-[9px] text-slate-500">Track all slips</span>
          </Link>

          <Link
            to="/withdraw-history"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-1 transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800 text-[11px]">Withdraw Ledger</span>
            <span className="text-[9px] text-slate-500">Cashout records</span>
          </Link>

          <Link
            to="/referral-history"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-1 transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Gift className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800 text-[11px]">50% Bonus Log</span>
            <span className="text-[9px] text-slate-500">Referral payouts</span>
          </Link>

          <Link
            to="/my-tickets"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-1 transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800 text-[11px]">My Support Tickets</span>
            <span className="text-[9px] text-slate-500">Admin responses</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
