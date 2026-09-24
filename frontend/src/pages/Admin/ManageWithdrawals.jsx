import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Check,
  X,
  Loader2,
  AlertCircle,
  Users,
  Send,
  Building2,
  Phone
} from 'lucide-react';

const ManageWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState(() => {
    try {
      const cached = sessionStorage.getItem('cached_admin_withdrawals');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('cached_admin_withdrawals');
    } catch {
      return true;
    }
  });
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });

  // Modal states
  const [approveModal, setApproveModal] = useState({ open: false, item: null, note: '' });
  const [rejectModal, setRejectModal] = useState({ open: false, item: null, note: '', refund: true });

  const fetchWithdrawals = async (isBackground = false) => {
    if (!isBackground && withdrawals.length === 0) setLoading(true);
    try {
      const res = await api.get('/admin/withdrawals');
      if (res.data.success) {
        setWithdrawals(res.data.withdrawals);
        try {
          sessionStorage.setItem('cached_admin_withdrawals', JSON.stringify(res.data.withdrawals));
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals(withdrawals.length > 0);
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const openApproveModal = (w) => {
    setApproveModal({
      open: true,
      item: w,
      note: `Rs. ${w.amount.toLocaleString()} successfully transferred to ${w.accountTitle}'s ${w.gateway} account (${w.accountNumber}).`
    });
  };

  const submitApprove = async () => {
    if (!approveModal.item) return;
    const { id } = approveModal.item;

    // ⚡ Optimistic Instant UI Update (0ms)
    const previousWithdrawals = [...withdrawals];
    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              status: 'APPROVED',
              adminNote: approveModal.note
            }
          : w
      )
    );
    setApproveModal({ open: false, item: null, note: '' });
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    setMessage({ text: 'Withdrawal approved successfully!', type: 'success' });

    try {
      const res = await api.post(`/admin/withdrawals/${id}/approve`, {
        note: approveModal.note
      });
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        fetchWithdrawals(true);
      } else {
        setWithdrawals(previousWithdrawals);
        setMessage({ text: res.data.message || 'Failed to approve withdrawal', type: 'error' });
      }
    } catch (err) {
      setWithdrawals(previousWithdrawals);
      setMessage({
        text: err.response?.data?.message || 'Failed to approve withdrawal',
        type: 'error'
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const openRejectModal = (w) => {
    setRejectModal({
      open: true,
      item: w,
      note: 'Invalid EasyPaisa/JazzCash account number or title mismatch.',
      refund: true
    });
  };

  const submitReject = async () => {
    if (!rejectModal.item) return;
    const { id } = rejectModal.item;

    // ⚡ Optimistic Instant UI Update (0ms)
    const previousWithdrawals = [...withdrawals];
    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              status: 'REJECTED',
              adminNote: rejectModal.note
            }
          : w
      )
    );
    setRejectModal({ open: false, item: null, note: '', refund: true });
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    setMessage({ text: 'Withdrawal rejected.', type: 'success' });

    try {
      const res = await api.post(`/admin/withdrawals/${id}/reject`, {
        note: rejectModal.note,
        refund: rejectModal.refund
      });
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        fetchWithdrawals(true);
      } else {
        setWithdrawals(previousWithdrawals);
        setMessage({ text: res.data.message || 'Failed to reject withdrawal', type: 'error' });
      }
    } catch (err) {
      setWithdrawals(previousWithdrawals);
      setMessage({
        text: err.response?.data?.message || 'Failed to reject withdrawal',
        type: 'error'
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesFilter = filter === 'ALL' || w.status === filter;
    const matchesSearch =
      w.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.user?.phone?.includes(searchTerm) ||
      w.accountNumber?.includes(searchTerm) ||
      w.accountTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            Manage Student Withdrawals
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Process payouts to student EasyPaisa & JazzCash accounts and send transfer confirmations.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] shrink-0">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                filter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by student name, phone, account..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
        />
      </div>

      {/* Withdrawals Vertical Cards List (No horizontal scroll) */}
      <div className="space-y-3">
        {loading && withdrawals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2 shadow-2xs">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading withdrawal requests...</span>
          </div>
        ) : filteredWithdrawals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs font-medium shadow-2xs">
            No withdrawals match this filter.
          </div>
        ) : (
          filteredWithdrawals.map((w) => {
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
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5 shadow-2xs hover:border-slate-300 transition-all"
              >
                {/* Top Row: Student, Gateway, Status */}
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center shrink-0">
                      {w.user?.name ? w.user.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm">{w.user?.name || 'Student'}</h3>
                        <span className="text-[11px] text-slate-500 font-mono font-bold flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-slate-400" />
                          {w.user?.phone}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1 text-[10px]">
                        <span className="text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                          Wallet: Rs. {Number(w.user?.balance || 0).toLocaleString()}
                        </span>
                        <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          📦 {w.userActivePlan || 'No Plan'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        w.gateway === 'EASYPAISA'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {w.gateway}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                </div>

                {/* Middle Info Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs items-center">
                  {/* Payout Amount */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Payout Amount</span>
                    <span className="text-base sm:text-lg font-black text-slate-900 block leading-tight mt-0.5">
                      Rs. {Number(w.amount).toLocaleString()}
                    </span>
                  </div>

                  {/* Account Number */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Receiver Number</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-xs inline-block mt-0.5">
                      {w.accountNumber}
                    </span>
                  </div>

                  {/* Account Title */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Account Title</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{w.accountTitle}</p>
                    <p className="text-[11px] text-slate-500 font-semibold">{w.gateway} Account</p>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Requested At</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{dateStr}</p>
                    <p className="text-[11px] text-slate-500 font-semibold">{timeStr}</p>
                  </div>
                </div>

                {/* Admin Note / Reason (if present) */}
                {w.adminNote && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">Note:</span>
                    <span>{w.adminNote}</span>
                  </div>
                )}

                {/* Action Buttons for PENDING */}
                {w.status === 'PENDING' && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => openApproveModal(w)}
                      disabled={actionLoading[w.id]}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Accept & Transfer (Rs. {Number(w.amount).toLocaleString()})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openRejectModal(w)}
                      disabled={actionLoading[w.id]}
                      className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                      <span>Reject & Refund</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Approve / Mark Paid Modal */}
      {approveModal.open && approveModal.item && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Accept & Confirm Withdrawal</h3>
                  <p className="text-[11px] text-slate-500">Student: {approveModal.item.user?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setApproveModal({ open: false, item: null, note: '' })}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Payment Summary Box */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount to Transfer:</span>
                <span className="font-black text-slate-900 text-sm">Rs. {approveModal.item.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway:</span>
                <span className="font-bold text-slate-800">{approveModal.item.gateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Number:</span>
                <span className="font-mono font-bold text-emerald-700">{approveModal.item.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Title:</span>
                <span className="font-bold text-slate-800">{approveModal.item.accountTitle}</span>
              </div>
            </div>

            {/* Student Financial Summary Box */}
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 space-y-1 text-xs">
              <p className="font-bold text-emerald-950 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                <Users className="w-3.5 h-3.5 text-emerald-700" /> Student Verification & Earnings Record
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-700">
                <p>• Total Deposited: <strong className="text-slate-900 font-bold">Rs. {Number(approveModal.item.userTotalDeposited ?? approveModal.item.user?.totalDeposited ?? 0).toLocaleString()}</strong></p>
                <p>• Referral Earning: <strong className="text-slate-900 font-bold">Rs. {Number(approveModal.item.userReferralEarnings ?? 0).toLocaleString()}</strong></p>
                <p>• Active Invites: <strong className="text-slate-900 font-bold">{approveModal.item.userActiveReferralsCount ?? 0} friends</strong></p>
                <p>• Active Plan: <strong className="text-slate-900 font-bold">{approveModal.item.userActivePlan || 'No Plan'}</strong></p>
                <p className="col-span-2">• Current Wallet Balance: <strong className="text-emerald-800 font-bold">Rs. {Number(approveModal.item.userBalance ?? approveModal.item.user?.balance ?? 0).toLocaleString()}</strong></p>
              </div>
            </div>

            {/* Confirmation Note / TID */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Transfer Confirmation Note / TID (Visible to student):
              </label>
              <textarea
                rows={3}
                value={approveModal.note}
                onChange={(e) => setApproveModal((prev) => ({ ...prev, note: e.target.value }))}
                placeholder="E.g. Rs. 800 successfully transferred to your EasyPaisa account. TID #12345678"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setApproveModal({ open: false, item: null, note: '' })}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitApprove}
                disabled={actionLoading[approveModal.item.id]}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-all"
              >
                {actionLoading[approveModal.item.id] ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                )}
                <span>Confirm Paid & Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && rejectModal.item && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <X className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Reject Withdrawal Request</h3>
                  <p className="text-[11px] text-slate-500">Rs. {rejectModal.item.amount.toLocaleString()} will be refunded to student's balance.</p>
                </div>
              </div>
              <button
                onClick={() => setRejectModal({ open: false, item: null, note: '' })}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Reason for Rejection:
              </label>
              <textarea
                rows={3}
                value={rejectModal.note}
                onChange={(e) => setRejectModal((prev) => ({ ...prev, note: e.target.value }))}
                placeholder="Reason explaining why withdrawal was rejected..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectModal({ open: false, item: null, note: '' })}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={actionLoading[rejectModal.item.id]}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-all"
              >
                {actionLoading[rejectModal.item.id] ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                )}
                <span>Reject & Refund</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageWithdrawals;

