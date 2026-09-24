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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading deposit history...</span>
          </div>
        ) : deposits.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-medium">
            No deposits found. Click "New Deposit" to add funds.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Gateway</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Sender Info</th>
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {deposits.map((dep) => (
                  <tr key={dep.id} className="text-slate-700 hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 text-slate-500 text-[11px]">
                      {new Date(dep.createdAt).toLocaleDateString()} <br />
                      <span className="text-[10px] text-slate-400">
                        {new Date(dep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          dep.gateway === 'EASYPAISA'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {dep.gateway}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-black text-slate-900 text-sm">
                      Rs. {dep.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5">
                      <p className="font-bold text-slate-900">{dep.senderName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{dep.senderNumber}</p>
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900 text-[11px]">
                      {dep.transactionId}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          dep.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : dep.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {dep.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                        {dep.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {dep.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                        {dep.status}
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

export default DepositHistory;
