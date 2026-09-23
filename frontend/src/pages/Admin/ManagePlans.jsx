import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Layers,
  Edit,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  Percent,
  Calendar,
  DollarSign
} from 'lucide-react';

const ManagePlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    dailyBonus: '',
    durationDays: 30,
    referralBonusPercent: 50,
    badge: 'Popular',
    description: '',
    isActive: true
  });

  const fetchPlans = async () => {
    try {
      const res = await api.get('/admin/plans');
      if (res.data.success) {
        setPlans(res.data.plans);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setIsCreating(false);
    setFormData({
      name: plan.name,
      price: plan.price,
      dailyBonus: plan.dailyBonus,
      durationDays: plan.durationDays || 30,
      referralBonusPercent: plan.referralBonusPercent || 50,
      badge: plan.badge || '',
      description: plan.description || '',
      isActive: plan.isActive !== false
    });
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setIsCreating(true);
    setFormData({
      name: '',
      price: '',
      dailyBonus: '',
      durationDays: 30,
      referralBonusPercent: 50,
      badge: 'Popular',
      description: '',
      isActive: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      if (isCreating) {
        const res = await api.post('/admin/plans', formData);
        if (res.data.success) {
          setMessage({ text: res.data.message, type: 'success' });
          setIsCreating(false);
          await fetchPlans();
        }
      } else if (editingPlan) {
        const res = await api.put(`/admin/plans/${editingPlan.id}`, formData);
        if (res.data.success) {
          setMessage({ text: res.data.message, type: 'success' });
          setEditingPlan(null);
          await fetchPlans();
        }
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to save plan changes',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-1.5">
            <Layers className="w-5 h-5 text-purple-600" />
            Manage Investment Plans & ROI
          </h1>
          <p className="text-xs text-slate-700 mt-0.5 font-medium">
            Customize plan prices, daily return bonus amounts, durations, and referral commissions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Plan
        </button>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium'
              : 'bg-rose-50 border border-rose-200 text-rose-900 font-medium'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Plans Grid */}
      {loading ? (
        <div className="text-center py-10 text-slate-600 text-xs font-semibold">Loading plans...</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-10 text-slate-600 text-xs">No plans found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {plans.map((p) => {
            const isFree = p.price === 0 || p.id === 0;
            const totalReturn = p.dailyBonus * (p.durationDays || 30);
            const profit = isFree ? totalReturn : totalReturn - p.price;

            return (
              <div
                key={p.id}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all relative flex flex-col justify-between shadow-2xs ${
                  p.isActive
                    ? 'bg-white border-slate-200 hover:border-purple-400'
                    : 'bg-slate-100 border-slate-300 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 uppercase tracking-wider">
                      {p.badge || 'Plan'}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                        p.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{p.name}</h3>
                  <div className="text-base sm:text-lg font-bold text-emerald-700 mt-0.5">
                    {isFree ? 'FREE (Rs. 0)' : `Rs. ${p.price.toLocaleString()}`}
                  </div>

                  <div className="my-2 py-2 px-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>Daily Bonus:</span>
                      <span className="text-emerald-700 font-bold">Rs. {p.dailyBonus}/day</span>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>Duration:</span>
                      <span>{p.durationDays || 30} Days</span>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>Referral Bonus:</span>
                      <span className="text-amber-700 font-bold">{p.referralBonusPercent || 50}% Commission</span>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-200">
                      <span>Total Profit:</span>
                      <span className="text-emerald-700 font-bold">+Rs. {profit.toLocaleString()}</span>
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-[10px] text-slate-600 mb-2">{p.description}</p>
                  )}
                </div>

                <div className="pt-1.5 flex gap-1.5">
                  <button
                    onClick={() => openEditModal(p)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] border border-purple-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Edit className="w-3 h-3 text-purple-600" />
                    <span>Edit Plan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Plan Modal */}
      {(editingPlan || isCreating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                {isCreating ? 'Create New Plan' : `Edit Plan: ${editingPlan.name}`}
              </h3>
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setIsCreating(false);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Level 1: Bronze Starter"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 1000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Daily Bonus (Rs./day)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 100"
                    value={formData.dailyBonus}
                    onChange={(e) => setFormData({ ...formData, dailyBonus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="30"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Referral Bonus (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    placeholder="50"
                    value={formData.referralBonusPercent}
                    onChange={(e) => setFormData({ ...formData, referralBonusPercent: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Badge Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Popular, Best Value, VIP"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Description / Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. For college students starting their earning journey"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Status</label>
                <select
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="true">Active (Students can buy)</option>
                  <option value="false">Disabled / Hidden</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null);
                    setIsCreating(false);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-1"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Plan</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePlans;
