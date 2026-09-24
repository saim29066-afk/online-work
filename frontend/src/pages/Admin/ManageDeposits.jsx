import React, { useState, useEffect } from 'react';
import api, { API_URL } from '../../services/api';
import ProofModal from '../../components/ProofModal';
import PageHeader from '../../components/PageHeader';
import {
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Search,
  Check,
  X,
  Loader2,
  AlertCircle,
  Phone,
  User,
  Image,
  Wallet
} from 'lucide-react';

const ManageDeposits = () => {
  const [deposits, setDeposits] = useState(() => {
    try {
      const cached = sessionStorage.getItem('cached_admin_deposits');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('cached_admin_deposits');
    } catch {
      return true;
    }
  });
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProof, setSelectedProof] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchDeposits = async (isBackground = false) => {
    if (!isBackground && deposits.length === 0) setLoading(true);
    try {
      const res = await api.get('/admin/deposits');
      if (res.data.success) {
        setDeposits(res.data.deposits);
        try {
          sessionStorage.setItem('cached_admin_deposits', JSON.stringify(res.data.deposits));
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load deposits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits(deposits.length > 0);
  }, []);

  const handleApprove = async (id, amount, studentName) => {
    if (
      !window.confirm(
        `Are you sure you want to APPROVE deposit of Rs. ${amount.toLocaleString()} for ${studentName}? This will credit the funds to their wallet instantly.`
      )
    ) {
      return;
    }

    // ⚡ Instant Optimistic Update (0ms UI latency)
    const previousDeposits = [...deposits];
    setDeposits((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'APPROVED',
              user: d.user
                ? { ...d.user, balance: (Number(d.user.balance) || 0) + Number(amount) }
                : d.user
            }
          : d
      )
    );
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    setMessage({ text: `Deposit of Rs. ${amount.toLocaleString()} approved instantly!`, type: 'success' });

    try {
      const res = await api.post(`/admin/deposits/${id}/approve`);
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        fetchDeposits(true);
      } else {
        // Revert on failure
        setDeposits(previousDeposits);
        setMessage({ text: res.data.message || 'Failed to approve deposit', type: 'error' });
      }
    } catch (err) {
      setDeposits(previousDeposits);
      setMessage({
        text: err.response?.data?.message || 'Failed to approve deposit',
        type: 'error'
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt(
      'Enter rejection reason (e.g. Invalid TID / Screenshot unreadable):',
      'Transaction ID verification failed'
    );
    if (reason === null) return;

    // ⚡ Instant Optimistic Update (0ms UI latency)
    const previousDeposits = [...deposits];
    setDeposits((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'REJECTED' } : d))
    );
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    setMessage({ text: 'Deposit rejected.', type: 'success' });

    try {
      const res = await api.post(`/admin/deposits/${id}/reject`, { note: reason });
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        fetchDeposits(true);
      } else {
        setDeposits(previousDeposits);
        setMessage({ text: res.data.message || 'Failed to reject deposit', type: 'error' });
      }
    } catch (err) {
      setDeposits(previousDeposits);
      setMessage({
        text: err.response?.data?.message || 'Failed to reject deposit',
        type: 'error'
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filteredDeposits = deposits.filter((d) => {
    const matchesFilter = filter === 'ALL' || d.status === filter;
    const matchesSearch =
      d.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.user?.phone?.includes(searchTerm) ||
      d.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.senderNumber?.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const pendingCount = deposits.filter((d) => d.status === 'PENDING').length;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4">
      {/* Top Back Navigation */}
      <PageHeader
        title="Manage Student Deposits"
        subtitle="Verify EasyPaisa & JazzCash slips and credit approved funds"
        backTo="/admin"
      />

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] w-full sm:w-auto overflow-x-auto">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => {
            const count =
              st === 'ALL'
                ? deposits.length
                : deposits.filter((d) => d.status === st).length;

            return (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all shrink-0 flex items-center gap-1 ${
                  filter === st
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`px-1 py-0.1 rounded-full text-[9px] font-bold ${
                    filter === st
                      ? 'bg-slate-700 text-slate-100'
                      : st === 'PENDING' && count > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, phone, TID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div
          className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
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
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {/* Deposits Vertical Cards List (No horizontal scroll) */}
      <div className="space-y-3">
        {loading && deposits.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2 shadow-2xs">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading deposit slips...</span>
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs font-medium shadow-2xs">
            No deposits found for this filter.
          </div>
        ) : (
          filteredDeposits.map((dep) => {
            const proofImg = dep.screenshotUrl
              ? dep.screenshotUrl.startsWith('http')
                ? dep.screenshotUrl
                : `${API_URL}${dep.screenshotUrl}`
              : null;

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
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5 shadow-2xs hover:border-slate-300 transition-all"
              >
                {/* Top Row: Student, Gateway, Status */}
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 font-black text-sm flex items-center justify-center shrink-0">
                      {dep.user?.name ? dep.user.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm">{dep.user?.name || 'Student'}</h3>
                        <span className="text-[11px] text-slate-500 font-mono font-bold flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-slate-400" />
                          {dep.user?.phone}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-0.5 inline-block">
                        Wallet: Rs. {Number(dep.user?.balance || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
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

                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                </div>

                {/* Middle Info Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs items-center">
                  {/* Slip Preview */}
                  <div className="flex items-center gap-2">
                    {proofImg ? (
                      <button
                        type="button"
                        onClick={() => setSelectedProof(dep)}
                        className="group relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 hover:border-purple-500 transition-all flex items-center justify-center shrink-0 shadow-2xs"
                        title="Click to view full screenshot"
                      >
                        <img
                          src={proofImg}
                          alt="Slip"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          draggable="false"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform select-none"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/100x100/e2e8f0/1e293b?text=Slip';
                          }}
                        />
                        <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold transition-opacity">
                          <Eye className="w-3.5 h-3.5 mb-0.5" />
                          View
                        </div>
                      </button>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-bold">
                        No Slip
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Deposit</span>
                      <span className="text-base sm:text-lg font-black text-slate-900 block leading-tight">
                        Rs. {Number(dep.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* TID */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Transaction ID (TID)</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-xs inline-block mt-0.5">
                      {dep.transactionId}
                    </span>
                  </div>

                  {/* Sender */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Sender Account</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{dep.senderName}</p>
                    <p className="text-[11px] font-mono text-slate-600 font-bold">{dep.senderNumber}</p>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Submitted At</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{dateStr}</p>
                    <p className="text-[11px] text-slate-500 font-semibold">{timeStr}</p>
                  </div>
                </div>

                {/* Admin Note / Status Reason (if present) */}
                {dep.adminNote && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">Note:</span>
                    <span>{dep.adminNote}</span>
                  </div>
                )}

                {/* Action Buttons (Approve / Reject) for PENDING */}
                {dep.status === 'PENDING' && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleApprove(dep.id, dep.amount, dep.user?.name)}
                      disabled={actionLoading[dep.id]}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                    >
                      {actionLoading[dep.id] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 stroke-[3]" />
                      )}
                      <span>Approve & Credit Balance (Rs. {Number(dep.amount).toLocaleString()})</span>
                    </button>

                    <button
                      onClick={() => handleReject(dep.id)}
                      disabled={actionLoading[dep.id]}
                      className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Full Resolution Slip Lightbox */}
      {selectedProof && (
        <ProofModal
          imageUrl={selectedProof.screenshotUrl}
          deposit={selectedProof}
          onClose={() => setSelectedProof(null)}
        />
      )}
    </div>
  );
};

export default ManageDeposits;
