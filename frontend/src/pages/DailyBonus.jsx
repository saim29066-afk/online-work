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
  Wallet
} from 'lucide-react';

const DailyBonus = () => {
  const { user, refreshUser } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const fetchInvestments = async () => {
    try {
      const res = await api.get('/plans/my-investments');
      if (res.data.success) {
        setInvestments(res.data.investments);
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

  const handleClaim = async () => {
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

  const activePlans = investments.filter((i) => i.status === 'ACTIVE');
  const totalDailyProfit = activePlans.reduce((acc, curr) => acc + curr.dailyBonus, 0);

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
            Total Daily Profit Ready
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
            Rs. {totalDailyProfit.toLocaleString()}{' '}
            <span className="text-xs text-slate-500 font-medium">/ day</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Generated from {activePlans.length} active student {activePlans.length === 1 ? 'plan' : 'plans'}
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
              onClick={handleClaim}
              disabled={claimLoading || activePlans.length === 0}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none active:scale-98"
            >
              {claimLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Crediting Wallet...</span>
                </>
              ) : activePlans.length === 0 ? (
                <span>No Active Plan to Claim</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Claim Rs. {totalDailyProfit} Daily Profit</span>
                </>
              )}
            </button>
          )}
        </div>

        {activePlans.length === 0 && (
          <div className="pt-2">
            <Link
              to="/plans"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline inline-flex items-center gap-1"
            >
              <span>Activate a student plan to start earning daily</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Rules Notice */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-xs space-y-2">
        <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-600" /> How Daily Profit Works:
        </h3>
        <ul className="text-slate-600 space-y-1.5 pl-4 list-disc font-medium">
          <li>Daily bonuses can be claimed once every 24 hours.</li>
          <li>Claimed money is immediately added to your main cash balance.</li>
          <li>All profits can be withdrawn to EasyPaisa or JazzCash anytime.</li>
        </ul>
      </div>
    </div>
  );
};

export default DailyBonus;
