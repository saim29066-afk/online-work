import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowUpRight,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Lock,
  History,
  ArrowRight,
  Loader2,
  Users,
  Copy,
  Check,
  X,
  Sparkles,
  ShieldAlert,
  Zap
} from 'lucide-react';

import PageHeader from '../components/PageHeader';

const TIERS = [
  { amount: 500, label: 'Starter 1st Cashout', requiredInvites: 0, desc: '1-time trial cashout (0 Invites)' },
  { amount: 2000, label: 'Standard Tier', requiredInvites: 1, desc: 'Requires 1 active friend (1 invite per cashout)' },
  { amount: 4000, label: 'Silver Tier', requiredInvites: 1, desc: 'Requires 1 active friend (1 invite per cashout)' },
  { amount: 8000, label: 'Gold Tier', requiredInvites: 1, desc: 'Requires 1 active friend (1 invite per cashout)' },
  { amount: 16000, label: 'Diamond Tier', requiredInvites: 1, desc: 'Requires 1 active friend (1 invite per cashout)' }
];

const Withdraw = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [gateway, setGateway] = useState('EASYPAISA');
  const [amount, setAmount] = useState(500);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tierInfo, setTierInfo] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_withdraw_tier');
      return cached ? JSON.parse(cached) : {
        pastCount: 0,
        defaultSelectedAmount: 500,
        qualifiedReferralsCount: 0,
        hasPaidPlan: true
      };
    } catch {
      return {
        pastCount: 0,
        defaultSelectedAmount: 500,
        qualifiedReferralsCount: 0,
        hasPaidPlan: true
      };
    }
  });
  const [tierLoading, setTierLoading] = useState(() => {
    return !localStorage.getItem('cached_withdraw_tier');
  });
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [inviteModal, setInviteModal] = useState({ open: false, message: '' });
  const [planRequiredModal, setPlanRequiredModal] = useState({ open: false, message: '' });
  const [successModal, setSuccessModal] = useState({
    open: false,
    amount: 0,
    gateway: '',
    accountNumber: '',
    accountTitle: '',
    message: ''
  });

  const currentBalance = user?.balance || 0;
  const referralCode = user?.referralCode || '';
  const inviteLink = `${window.location.origin}/register?ref=${referralCode}`;

  const fetchTierInfo = async () => {
    try {
      const res = await api.get('/transactions/withdraw-tier');
      if (res.data.success) {
        setTierInfo(res.data);
        try {
          localStorage.setItem('cached_withdraw_tier', JSON.stringify(res.data));
        } catch {}
        if (res.data.pastCount === 0) {
          setAmount(500);
        } else {
          setAmount((prev) => (prev === 500 ? 2000 : prev));
        }
      }
    } catch (err) {
      console.error('Failed to fetch withdrawal tier:', err);
    } finally {
      setTierLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    fetchTierInfo();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAccountNumberChange = (e) => {
    // Only numbers and strictly max 11 digits
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    setAccountNumber(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ text: '', type: '' });

    if (!amount || !accountNumber || !accountTitle) {
      setFeedback({ text: 'Please fill in all withdrawal fields.', type: 'error' });
      return;
    }

    const numAmount = parseInt(amount, 10);

    // Check if user has purchased at least 1 plan before cashout
    if (!tierInfo.hasPaidPlan) {
      setPlanRequiredModal({
        open: true,
        message: 'Please activate at least 1 investment plan (Level 1 Bronze or higher) before requesting a withdrawal.'
      });
      return;
    }

    if (tierInfo.pastCount === 0 && numAmount !== 500) {
      setFeedback({
        text: 'Please complete your 1st starter cashout of Rs. 500 first. Higher amounts will unlock afterwards.',
        type: 'error'
      });
      return;
    }

    if (tierInfo.pastCount >= 1 && numAmount === 500) {
      setFeedback({
        text: 'The Rs. 500 starter tier was a 1-time trial and is permanently closed. Please select Rs. 2,000 or higher.',
        type: 'error'
      });
      return;
    }

    const cleanNumber = accountNumber.trim().replace(/\D/g, '');
    if (cleanNumber.length !== 11 || !cleanNumber.startsWith('03')) {
      setFeedback({
        text: 'Account number must be a valid 11-digit mobile number (e.g. 03XXXXXXXXX).',
        type: 'error'
      });
      return;
    }

    if (currentBalance < numAmount) {
      setFeedback({
        text: `Insufficient wallet balance! You have Rs. ${Number(currentBalance).toLocaleString()}, but selected cashout requires Rs. ${numAmount.toLocaleString()}.`,
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/transactions/withdraw', {
        gateway,
        amount: numAmount,
        accountNumber: cleanNumber,
        accountTitle: accountTitle.trim()
      });

      if (res.data.success) {
        setSuccessModal({
          open: true,
          amount: numAmount,
          gateway,
          accountNumber: cleanNumber,
          accountTitle: accountTitle.trim(),
          message: res.data.message || 'Withdrawal request submitted successfully!'
        });
        setAccountNumber('');
        setAccountTitle('');
        await refreshUser();
        await fetchTierInfo();
      }
    } catch (err) {
      const errorData = err.response?.data;
      const errorMsg = errorData?.message || 'Withdrawal request failed. Please try again.';

      if (errorData?.requiresPaidPlan) {
        setPlanRequiredModal({
          open: true,
          message: errorMsg
        });
      } else if (errorData?.requiresInvite) {
        setInviteModal({
          open: true,
          message: errorMsg
        });
      } else {
        setFeedback({
          text: errorMsg,
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-3.5 bg-white">
      {/* Mobile-Native Back Button Header */}
      <PageHeader
        title="Withdraw Earnings"
        subtitle="Transfer profit and referral bonuses to mobile wallet"
        backTo="/dashboard"
        rightAction={
          <Link
            to="/withdraw-history"
            className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <History className="w-3.5 h-3.5" /> History
          </Link>
        }
      />

      {/* Available Balance Card */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
            Available Wallet Balance
          </span>
          <div className="text-lg sm:text-2xl font-black text-emerald-700 mt-0.5">
            Rs. {Number(currentBalance).toLocaleString()}
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            • Active Qualified Referrals: <strong className="text-slate-900 font-bold">{tierInfo.qualifiedReferralsCount} Friends</strong>
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-emerald-200 space-y-0.5 shrink-0">
          <p className="font-bold text-slate-900">⚡ Fast Processing</p>
          <p>Direct transfer via EasyPaisa / JazzCash in 15-30 mins.</p>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="glass-card p-3.5 sm:p-5 rounded-xl border border-slate-200 space-y-3.5 shadow-2xs bg-white">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Select Cashout Amount</h3>

        {feedback.text && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start justify-between gap-2.5 font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950 shadow-xs'
                : 'bg-rose-50 border-2 border-rose-300 text-rose-950 shadow-xs'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{feedback.text}</p>
                {feedback.type === 'success' && (
                  <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                    Your cashout request is submitted and under verification. Funds will be sent to your account shortly.
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFeedback({ text: '', type: '' })}
              className="text-slate-400 hover:text-slate-700 p-0.5 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Tiers Visual Grid */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 text-[11px]">
              Available Cashout Tiers <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(tierInfo.tiers && tierInfo.tiers.length > 0 ? tierInfo.tiers : TIERS).map((tier) => {
                const isSelected = amount === tier.amount;
                const isFirstStage = tierInfo.pastCount === 0;
                const is500Closed = tier.amount === 500 && tierInfo.pastCount >= 1;
                const isHigherLockedBefore500 = isFirstStage && tier.amount > 500;
                const hasEnoughInvites = tierInfo.qualifiedReferralsCount >= tier.requiredInvites;
                const isDisabled = is500Closed || isHigherLockedBefore500;

                let badgeText = 'AVAILABLE';
                let badgeClass = 'bg-emerald-600 text-white';

                if (is500Closed) {
                  badgeText = 'CLOSED';
                  badgeClass = 'bg-slate-200 text-slate-600';
                } else if (isHigherLockedBefore500) {
                  badgeText = 'LOCKED';
                  badgeClass = 'bg-slate-200 text-slate-500';
                } else if (tier.requiredInvites > 0 && !hasEnoughInvites) {
                  const needed = tier.requiredInvites - tierInfo.qualifiedReferralsCount;
                  badgeText = `NEED ${needed} FRIEND${needed > 1 ? 'S' : ''}`;
                  badgeClass = 'bg-amber-100 text-amber-800 border border-amber-300';
                } else if (isSelected) {
                  badgeText = 'SELECTED';
                  badgeClass = 'bg-emerald-600 text-white';
                }

                return (
                  <button
                    key={tier.amount}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setAmount(tier.amount)}
                    className={`p-2.5 rounded-xl text-left border transition-all relative ${
                      isSelected && !isDisabled
                        ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                        : isDisabled
                        ? 'bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 gap-1">
                      <span className="text-[9.5px] font-bold text-slate-600 uppercase truncate">
                        {tier.label}
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${badgeClass}`}>
                        {badgeText}
                      </span>
                    </div>

                    <div className="text-sm sm:text-base font-black text-slate-900">
                      Rs. {tier.amount.toLocaleString()}
                    </div>

                    <p className="text-[9px] text-slate-500 mt-1 leading-tight">
                      {tier.desc}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-[10px] text-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>1 Invite Per Cashout</strong>: Har 2,000, 4,000, 8,000 aur 16,000 cashout ke baad 1 active friend invite karna zaroori hai.
              </span>
            </div>
          </div>

          {/* Gateway Selector */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Select Receiving Gateway <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGateway('EASYPAISA')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  gateway === 'EASYPAISA'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>EasyPaisa</span>
              </button>
              <button
                type="button"
                onClick={() => setGateway('JAZZCASH')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  gateway === 'JAZZCASH'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>JazzCash</span>
              </button>
            </div>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                {gateway} Mobile Number (Strictly 11 Digits) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={11}
                placeholder="03XXXXXXXXX (11 digits)"
                value={accountNumber}
                onChange={handleAccountNumberChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Account Title (Account Holder Name) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Account Title / Full Name"
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          {user?.isRestricted ? (
            <div className="w-full py-3 px-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold text-xs text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Account Restricted: Cashouts are frozen by Administration</span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 mt-1 rounded-xl text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Cashout Request...</span>
                </>
              ) : (
                <span>Request Rs. {amount.toLocaleString()} Cashout</span>
              )}
            </button>
          )}
        </form>
      </div>

      {/* Plan Required Modal Popup when user clicks withdraw without paid plan */}
      {planRequiredModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative text-xs space-y-4">
            <button
              onClick={() => setPlanRequiredModal({ open: false, message: '' })}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Investment Plan Required</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {planRequiredModal.message || 'Please activate at least 1 investment plan (Level 1 Bronze or higher) before requesting a withdrawal.'}
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPlanRequiredModal({ open: false, message: '' })}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Close
              </button>
              <Link
                to="/plans"
                onClick={() => setPlanRequiredModal({ open: false, message: '' })}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Browse & Activate Plan</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Invite Friend Modal Popup when withdrawal is locked */}
      {inviteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative text-xs space-y-4">
            <button
              onClick={() => setInviteModal({ open: false, message: '' })}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Withdrawal Locked</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {inviteModal.message}
              </p>
            </div>

            {/* Referral Link & Copy Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">Your Referral Link:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors shrink-0 shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[10px] text-amber-800 pt-0.5">
                💡 Tip: Share this link with your friends to earn instant cash commissions on their activated plans!
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInviteModal({ open: false, message: '' })}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
              >
                Close
              </button>
              <Link
                to="/referrals"
                onClick={() => setInviteModal({ open: false, message: '' })}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center transition-colors shadow-xs"
              >
                Go to Invite Page
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Request Done / Success Modal Popup */}
      {successModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-2 border-emerald-400 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-xs space-y-4">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-md animate-bounce">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Withdrawal Request Submitted!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {successModal.message || 'Your cashout request has been submitted to administration. Payout will be transferred to your account within 15-30 minutes.'}
              </p>
            </div>

            {/* Transaction Receipt Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Requested Amount:</span>
                <span className="text-base font-black text-emerald-700">Rs. {Number(successModal.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Receiving Wallet:</span>
                <span className="font-bold text-slate-800">{successModal.gateway}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Account Number:</span>
                <span className="font-mono font-bold text-slate-900">{successModal.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Account Title:</span>
                <span className="font-bold text-slate-900">{successModal.accountTitle}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-2">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] uppercase border border-amber-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  Pending Review
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSuccessModal({ open: false, amount: 0, gateway: '', accountNumber: '', accountTitle: '', message: '' });
                  navigate('/withdraw-history');
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm text-center transition-all shadow-md flex items-center justify-center gap-2"
              >
                <History className="w-4 h-4" />
                <span>View Withdrawal History & Status</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuccessModal({ open: false, amount: 0, gateway: '', accountNumber: '', accountTitle: '', message: '' });
                  navigate('/dashboard');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdraw;
