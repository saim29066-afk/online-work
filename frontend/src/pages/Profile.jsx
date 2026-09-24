import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import {
  User,
  Phone,
  Wallet,
  Gift,
  ShieldCheck,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  LogOut
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/register?ref=${user?.referralCode || 'STUDENT'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4">
      {/* Top Back Navigation */}
      <PageHeader
        title="Student Profile"
        subtitle="Manage account details, referral code, and transaction ledgers"
        backTo="/dashboard"
      />

      {/* Account Info Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-2xl flex items-center justify-center shrink-0 shadow-2xs">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-slate-900 truncate">{user?.name}</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase shrink-0">
              Verified Student
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono font-bold mt-0.5">{user?.phone}</p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">Wallet</span>
          <span className="text-lg sm:text-xl font-black text-emerald-700 block">
            Rs. {Number(user?.balance || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Referral Code Box */}
      <div className="bg-gradient-to-r from-amber-50 to-emerald-50 p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-amber-600" />
            <span>My 50% Referral Code</span>
          </span>
          <span className="font-mono font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-amber-300 text-xs shadow-2xs">
            {user?.referralCode}
          </span>
        </div>

        <p className="text-xs text-slate-600 font-medium">
          Share your invite link with fellow students to earn <strong className="text-emerald-700">50% cash bonus</strong> on any plan they activate!
        </p>

        <button
          onClick={handleCopy}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-98"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Invite Link'}</span>
        </button>
      </div>

      {/* Financial Lifetime Stats */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Lifetime Financial Overview
        </span>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-bold block">Deposited</span>
            <span className="text-xs font-black text-slate-900 block mt-0.5">
              Rs. {Number(user?.totalDeposited || 0).toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-bold block">Withdrawn</span>
            <span className="text-xs font-black text-slate-900 block mt-0.5">
              Rs. {Number(user?.totalWithdrawn || 0).toLocaleString()}
            </span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
            <span className="text-[10px] text-emerald-800 font-bold block">Profit Claimed</span>
            <span className="text-xs font-black text-emerald-700 block mt-0.5">
              Rs. {Number(user?.totalEarned || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Account Shortcuts */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Account History & Records</h3>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <Link
            to="/my-plans"
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors font-bold"
          >
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>My Active Plans</span>
          </Link>

          <Link
            to="/deposit-history"
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors font-bold"
          >
            <ArrowDownLeft className="w-5 h-5 text-teal-600" />
            <span>Deposit History</span>
          </Link>

          <Link
            to="/withdraw-history"
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors font-bold"
          >
            <ArrowUpRight className="w-5 h-5 text-rose-600" />
            <span>Withdraw History</span>
          </Link>

          <Link
            to="/my-tickets"
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 flex flex-col items-center text-center gap-1.5 transition-colors font-bold"
          >
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Support Tickets</span>
          </Link>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out from Account</span>
      </button>
    </div>
  );
};

export default Profile;
