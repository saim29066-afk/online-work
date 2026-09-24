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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading withdrawal history...</span>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-medium">
            No withdrawal requests submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Gateway</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Account Info</th>
                  <th className="py-2.5 px-3">Admin Confirmation</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="text-slate-700 hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 text-slate-500 text-[11px]">
                      {new Date(w.createdAt).toLocaleDateString()} <br />
                      <span className="text-[10px] text-slate-400">
                        {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          w.gateway === 'EASYPAISA'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {w.gateway}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-black text-slate-900 text-sm">
                      Rs. {w.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5">
                      <p className="font-bold text-slate-900">{w.accountTitle}</p>
                      <p className="text-[10px] text-slate-500 font-mono font-bold">{w.accountNumber}</p>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 text-[11px] max-w-[200px] truncate" title={w.adminNote}>
                      {w.adminNote ? `💬 ${w.adminNote}` : '-'}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          w.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : w.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {w.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                        {w.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {w.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                        {w.status === 'APPROVED' ? 'PAID' : w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawHistory;
