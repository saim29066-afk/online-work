import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import PageHeader from '../components/PageHeader';
import {
  Zap,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  HelpCircle,
  TrendingUp,
  Wallet,
  AlertCircle
} from 'lucide-react';

const DailyBonus = () => {
  const { user, refreshUser } = useAuth();
  const [investments, setInvestments] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_investments');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('cached_investments');
  });
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimingId, setClaimingId] = useState(null);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const fetchInvestments = async () => {
    try {
      const res = await api.get('/plans/my-investments');
      if (res.data.success) {
        setInvestments(res.data.investments);
        try {
          localStorage.setItem('cached_investments', JSON.stringify(res.data.investments));
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load investments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
    refreshUser();
  }, []);

  const handleClaimAll = async () => {
    setClaimLoading(true);
    setFeedback({ text: '', type: '' });

    try {
      const res = await api.post('/plans/claim-daily');
      if (res.data.success) {
        setFeedback({ text: res.data.message, type: 'success' });
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 }
        });
        await refreshUser();
        await fetchInvestments();
      }
    } catch (err) {
      setFeedback({
        text: err.response?.data?.message || 'Daily profit claim failed. Please try again.',
        type: 'error'
      });
    } finally {
      setClaimLoading(false);
    }
  };

  const handleClaimIndividual = async (investmentId) => {
    setClaimingId(investmentId);
    setFeedback({ text: '', type: '' });

    try {
      const res = await api.post(`/plans/claim-daily/${investmentId}`);
      if (res.data.success) {
        setFeedback({ text: res.data.message || 'Daily profit collected successfully!', type: 'success' });
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        await refreshUser();
        await fetchInvestments();
      }
    } catch (err) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to collect daily profit. Please try again.',
        type: 'error'
      });
    } finally {
      setClaimingId(null);
    }
  };

  const activePlans = investments.filter((i) => i.status === 'ACTIVE');
  const claimablePlans = activePlans.filter((i) => i.isClaimable !== false);
  const totalDailyProfit = activePlans.reduce((acc, curr) => acc + curr.dailyBonus, 0);
  const claimableAmount = claimablePlans.reduce((acc, curr) => acc + curr.dailyBonus, 0);

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4">
      {/* Top Back Navigation */}
      <PageHeader
        title="Daily Bonus Room"
        subtitle="Collect daily 24-hour return profits directly to wallet"
        backTo="/dashboard"
      />

      {/* Main Claiming Card */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm text-center relative overflow-hidden space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
          <Zap className="w-7 h-7 fill-emerald-600 text-emerald-600" />
        </div>

        <div>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
            {claimableAmount > 0 ? 'Ready To Collect Today' : 'Total Daily Profit'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
            Rs. {(claimableAmount > 0 ? claimableAmount : totalDailyProfit).toLocaleString()}{' '}
            <span className="text-xs text-slate-500 font-medium">/ day</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Generated from {activePlans.length} active {activePlans.length === 1 ? 'plan' : 'plans'}
          </p>
        </div>

        {feedback.text && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center justify-center gap-2 max-w-md mx-auto ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border border-amber-200 text-amber-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.text}</span>
          </div>
        )}

        <div className="pt-2">
          {user?.isRestricted ? (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold max-w-md mx-auto flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Account Restricted: Daily bonus claims frozen</span>
            </div>
          ) : (
            <button
              onClick={handleClaimAll}
              disabled={claimLoading || activePlans.length === 0 || claimablePlans.length === 0}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none active:scale-98"
            >
              {claimLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Crediting Wallet...</span>
                </>
              ) : activePlans.length === 0 ? (
                <span>No Active Plan to Claim</span>
              ) : claimablePlans.length === 0 ? (
                <span>All Plans Claimed Today (Next in 24h)</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>⚡ Claim All (Rs. {claimableAmount})</span>
                </>
              )}
            </button>
          )}
        </div>

        {activePlans.length === 0 && (
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline inline-flex items-center gap-1"
            >
              <span>Activate a student plan to start earning daily</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Individual Active Plans Daily Collection Breakdown */}
      {activePlans.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Individual Plan Collection ({activePlans.length})
            </span>
            <span className="text-[11px] text-slate-500 font-normal">Collect one by one</span>
          </h3>

          <div className="space-y-2">
            {activePlans.map((inv) => {
              const isClaimable = inv.isClaimable !== false;
              const remainingDays = Math.max(0, inv.durationDays - inv.daysClaimed);

              return (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        ACTIVE
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{inv.plan?.name || 'Plan'}</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                      Day {inv.daysClaimed}/{inv.durationDays} • <span className="font-bold text-emerald-700">Rs. {inv.dailyBonus} / day</span>
                    </p>
                  </div>

                  <div className="shrink-0">
                    {isClaimable ? (
                      <button
                        onClick={() => handleClaimIndividual(inv.id)}
                        disabled={claimingId === inv.id}
                        className="w-full sm:w-auto py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs active:scale-98 disabled:opacity-50 transition-all"
                      >
                        {claimingId === inv.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Collecting...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 fill-white" />
                            <span>⚡ Collect Rs. {inv.dailyBonus}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Claimed Today</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rules Notice */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-xs space-y-2">
        <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-600" /> How Daily Profit Works:
        </h3>
        <ul className="text-slate-600 space-y-1.5 pl-4 list-disc font-medium">
          <li>Daily bonuses can be claimed once every 24 hours per active plan.</li>
          <li>Claimed money is immediately added to your main cash balance.</li>
          <li>You can collect each plan individually or claim all at once.</li>
          <li>All profits can be withdrawn to EasyPaisa or JazzCash anytime.</li>
        </ul>
      </div>
    </div>
  );
};

export default DailyBonus;
