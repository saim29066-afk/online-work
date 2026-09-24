import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import {
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  XCircle,
  PlusCircle,
  Loader2
} from 'lucide-react';

const DepositHistory = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const res = await api.get('/transactions/my-deposits');
        if (res.data.success) {
          setDeposits(res.data.deposits);
        }
      } catch (err) {
        console.error('Failed to load deposits:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeposits();
  }, []);

  const totalApproved = deposits
    .filter((d) => d.status === 'APPROVED')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4">
      {/* Top Back Navigation */}
      <PageHeader
        title="Deposit History"
        subtitle="Track submitted EasyPaisa & JazzCash slips and wallet credit status"
        backTo="/dashboard"
        rightAction={
          <Link
            to="/deposit"
            className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Deposit</span>
          </Link>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[9px] text-slate-500 font-bold uppercase block">Total Slips</span>
          <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block">{deposits.length}</span>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[9px] text-slate-500 font-bold uppercase block">Approved</span>
          <span className="text-sm sm:text-base font-bold text-emerald-700 mt-0.5 block">
            {deposits.filter((d) => d.status === 'APPROVED').length}
          </span>
        </div>
        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[9px] text-emerald-800 font-bold uppercase block">Total Credited</span>
          <span className="text-sm sm:text-base font-bold text-emerald-700 mt-0.5 block">
            Rs. {totalApproved.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Vertical Deposit Cards (No horizontal scroll) */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-xs flex items-center justify-center gap-2 shadow-2xs">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading deposit history...</span>
          </div>
        ) : deposits.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs font-medium shadow-2xs">
            No deposits found. Click "New Deposit" to add funds.
          </div>
        ) : (
          deposits.map((dep) => {
            const dateStr = new Date(dep.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
            const timeStr = new Date(dep.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={dep.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs hover:border-slate-300 transition-all"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        dep.gateway === 'EASYPAISA'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : dep.gateway === 'JAZZ_CASH' || dep.gateway === 'JAZZCASH'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-orange-100 text-orange-900 border border-orange-300'
                      }`}
                    >
                      {dep.gateway}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {dateStr} at {timeStr}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      dep.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : dep.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {dep.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {dep.status === 'PENDING' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                    {dep.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                    {dep.status}
                  </span>
                </div>

                {/* Card Main Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Deposit Amount</span>
                    <span className="text-base sm:text-lg font-black text-slate-900 mt-0.5 block">
                      Rs. {Number(dep.amount).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Transaction ID (TID)</span>
                    <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 mt-0.5 inline-block">
                      {dep.transactionId}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Sender Details</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{dep.senderName}</p>
                    <p className="text-[11px] font-mono text-slate-600">{dep.senderNumber}</p>
                  </div>
                </div>

                {/* Status Message & Reason Banner */}
                {dep.status === 'APPROVED' && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Deposit Approved! Rs. {Number(dep.amount).toLocaleString()} has been credited to your wallet on{' '}
                      <strong>{dateStr} ({timeStr})</strong>.
                    </span>
                  </div>
                )}

                {dep.status === 'REJECTED' && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p>
                        Deposit Rejected on <strong>{dateStr} ({timeStr})</strong>.
                      </p>
                      <p className="text-rose-800 text-[11px] mt-0.5 font-bold">
                        Reason: {dep.adminNote || 'Invalid Transaction ID / Slip Verification Failed'}
                      </p>
                    </div>
                  </div>
                )}

                {dep.status === 'PENDING' && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Deposit Under Review: Submitted on <strong>{dateStr} ({timeStr})</strong>. Admin will verify and credit your balance shortly.
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

export default DepositHistory;
