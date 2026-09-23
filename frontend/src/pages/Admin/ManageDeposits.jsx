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
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProof, setSelectedProof] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchDeposits = async () => {
    try {
      const res = await api.get('/admin/deposits');
      if (res.data.success) {
        setDeposits(res.data.deposits);
      }
    } catch (err) {
      console.error('Failed to load deposits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleApprove = async (id, amount, studentName) => {
    if (
      !window.confirm(
        `Are you sure you want to APPROVE deposit of Rs. ${amount.toLocaleString()} for ${studentName}? This will credit the funds to their wallet instantly.`
      )
    ) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [id]: true }));
    setMessage({ text: '', type: '' });

    try {
      const res = await api.post(`/admin/deposits/${id}/approve`);
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        await fetchDeposits();
      }
    } catch (err) {
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

    setActionLoading((prev) => ({ ...prev, [id]: true }));
    setMessage({ text: '', type: '' });

    try {
      const res = await api.post(`/admin/deposits/${id}/reject`, { note: reason });
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        await fetchDeposits();
      }
    } catch (err) {
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

      {/* Deposits List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading deposit slips...</span>
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-medium">
            No deposits found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Slip</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Gateway</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Sender Info</th>
                  <th className="py-2.5 px-3">TID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredDeposits.map((dep) => {
                  const proofImg = dep.screenshotUrl
                    ? dep.screenshotUrl.startsWith('http')
                    ? dep.screenshotUrl
                    : `${API_URL}${dep.screenshotUrl}`
                    : null;

                  return (
                    <tr
                      key={dep.id}
                      className="text-slate-700 hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Thumbnail & Preview Button */}
                      <td className="py-2 px-3">
                        {proofImg ? (
                          <button
                            type="button"
                            onClick={() => setSelectedProof(dep)}
                            className="group relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:border-emerald-500 transition-all flex items-center justify-center shrink-0 shadow-2xs"
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
                                e.target.src =
                                  'https://placehold.co/100x100/e2e8f0/1e293b?text=Slip';
                              }}
                            />
                            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[8px] font-bold transition-opacity">
                              <Eye className="w-3 h-3" />
                            </div>
                          </button>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[9px]">
                            No Slip
                          </div>
                        )}
                      </td>

                      {/* Student Account */}
                      <td className="py-3 px-3.5">
                        <p className="font-black text-slate-900">{dep.user?.name || 'Student'}</p>
                        <p className="text-[11px] text-slate-500 font-mono font-bold flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5 text-slate-400" />
                          {dep.user?.phone}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          Wallet: Rs. {Number(dep.user?.balance || 0).toLocaleString()}
                        </p>
                      </td>

                      {/* Gateway */}
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

                      {/* Amount */}
                      <td className="py-3 px-3.5">
                        <span className="font-black text-slate-900 text-sm block">
                          Rs. {dep.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* Sender Info */}
                      <td className="py-3 px-3.5">
                        <p className="font-bold text-slate-900">{dep.senderName}</p>
                        <p className="text-[11px] text-slate-500 font-mono font-semibold">
                          {dep.senderNumber}
                        </p>
                      </td>

                      {/* TID */}
                      <td className="py-3 px-3.5">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-xs">
                          {dep.transactionId}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3.5 text-slate-500 text-[11px]">
                        {new Date(dep.createdAt).toLocaleDateString()} <br />
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(dep.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5">
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

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right">
                        {dep.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                handleApprove(dep.id, dep.amount, dep.user?.name)
                              }
                              disabled={actionLoading[dep.id]}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                              title="Approve & Credit Balance"
                            >
                              {actionLoading[dep.id] ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              )}
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(dep.id)}
                              disabled={actionLoading[dep.id]}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all active:scale-95"
                              title="Reject Deposit"
                            >
                              <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
