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
  ArrowRight,
  X
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
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMessage, setClaimMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      const [plansRes, invRes, depRes, withRes] = await Promise.allSettled([
        api.get('/plans'),
        api.get('/plans/my-investments'),
        api.get('/transactions/my-deposits'),
        api.get('/transactions/my-withdrawals')
      ]);

      if (plansRes.status === 'fulfilled' && plansRes.value.data.success) {
        setAvailablePlans(plansRes.value.data.plans);
        localStorage.setItem('cached_plans', JSON.stringify(plansRes.value.data.plans));
      }

      if (invRes.status === 'fulfilled' && invRes.value.data.success) {
        setInvestments(invRes.value.data.investments);
        localStorage.setItem('cached_investments', JSON.stringify(invRes.value.data.investments));
      }

      // Collect recent processed transactions for screen notification (Only UNSEEN items)
      let seenAlertIds = [];
      try {
        seenAlertIds = JSON.parse(localStorage.getItem('seen_transaction_alerts') || '[]');
      } catch {
        seenAlertIds = [];
      }

      const unseenAlerts = [];
      if (depRes.status === 'fulfilled' && depRes.value.data.success) {
        const recentDeps = (depRes.value.data.deposits || []).slice(0, 3);
        recentDeps.forEach((d) => {
          if ((d.status === 'APPROVED' || d.status === 'REJECTED') && !seenAlertIds.includes(d.id)) {
            unseenAlerts.push({
              type: 'DEPOSIT',
              id: d.id,
              status: d.status,
              amount: d.amount,
              gateway: d.gateway,
              date: d.createdAt,
              note: d.adminNote
            });
          }
        });
      }

      if (withRes.status === 'fulfilled' && withRes.value.data.success) {
        const recentWiths = (withRes.value.data.withdrawals || []).slice(0, 3);
        recentWiths.forEach((w) => {
          if ((w.status === 'APPROVED' || w.status === 'REJECTED') && !seenAlertIds.includes(w.id)) {
            unseenAlerts.push({
              type: 'WITHDRAWAL',
              id: w.id,
              status: w.status,
              amount: w.amount,
              gateway: w.gateway,
              date: w.createdAt,
              note: w.adminNote,
              accountNumber: w.accountNumber
            });
          }
        });
      }

      unseenAlerts.sort((a, b) => new Date(b.date) - new Date(a.date));
      const latestUnseen = unseenAlerts.slice(0, 1); // Only show the single latest processed notification
      setRecentAlerts(latestUnseen);

      if (latestUnseen.length > 0) {
        // Mark as seen permanently in localStorage so it never repeats across logouts / reloads
        try {
          const updatedSeen = [...seenAlertIds, ...latestUnseen.map((a) => a.id)];
          localStorage.setItem('seen_transaction_alerts', JSON.stringify(updatedSeen.slice(-50)));
        } catch {}
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

  // Automatically dismiss the popup notification after 5 seconds
  useEffect(() => {
    if (recentAlerts.length > 0) {
      const timer = setTimeout(() => {
        setRecentAlerts([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [recentAlerts]);

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
  const totalDailyRate = activePlans.reduce((acc, curr) => acc + curr.dailyBonus, 0);

  // Helper to determine if an investment is eligible to be collected right now
  const isClaimable = (inv) => {
    if (inv.status !== 'ACTIVE') return false;
    if (inv.daysClaimed >= inv.durationDays) return false;
    if (inv.isClaimable !== undefined) return inv.isClaimable;
    if (!inv.lastClaimedAt) return true;
    const diffHours = (Date.now() - new Date(inv.lastClaimedAt).getTime()) / (1000 * 60 * 60);
    return diffHours >= 24;
  };

  const claimablePlans = activePlans.filter(isClaimable);
  const claimableAmount = claimablePlans.reduce((acc, curr) => acc + curr.dailyBonus, 0);
  const alreadyClaimedCount = activePlans.length - claimablePlans.length;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-5 space-y-3.5 bg-white">
      {/* Live Transaction Notifications (Approved / Rejected Status with Time & Reason) */}
      {recentAlerts.length > 0 && (
        <div className="space-y-2">
          {recentAlerts.map((alt) => {
            const dateStr = new Date(alt.date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
            const timeStr = new Date(alt.date).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });

            if (alt.status === 'APPROVED') {
              return (
                <div
                  key={alt.id}
                  className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-emerald-900 text-xs">
                        {alt.type === 'DEPOSIT'
                          ? `✅ Deposit Approved: Rs. ${Number(alt.amount).toLocaleString()} credited to your balance!`
                          : `✅ Withdrawal Paid: Rs. ${Number(alt.amount).toLocaleString()} sent to your ${alt.gateway} (${alt.accountNumber})!`}
                      </p>
                      <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                        Processed on <strong>{dateStr} ({timeStr})</strong> via {alt.gateway}
                      </p>
                      {alt.note && <p className="text-[10.5px] text-emerald-900 font-bold mt-0.5">💬 Note: {alt.note}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      to={alt.type === 'DEPOSIT' ? '/deposit-history' : '/withdraw-history'}
                      className="text-[10px] font-bold text-emerald-800 hover:underline bg-emerald-100 px-2 py-1 rounded-md"
                    >
                      View Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => setRecentAlerts([])}
                      className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg hover:bg-emerald-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            if (alt.status === 'REJECTED') {
              return (
                <div
                  key={alt.id}
                  className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 text-xs flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-rose-900 text-xs">
                        {alt.type === 'DEPOSIT'
                          ? `❌ Deposit Rejected: Rs. ${Number(alt.amount).toLocaleString()}`
                          : `❌ Withdrawal Rejected & Refunded: Rs. ${Number(alt.amount).toLocaleString()}`}
                      </p>
                      <p className="text-[11px] text-rose-800 font-semibold mt-0.5">
                        Rejected on <strong>{dateStr} ({timeStr})</strong>
                      </p>
                      <p className="text-[11px] text-rose-950 font-bold mt-0.5 bg-rose-100/80 px-2 py-0.5 rounded-md inline-block">
                        ⚠️ Reason: {alt.note || 'Verification failed. Please contact support.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      to={alt.type === 'DEPOSIT' ? '/deposit-history' : '/withdraw-history'}
                      className="text-[10px] font-bold text-rose-800 hover:underline bg-rose-100 px-2 py-1 rounded-md"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => setRecentAlerts([])}
                      className="text-rose-700 hover:text-rose-950 p-1 rounded-lg hover:bg-rose-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
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

      {/* 🌟 Ultra-Visible Daily Profit Collection Action Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border-2 shadow-md relative overflow-hidden transition-all ${
          claimableAmount > 0
            ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100'
            : activePlans.length > 0
            ? 'border-teal-300 bg-teal-50/70'
            : 'border-slate-200 bg-slate-50/80'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${
                claimableAmount > 0 ? 'bg-emerald-600 text-white' : 'bg-teal-600 text-white'
              }`}
            >
              <Zap className={`w-6 h-6 fill-white ${claimableAmount > 0 ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs ${
                    claimableAmount > 0
                      ? 'bg-emerald-600 text-white'
                      : 'bg-teal-700 text-white'
                  }`}
                >
                  {claimableAmount > 0 ? '⚡ Ready to Collect' : '✅ Collected for Today'}
                </span>
                <span className="text-[11px] font-bold text-slate-700 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full">
                  {activePlans.length} Active {activePlans.length === 1 ? 'Plan' : 'Plans'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {claimableAmount > 0 ? (
                  <>
                    Daily Profit Ready:{' '}
                    <span className="text-emerald-700">Rs. {claimableAmount.toLocaleString()}</span>
                  </>
                ) : activePlans.length > 0 ? (
                  <>
                    Today's Profit Claimed:{' '}
                    <span className="text-teal-800">Rs. {totalDailyRate.toLocaleString()} / Day</span>
                  </>
                ) : (
                  <>
                    Daily Bonus: <span className="text-slate-700">Rs. 0 / Day</span>
                  </>
                )}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {claimableAmount > 0
                  ? alreadyClaimedCount > 0
                    ? `Collect profit for ${claimablePlans.length} remaining plan (${alreadyClaimedCount} already collected earlier).`
                    : `Collect your daily profit for all ${claimablePlans.length} active plans into your wallet now!`
                  : activePlans.length > 0
                  ? 'All bonuses collected for today! Your next 24h profits will unlock tomorrow.'
                  : 'Activate any student plan below to start collecting daily profit!'}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            {claimableAmount > 0 ? (
              <button
                onClick={handleClaimDaily}
                disabled={claimLoading || user?.isRestricted}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {claimLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Collecting...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Collect Rs. {claimableAmount.toLocaleString()} Now</span>
                  </>
                )}
              </button>
            ) : activePlans.length > 0 ? (
              <div className="py-2.5 px-4 rounded-xl bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-teal-300">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Claimed for Today</span>
              </div>
            ) : (
              <a
                href="#student-plans"
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all text-center"
              >
                <Sparkles className="w-4 h-4" />
                <span>Activate Plan to Collect</span>
              </a>
            )}
          </div>
        </div>

        {claimMessage.text && (
          <div
            className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 font-bold ${
              claimMessage.type === 'success'
                ? 'bg-emerald-200/90 text-emerald-950 border border-emerald-400'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {claimMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            )}
            <span>{claimMessage.text}</span>
          </div>
        )}
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
            Rs. {totalDailyRate} <span className="text-xs text-slate-500 font-normal">/ day</span>
          </h2>
          <span className="text-[11px] text-slate-600 mt-1 block font-medium">
            {claimableAmount > 0 ? `⚡ Rs. ${claimableAmount} ready to collect` : `${activePlans.length} active plans`}
          </span>
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
              <PlanCard
                key={plan.id}
                plan={plan}
                onPlanPurchased={fetchData}
                userInvestments={investments}
              />
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
