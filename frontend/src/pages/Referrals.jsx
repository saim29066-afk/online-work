import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import {
  Users,
  Copy,
  Check,
  Share2,
  Sparkles,
  Gift,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';

const Referrals = () => {
  const { user } = useAuth();
  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_referral_data');
      return cached ? JSON.parse(cached) : {
        referralCode: user?.referralCode || '',
        totalReferrals: user?.referrals?.length || 0,
        activeReferrals: 0,
        totalReferralCommission: 0,
        referrals: [],
        earningsHistory: []
      };
    } catch {
      return {
        referralCode: user?.referralCode || '',
        totalReferrals: 0,
        activeReferrals: 0,
        totalReferralCommission: 0,
        referrals: [],
        earningsHistory: []
      };
    }
  });
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('cached_referral_data');
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const res = await api.get('/referrals');
        if (res.data.success) {
          setData(res.data.data);
          try {
            localStorage.setItem('cached_referral_data', JSON.stringify(res.data.data));
          } catch {}
        }
      } catch (err) {
        console.error('Failed to load referral data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReferrals();
  }, []);

  const referralCode = data.referralCode || user?.referralCode || 'STUDENT';
  const inviteLink = `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hello! Check out Student Invest Hub. Invest Rs. 1,000 and get Rs. 100 daily returns + fast EasyPaisa/JazzCash cashouts. Register using my invite link: ${inviteLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4">
      {/* Top Back Navigation */}
      <PageHeader
        title="Student Invite Center"
        subtitle="Invite friends and earn 50% instant cash bonus on all activated plans"
        backTo="/dashboard"
      />

      {/* Tiered Commission Rule Visual Box */}
      <div className="bg-gradient-to-r from-amber-500/10 via-white to-emerald-500/10 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold w-fit">
            <Gift className="w-3.5 h-3.5 text-amber-700" />
            <span>Tiered Referral Commission Program</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Next Reward: {data.nextBonusPercent || 50}% Commission
          </span>
        </div>

        {/* 5-Step Tier Ladder */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className={`p-2.5 rounded-xl border ${data.commissionCount === 0 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-black ring-2 ring-emerald-400' : 'bg-white border-slate-200 text-slate-700'}`}>
            <span className="text-[10px] block opacity-80">1st Referral</span>
            <span className="text-base font-black block">50%</span>
            <span className="text-[9px] block opacity-80">Starter Bonus</span>
          </div>
          <div className={`p-2.5 rounded-xl border ${data.commissionCount === 1 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-black ring-2 ring-emerald-400' : 'bg-white border-slate-200 text-slate-700'}`}>
            <span className="text-[10px] block opacity-80">2nd Referral</span>
            <span className="text-base font-black block">40%</span>
            <span className="text-[9px] block opacity-80">Silver Tier</span>
          </div>
          <div className={`p-2.5 rounded-xl border ${data.commissionCount === 2 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-black ring-2 ring-emerald-400' : 'bg-white border-slate-200 text-slate-700'}`}>
            <span className="text-[10px] block opacity-80">3rd Referral</span>
            <span className="text-base font-black block">30%</span>
            <span className="text-[9px] block opacity-80">Gold Tier</span>
          </div>
          <div className={`p-2.5 rounded-xl border ${data.commissionCount === 3 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-black ring-2 ring-emerald-400' : 'bg-white border-slate-200 text-slate-700'}`}>
            <span className="text-[10px] block opacity-80">4th Referral</span>
            <span className="text-base font-black block">20%</span>
            <span className="text-[9px] block opacity-80">Platinum Tier</span>
          </div>
          <div className={`col-span-2 sm:col-span-1 p-2.5 rounded-xl border ${data.commissionCount >= 4 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-black ring-2 ring-emerald-400' : 'bg-white border-slate-200 text-slate-700'}`}>
            <span className="text-[10px] block opacity-80">5th+ Unlimited</span>
            <span className="text-base font-black block">10%</span>
            <span className="text-[9px] block opacity-80">Lifetime Fixed</span>
          </div>
        </div>
      </div>

      {/* Shareable Link Box */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-black text-slate-900">Your Unique Referral Link</h3>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 truncate flex items-center select-all">
            {inviteLink}
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-2xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-2xs"
          >
            <Share2 className="w-4 h-4 text-slate-950" />
            <span>Share WhatsApp</span>
          </button>
        </div>

        <div className="pt-1 flex items-center gap-2 text-xs text-slate-600 font-medium">
          <span>Referral Code:</span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-900 font-mono font-bold">
            {referralCode}
          </span>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center">
          <span className="text-[11px] text-slate-500 font-bold block">Total Friends Invited</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {data.totalReferrals}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">
            Registered students
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center">
          <span className="text-[11px] text-slate-500 font-bold block">Active Plan Investors</span>
          <span className="text-2xl font-black text-teal-700 mt-1 block">
            {data.activeReferrals}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">
            Purchased a plan
          </span>
        </div>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-2xs text-center">
          <span className="text-[11px] text-emerald-800 font-bold block">Total Commission Earned</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            Rs. {Number(data.totalReferralCommission || 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-700 mt-0.5 block font-medium">
            Credited to wallet
          </span>
        </div>
      </div>

      {/* Invited Friends Table */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 mb-0.5">Invited Students Directory</h3>
        <p className="text-xs text-slate-500 mb-3">Friends who signed up using your link</p>

        {loading ? (
          <div className="text-center py-6 text-xs text-slate-500">Loading invited members...</div>
        ) : data.referrals.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-medium">
            No students registered with your link yet. Share your link to start earning!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-bold">
                  <th className="pb-2">Student Name</th>
                  <th className="pb-2">Referral Code</th>
                  <th className="pb-2">Joined Date</th>
                  <th className="pb-2 text-right">Plan Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.referrals.map((ref) => {
                  const hasPlan = ref.investments && ref.investments.length > 0;
                  return (
                    <tr key={ref.id} className="text-slate-700">
                      <td className="py-2.5 font-bold text-slate-900">{ref.name}</td>
                      <td className="py-2.5 text-slate-600 font-mono text-[11px] font-bold">
                        {ref.referralCode || 'STUDENT'}
                      </td>
                      <td className="py-2.5 text-slate-500 text-[11px]">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            hasPlan
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {hasPlan ? 'Active Investor' : 'Registered'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;
