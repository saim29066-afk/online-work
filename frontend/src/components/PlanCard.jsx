import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles, Zap, ArrowRight, AlertCircle, Loader2, Clock } from 'lucide-react';

const PlanCard = ({ plan, onPlanPurchased, userInvestments }) => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [requiresDeposit, setRequiresDeposit] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [claimLoading, setClaimLoading] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState('');

  const totalReturn = plan.dailyBonus * plan.durationDays;
  const roiPercent = Math.round((totalReturn / plan.price) * 100);
  const referralBonusAmount = (plan.price * (plan.referralBonusPercent / 100));

  // Determine if this plan is currently ACTIVE for the logged in user
  const activeInvestment = (() => {
    try {
      const planIdNum = Number(plan.id);
      const invs = userInvestments || (user?.investments) || (() => {
        const cached = localStorage.getItem('cached_investments');
        return cached ? JSON.parse(cached) : [];
      })();

      return invs.find((i) => (Number(i.planId) === planIdNum || Number(i.plan?.id) === planIdNum) && i.status === 'ACTIVE');
    } catch {
      return null;
    }
  })();

  const isPlanActive = Boolean(activeInvestment);
  const isClaimable = activeInvestment ? (activeInvestment.isClaimable !== false) : false;

  const handleBuyClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isPlanActive) {
      setErrorMsg(`Your "${plan.name}" is already ACTIVE! You can purchase it again after the current ${plan.durationDays}-day term completes.`);
      return;
    }
    setErrorMsg('');
    setRequiresDeposit(false);
    setSuccessMsg('');
    setShowModal(true);
  };

  const confirmPurchase = async () => {
    setLoading(true);
    setErrorMsg('');
    setRequiresDeposit(false);
    try {
      const res = await api.post('/plans/buy', { planId: plan.id });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        await refreshUser();
        if (onPlanPurchased) onPlanPurchased();
        setTimeout(() => {
          setShowModal(false);
        }, 1800);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Plan purchase failed. Please check your balance.');
      if (err.response?.data?.requiresDeposit) {
        setRequiresDeposit(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClaimIndividual = async (e) => {
    e.stopPropagation();
    if (!activeInvestment) return;
    setClaimLoading(true);
    setClaimFeedback('');

    try {
      const res = await api.post(`/plans/claim-daily/${activeInvestment.id}`);
      if (res.data.success) {
        setClaimFeedback(res.data.message || `Rs. ${plan.dailyBonus} Collected!`);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        await refreshUser();
        if (onPlanPurchased) onPlanPurchased();
      }
    } catch (err) {
      setClaimFeedback(err.response?.data?.message || 'Already collected today. Next after 24h.');
    } finally {
      setClaimLoading(false);
    }
  };

  const isPopular = plan.badge?.toLowerCase().includes('popular');

  return (
    <>
      <div
        className={`relative rounded-2xl p-3.5 sm:p-4 transition-all flex flex-col justify-between bg-white border ${
          isPlanActive
            ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md bg-emerald-50/20'
            : isPopular
            ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
            : 'border-slate-200 shadow-xs hover:border-slate-300'
        }`}
      >
        {isPlanActive ? (
          <div className="absolute -top-2.5 left-3.5">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-wider uppercase shadow-xs bg-emerald-600 text-white flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> ACTIVE ({activeInvestment.daysClaimed}/{activeInvestment.durationDays} Days)
            </span>
          </div>
        ) : plan.badge ? (
          <div className="absolute -top-2.5 left-3.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-wider uppercase shadow-xs ${
                isPopular
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-white border border-slate-700'
              }`}
            >
              {plan.badge}
            </span>
          </div>
        ) : null}

        <div>
          {/* Title & Price Header */}
          <div className="flex items-start justify-between gap-2 mt-1 mb-2.5">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">{plan.name}</h3>
              <span className="text-xs text-slate-500 font-medium">{plan.durationDays} Days Duration</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm sm:text-base font-black text-slate-900 block">
                Rs. {plan.price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Daily & Total Return Box (Clear & Bold) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-2.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[11px] font-medium leading-tight mb-0.5">Daily Profit:</span>
              <span className="font-black text-emerald-700 text-xs sm:text-sm flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                Rs. {plan.dailyBonus}/day
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px] font-medium leading-tight mb-0.5">Total Return:</span>
              <span className="font-black text-slate-900 text-xs sm:text-sm">
                Rs. {totalReturn.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 50% Referral Chip (Clear & Prominent) */}
          <div className="mb-2.5 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs">
            <span className="text-amber-900 font-bold flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> 50% Invite Bonus:
            </span>
            <span className="font-black text-amber-950 text-xs">Rs. {referralBonusAmount}</span>
          </div>

          {/* Feature Bullet */}
          <div className="space-y-1 mb-3">
            {(Array.isArray(plan.features) ? plan.features.slice(0, 3) : []).map((feat, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button: If Active, show Collect Option. Otherwise show Buy Plan */}
        {user?.isRestricted ? (
          <div className="w-full py-2.5 px-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs text-center flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Account Restricted</span>
          </div>
        ) : isPlanActive ? (
          <div className="space-y-1.5">
            {claimFeedback && (
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold text-center">
                {claimFeedback}
              </div>
            )}
            {isClaimable ? (
              <button
                type="button"
                onClick={handleClaimIndividual}
                disabled={claimLoading}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all disabled:opacity-50"
              >
                {claimLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Collecting Rs. {plan.dailyBonus}...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white text-white" />
                    <span>⚡ Collect Rs. {plan.dailyBonus} Today</span>
                  </>
                )}
              </button>
            ) : (
              <div className="w-full py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Collected Today (Next in 24h)</span>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleBuyClick}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98 ${
              plan.price === 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                : isPopular
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <span>{plan.price === 0 ? 'Activate Free (Rs. 0)' : 'Buy Plan'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Confirmation & Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-4 shadow-xl relative text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-0.5">
              {plan.price === 0 ? 'Activate Free Starter Plan' : 'Activate Investment Plan'}
            </h3>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Confirm activation for <span className="text-emerald-700 font-bold">{plan.name}</span>.
            </p>

            <div className="bg-slate-50 rounded-lg p-2.5 space-y-1 mb-2.5 border border-slate-200 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Plan Cost:</span>
                <span className="font-bold text-slate-900">
                  {plan.price === 0 ? 'FREE (Rs. 0)' : `Rs. ${plan.price.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Daily Profit:</span>
                <span className="font-bold text-emerald-700">Rs. {plan.dailyBonus}/day</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Duration:</span>
                <span className="font-bold text-slate-900">{plan.durationDays} Days</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Return:</span>
                <span className="font-bold text-slate-900">Rs. {totalReturn.toLocaleString()}</span>
              </div>
              <div className="pt-1 border-t border-slate-200 flex justify-between">
                <span className="text-slate-600">Your Wallet Balance:</span>
                <span className="font-bold text-emerald-700">
                  Rs. {Number(user?.balance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2 mb-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-start gap-1.5 font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {requiresDeposit && (
              <div className="p-2.5 mb-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[11px] space-y-1.5">
                <p className="font-bold">Deposit Required:</p>
                <p>Please submit a deposit slip first to activate paid plans.</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    navigate('/deposit');
                  }}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs"
                >
                  <span>Go to Deposit Page</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {successMsg && (
              <div className="p-2 mb-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-2 px-3 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPurchase}
                disabled={loading || (plan.price > 0 && (user?.balance || 0) < plan.price)}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Buy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlanCard;
