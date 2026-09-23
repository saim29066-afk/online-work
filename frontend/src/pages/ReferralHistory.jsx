import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import {
  Users,
  Gift,
  Sparkles,
  Share2,
  Loader2
} from 'lucide-react';

const ReferralHistory = () => {
  const [data, setData] = useState({
    referrals: [],
    earningsHistory: [],
    totalReferrals: 0,
    totalReferralCommission: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const res = await api.get('/referrals');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load referral data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReferrals();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4">
      {/* Top Back Navigation */}
      <PageHeader
        title="50% Bonus & Team Ledger"
        subtitle="Complete log of invited student friends and 50% cash commissions"
        backTo="/dashboard"
        rightAction={
          <Link
            to="/referrals"
            className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Invite Page</span>
          </Link>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Invited</span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">{data.totalReferrals}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Active Investors</span>
          <span className="text-xl font-black text-emerald-700 mt-0.5 block">
            {data.referrals.filter((r) => r.investments && r.investments.length > 0).length}
          </span>
        </div>
        <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] text-emerald-800 font-bold uppercase block">50% Bonus Earned</span>
          <span className="text-xl font-black text-emerald-700 mt-0.5 block">
            Rs. {Number(data.totalReferralCommission || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* 50% Bonus Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Instant Commission Payouts (50% Per Activated Plan)</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-bold">
            {data.earningsHistory.length} Transactions
          </span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span>Loading referral logs...</span>
          </div>
        ) : data.earningsHistory.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-medium">
            No referral commissions recorded yet. When an invited friend buys a plan, your 50% bonus appears here!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Invited Student</th>
                  <th className="py-3 px-3.5">Plan Name</th>
                  <th className="py-3 px-3.5">Plan Price</th>
                  <th className="py-3 px-3.5 text-right">Instant Commission (50%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.earningsHistory.map((e) => (
                  <tr key={e.id} className="text-slate-700 hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 text-slate-500 text-[11px]">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-900">
                      {e.referredUser?.name || 'Student'}
                    </td>
                    <td className="py-3 px-3.5 text-slate-800 font-semibold">{e.planName}</td>
                    <td className="py-3 px-3.5 text-slate-600">Rs. {e.planPrice?.toLocaleString()}</td>
                    <td className="py-3 px-3.5 text-right font-black text-emerald-700 text-sm">
                      +Rs. {e.amount?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registered Friends List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 bg-slate-50">
          <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Registered Friends Directory</span>
          </h3>
        </div>

        {data.referrals.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-medium">
            No registered members under your link yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-3.5">Student Name</th>
                  <th className="py-3 px-3.5">Mobile</th>
                  <th className="py-3 px-3.5">Joined Date</th>
                  <th className="py-3 px-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.referrals.map((r) => {
                  const hasPlan = r.investments && r.investments.length > 0;
                  return (
                    <tr key={r.id} className="text-slate-700 hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-slate-900">{r.name}</td>
                      <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px]">
                        {r.phone ? r.phone.slice(0, 4) + '****' + r.phone.slice(-3) : 'N/A'}
                      </td>
                      <td className="py-3 px-3.5 text-slate-500 text-[11px]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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

export default ReferralHistory;
