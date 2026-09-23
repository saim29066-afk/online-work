import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import {
  Users,
  Search,
  Wallet,
  Layers,
  Edit,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Ban,
  Unlock,
  Link as LinkIcon,
  Phone,
  Gift,
  Trash2,
  AlertTriangle
} from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceAction, setBalanceAction] = useState('ADD'); // 'ADD', 'SUBTRACT', 'SET'
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Restriction modal state
  const [restrictModalUser, setRestrictModalUser] = useState(null);
  const [restrictionReason, setRestrictionReason] = useState('Multiple fake account violation');
  const [restricting, setRestricting] = useState(false);

  // Set Referrer modal state
  const [referrerModalUser, setReferrerModalUser] = useState(null);
  const [referrerInput, setReferrerInput] = useState('');
  const [updatingReferrer, setUpdatingReferrer] = useState(false);

  // Delete User modal state
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    if (!selectedUser || !balanceAmount) return;

    setUpdating(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.post(`/admin/users/${selectedUser.id}/balance`, {
        amount: parseFloat(balanceAmount),
        action: balanceAction
      });

      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        setSelectedUser(null);
        setBalanceAmount('');
        await fetchUsers();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update balance',
        type: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleRestriction = async (e) => {
    e.preventDefault();
    if (!restrictModalUser) return;

    setRestricting(true);
    setMessage({ text: '', type: '' });

    const newRestrictedState = !restrictModalUser.isRestricted;

    try {
      const res = await api.post(`/admin/users/${restrictModalUser.id}/restrict`, {
        isRestricted: newRestrictedState,
        reason: restrictionReason
      });

      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        setRestrictModalUser(null);
        await fetchUsers();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update restriction',
        type: 'error'
      });
    } finally {
      setRestricting(false);
    }
  };

  const handleSetReferrer = async (e) => {
    e.preventDefault();
    if (!referrerModalUser || !referrerInput.trim()) return;

    setUpdatingReferrer(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.post(`/admin/users/${referrerModalUser.id}/set-referrer`, {
        referrerCodeOrPhone: referrerInput.trim()
      });

      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        setReferrerModalUser(null);
        setReferrerInput('');
        await fetchUsers();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to set referrer',
        type: 'error'
      });
    } finally {
      setUpdatingReferrer(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;

    setDeleting(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.delete(`/admin/users/${deleteModalUser.id}`);
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        setDeleteModalUser(null);
        await fetchUsers();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to delete student account',
        type: 'error'
      });
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users
    .filter((u) => u.role !== 'ADMIN')
    .filter((u) => {
      return (
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm) ||
        u.referralCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.referredBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.referredBy?.phone?.includes(searchTerm)
      );
    });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4">
      {/* Top Back Navigation */}
      <PageHeader
        title="Registered Students Directory"
        subtitle="Manage student balances, active plans, and remove accounts"
        backTo="/admin"
        rightAction={
          <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold font-mono">
            Students: {users.length}
          </span>
        }
      />

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
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search student name, phone, ref code, or referrer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading registered students...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-medium">No students found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Wallet Balance</th>
                  <th className="py-2.5 px-3">Deposited</th>
                  <th className="py-2.5 px-3">Withdrawn</th>
                  <th className="py-2.5 px-3">Ref Code</th>
                  <th className="py-2.5 px-3">Referred By (Inviter)</th>
                  <th className="py-2.5 px-3">Invited</th>
                  <th className="py-2.5 px-3">Active Plans</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const activePlansCount = (u.investments || []).filter((i) => i.status === 'ACTIVE').length;

                  return (
                    <tr key={u.id} className="text-slate-700 hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono font-semibold">{u.phone}</p>
                      </td>

                      {/* Restriction Status */}
                      <td className="py-2.5 px-3">
                        {u.isRestricted ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <ShieldAlert className="w-2.5 h-2.5 text-rose-600" /> RESTRICTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> ACTIVE
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 font-bold text-emerald-700">
                        Rs. {Number(u.balance || 0).toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3 text-slate-600">
                        Rs. {Number(u.totalDeposited || 0).toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3 text-slate-600">
                        Rs. {Number(u.totalWithdrawn || 0).toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold text-amber-700 text-[11px]">
                        {u.referralCode}
                      </td>

                      {/* Referred By */}
                      <td className="py-2.5 px-3">
                        {u.referredBy ? (
                          <div>
                            <p className="font-bold text-slate-900">{u.referredBy.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{u.referredBy.phone}</p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReferrerModalUser(u);
                              setReferrerInput('');
                            }}
                            className="text-[10px] text-slate-400 hover:text-emerald-700 font-bold underline flex items-center gap-0.5"
                          >
                            <LinkIcon className="w-2.5 h-2.5" />
                            <span>Direct (Set Referrer)</span>
                          </button>
                        )}
                      </td>

                      <td className="py-2.5 px-3 font-bold text-slate-900 text-center">
                        {u._count?.referrals || 0}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-semibold text-slate-600">
                          {activePlansCount} Active
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setBalanceAmount('');
                              setBalanceAction('ADD');
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-300 inline-flex items-center gap-0.5 transition-colors shadow-2xs"
                            title="Adjust Wallet Funds"
                          >
                            <Edit className="w-2.5 h-2.5" />
                            <span>Funds</span>
                          </button>

                          <button
                            onClick={() => {
                              setRestrictModalUser(u);
                              setRestrictionReason(u.restrictionReason || 'Multiple fake account violation');
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border inline-flex items-center gap-0.5 transition-colors shadow-2xs ${
                              u.isRestricted
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            }`}
                            title={u.isRestricted ? 'Remove restriction' : 'Restrict student'}
                          >
                            {u.isRestricted ? (
                              <>
                                <Unlock className="w-2.5 h-2.5" />
                                <span>Unban</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-2.5 h-2.5" />
                                <span>Restrict</span>
                              </>
                            )}
                          </button>

                          {/* Delete Student Account Button */}
                          <button
                            onClick={() => setDeleteModalUser(u)}
                            className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition-colors shadow-2xs"
                            title="Delete Student Account"
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete User Confirmation Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 shadow-xl relative text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-rose-700 flex items-center gap-1.5 text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Delete Student Account
              </h3>
              <button
                onClick={() => setDeleteModalUser(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-900 space-y-1">
              <p className="font-bold">Are you sure you want to permanently delete this student?</p>
              <p className="text-[11px] text-rose-800">
                Student: <strong>{deleteModalUser.name}</strong> ({deleteModalUser.phone})
              </p>
              <p className="text-[10px] text-rose-700 pt-1">
                ⚠️ All associated investment plans, deposit slips, withdrawal history, and tickets will be permanently removed.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center gap-1 shadow-2xs"
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Referrer Modal */}
      {referrerModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 shadow-xl relative text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <Gift className="w-4 h-4 text-amber-600" />
                Link Inviter / Referrer
              </h3>
              <button
                onClick={() => setReferrerModalUser(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600">
              Student: <strong className="text-slate-900">{referrerModalUser.name}</strong> ({referrerModalUser.phone})
            </p>

            <form onSubmit={handleSetReferrer} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Enter Referrer Referral Code or 11-Digit Mobile Number:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STUWDGJH or 03335114728"
                  value={referrerInput}
                  onChange={(e) => setReferrerInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReferrerModalUser(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingReferrer}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1 shadow-2xs"
                >
                  {updatingReferrer ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Link Inviter</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Funds Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 shadow-xl relative text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Adjust Student Wallet</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-0.5 text-[11px]">
              <p className="text-slate-600">
                Student: <strong className="text-slate-900">{selectedUser.name}</strong> ({selectedUser.phone})
              </p>
              <p className="text-slate-600">
                Current Balance: <strong className="text-emerald-700">Rs. {Number(selectedUser.balance || 0).toLocaleString()}</strong>
              </p>
            </div>

            <form onSubmit={handleUpdateBalance} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Action
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setBalanceAction('ADD')}
                    className={`py-1.5 px-2 rounded-lg font-bold border ${
                      balanceAction === 'ADD'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    + Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceAction('SUBTRACT')}
                    className={`py-1.5 px-2 rounded-lg font-bold border ${
                      balanceAction === 'SUBTRACT'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    - Deduct
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceAction('SET')}
                    className={`py-1.5 px-2 rounded-lg font-bold border ${
                      balanceAction === 'SET'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    = Set
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Amount (Rs.)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 500"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-1"
                >
                  {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Update</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restrict / Ban Violation Modal */}
      {restrictModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 shadow-xl relative text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                {restrictModalUser.isRestricted ? 'Remove Restriction' : 'Restrict Account for Violation'}
              </h3>
              <button
                onClick={() => setRestrictModalUser(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 mb-3">
              Student: <strong className="text-slate-900">{restrictModalUser.name}</strong> ({restrictModalUser.phone})
            </p>

            <form onSubmit={handleToggleRestriction} className="space-y-3">
              {!restrictModalUser.isRestricted && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select / Type Violation Reason
                  </label>
                  <select
                    value={restrictionReason}
                    onChange={(e) => setRestrictionReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs mb-2 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Multiple fake account violation">Multiple fake account violation</option>
                    <option value="Fake TID or forged deposit screenshot">Fake TID or forged deposit screenshot</option>
                    <option value="Suspicious referral manipulation">Suspicious referral manipulation</option>
                    <option value="Violation of terms of service">Violation of terms of service</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Or enter custom reason..."
                    value={restrictionReason}
                    onChange={(e) => setRestrictionReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRestrictModalUser(null)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={restricting}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-white shadow-xs flex items-center justify-center gap-1 ${
                    restrictModalUser.isRestricted
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {restricting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : restrictModalUser.isRestricted ? (
                    <span>Reactivate Account</span>
                  ) : (
                    <span>Apply Restriction</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
