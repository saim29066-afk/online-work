import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles, Zap, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const PlanCard = ({ plan, onPlanPurchased }) => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const totalReturn = plan.dailyBonus * plan.durationDays;
  const roiPercent = Math.round((totalReturn / plan.price) * 100);
  const referralBonusAmount = (plan.price * (plan.referralBonusPercent / 100));

  const handleBuyClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const confirmPurchase = async () => {
    setLoading(true);
    setErrorMsg('');
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
    } finally {
      setLoading(false);
    }
  };

  const isPopular = plan.badge?.toLowerCase().includes('popular');

  return (
    <>
      <div
        className={`relative rounded-xl p-2.5 sm:p-3 transition-all flex flex-col justify-between bg-white border ${
          isPopular
            ? 'border-emerald-400 shadow-xs ring-1 ring-emerald-400/20'
            : 'border-slate-200 shadow-2xs hover:border-slate-300'
        }`}
      >
        {plan.badge && (
          <div className="absolute -top-2 left-2.5">
            <span
              className={`px-1.5 py-0.2 rounded-full text-[7.5px] sm:text-[8px] font-bold tracking-wider uppercase shadow-2xs ${
                isPopular
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {plan.badge}
            </span>
          </div>
        )}

        <div>
          {/* Title & Price Header */}
          <div className="flex items-start justify-between gap-1.5 mt-0.5 mb-1.5">
            <div>
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-tight">{plan.name}</h3>
              <span className="text-[9px] text-slate-500">{plan.durationDays} Days Duration</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs sm:text-[13px] font-black text-slate-900 block">
                Rs. {plan.price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Daily & Total Return Box (Compact) */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-lg p-1.5 mb-1.5 flex items-center justify-between text-[9.5px]">
            <div>
              <span className="text-slate-500 block text-[8.5px] leading-tight">Daily Profit:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                Rs. {plan.dailyBonus}/day
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[8.5px] leading-tight">Total Return:</span>
              <span className="font-bold text-slate-800">
                Rs. {totalReturn.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 50% Referral Chip (Compact) */}
          <div className="mb-1.5 bg-amber-50/80 border border-amber-200/70 rounded-md px-1.5 py-0.5 flex items-center justify-between text-[9px]">
            <span className="text-amber-800 font-semibold flex items-center gap-0.5 text-[8.5px]">
              <Sparkles className="w-2.5 h-2.5 text-amber-600" /> 50% Invite Bonus:
            </span>
            <span className="font-bold text-amber-900 text-[9px]">Rs. {referralBonusAmount}</span>
          </div>

          {/* Compact Feature Bullet */}
          <div className="space-y-0.5 mb-2">
            {(Array.isArray(plan.features) ? plan.features.slice(0, 2) : []).map((feat, idx) => (
              <div key={idx} className="flex items-center gap-1 text-[9px] text-slate-600">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {user?.isRestricted ? (
          <div className="w-full py-1.5 px-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[9px] text-center flex items-center justify-center gap-1">
            <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
            <span>Account Restricted</span>
          </div>
        ) : (
          <button
            onClick={handleBuyClick}
            className={`w-full py-1.5 px-2 rounded-lg font-bold text-[10.5px] sm:text-[11px] transition-all flex items-center justify-center gap-1 shadow-xs active:scale-98 ${
              plan.price === 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                : isPopular
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <span>{plan.price === 0 ? 'Activate Free (Rs. 0)' : 'Buy Plan'}</span>
            <ArrowRight className="w-2.5 h-2.5" />
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
              <div className="p-2 mb-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p>{errorMsg}</p>
                  {(user?.balance || 0) < plan.price && (
                    <button
                      onClick={() => navigate('/deposit')}
                      className="mt-1 text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
                    >
                      Deposit Funds via EasyPaisa / JazzCash <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {successMsg && (
              <div className="p-2 mb-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="flex gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPurchase}
                disabled={loading || !!successMsg}
                className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlanCard;
