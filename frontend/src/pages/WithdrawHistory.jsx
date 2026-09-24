import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
  PlusCircle,
  Loader2
} from 'lucide-react';

const WithdrawHistory = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const res = await api.get('/transactions/my-withdrawals');
        if (res.data.success) {
          setWithdrawals(res.data.withdrawals);
        }
      } catch (err) {
        console.error('Failed to load withdrawals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWithdrawals();
  }, []);

  const totalPaid = withdrawals
    .filter((w) => w.status === 'APPROVED')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4">
      {/* Top Back Navigation */}
      <PageHeader
        title="Withdraw History"
        subtitle="Track EasyPaisa & JazzCash payout transfers sent by admin"
        backTo="/dashboard"
        rightAction={
          <Link
            to="/withdraw"
            className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Cashout</span>
          </Link>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[9px] text-slate-500 font-bold uppercase block">Total Requests</span>
          <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block">{withdrawals.length}</span>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[9px] text-slate-500 font-bold uppercase block">Completed</span>
          <span className="text-sm sm:text-base font-bold text-emerald-700 mt-0.5 block">
            {withdrawals.filter((w) => w.status === 'APPROVED').length}
          </span>
        </div>
        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[9px] text-emerald-800 font-bold uppercase block">Total Received</span>
          <span className="text-sm sm:text-base font-bold text-emerald-700 mt-0.5 block">
            Rs. {totalPaid.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Vertical Withdrawal Cards (No horizontal scroll) */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-xs flex items-center justify-center gap-2 shadow-2xs">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading withdrawal history...</span>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs font-medium shadow-2xs">
            No withdrawal requests submitted yet.
          </div>
        ) : (
          withdrawals.map((w) => {
            const dateStr = new Date(w.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
            const timeStr = new Date(w.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={w.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs hover:border-slate-300 transition-all"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        w.gateway === 'EASYPAISA'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {w.gateway}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {dateStr} at {timeStr}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      w.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : w.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {w.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {w.status === 'PENDING' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                    {w.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                    {w.status === 'APPROVED' ? 'PAID' : w.status}
                  </span>
                </div>

                {/* Card Main Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Payout Amount</span>
                    <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block">
                      Rs. {Number(w.amount).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Receiving Account</span>
                    <p className="font-mono font-bold text-slate-900 text-xs mt-0.5">{w.accountNumber}</p>
                    <p className="text-[11px] font-bold text-slate-600">{w.accountTitle}</p>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Gateway</span>
                    <p className="font-bold text-slate-800 text-xs mt-0.5">{w.gateway} Wallet</p>
                  </div>
                </div>

                {/* Status Message & Reason Banner */}
                {w.status === 'APPROVED' && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p>
                        Payout Transferred! Rs. {Number(w.amount).toLocaleString()} successfully sent to your {w.gateway} account ({w.accountNumber}) on{' '}
                        <strong>{dateStr} ({timeStr})</strong>.
                      </p>
                      {w.adminNote && <p className="text-[11px] text-emerald-800 mt-0.5 font-bold">💬 Note: {w.adminNote}</p>}
                    </div>
                  </div>
                )}

                {w.status === 'REJECTED' && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p>
                        Withdrawal Request Rejected on <strong>{dateStr} ({timeStr})</strong>. Funds refunded back to wallet.
                      </p>
                      <p className="text-rose-800 text-[11px] mt-0.5 font-bold">
                        Reason: {w.adminNote || 'Invalid account details or transfer failed.'}
                      </p>
                    </div>
                  </div>
                )}

                {w.status === 'PENDING' && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Cashout Under Review: Request submitted on <strong>{dateStr} ({timeStr})</strong>. Admin will process transfer to your {w.gateway} account shortly.
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WithdrawHistory;
