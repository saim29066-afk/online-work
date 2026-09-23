import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  ShieldCheck,
  Megaphone,
  PhoneCall,
  Percent,
  Users
} from 'lucide-react';

const GatewaySettings = () => {
  const [formData, setFormData] = useState({
    easypaisaNumber: '',
    easypaisaTitle: '',
    jazzcashNumber: '',
    jazzcashTitle: '',
    minWithdrawal: 800,
    minInvitesForWithdraw: 1,
    supportWhatsapp: '',
    supportEmail: '',
    noticeText: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchSettings = async () => {
    try {
      const res = await api.get('/transactions/gateway-info');
      if (res.data.success && res.data.settings) {
        setFormData(res.data.settings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'easypaisaNumber' || name === 'jazzcashNumber' || name === 'supportWhatsapp') {
      value = value.replace(/\D/g, '').slice(0, 11);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.easypaisaNumber && formData.easypaisaNumber.length > 11) {
      setMessage({ text: 'EasyPaisa number cannot exceed 11 digits', type: 'error' });
      return;
    }
    if (formData.jazzcashNumber && formData.jazzcashNumber.length > 11) {
      setMessage({ text: 'JazzCash number cannot exceed 11 digits', type: 'error' });
      return;
    }
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.put('/admin/settings', formData);
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        await fetchSettings();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update settings',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-700 gap-3 font-semibold">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-3.5 bg-white">
      {/* Header */}
      <div>
        <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
          <Settings className="w-4 h-4 text-purple-600" />
          Payment Gateways & System Rules
        </h1>
        <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
          Update your EasyPaisa & JazzCash receiver numbers, withdrawal rules, and announcements in real time.
        </p>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div
          className={`p-2.5 rounded-xl text-xs flex items-center gap-2 font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border border-rose-300 text-rose-900'
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

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        {/* EasyPaisa Settings */}
        <div className="p-3 sm:p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <h3>EasyPaisa Receiving Account</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-800 mb-0.5 text-[11px]">
                EasyPaisa Mobile Number (11 Digits)
              </label>
              <input
                type="text"
                maxLength={11}
                placeholder="03451234567"
                name="easypaisaNumber"
                value={formData.easypaisaNumber}
                onChange={handleChange}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-0.5 text-[11px]">
                EasyPaisa Account Title (Name)
              </label>
              <input
                type="text"
                name="easypaisaTitle"
                value={formData.easypaisaTitle}
                onChange={handleChange}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* JazzCash Settings */}
        <div className="p-3 sm:p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
            <Smartphone className="w-3.5 h-3.5 text-amber-600" />
            <h3>JazzCash Receiving Account</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-800 mb-0.5 text-[11px]">
                JazzCash Mobile Number (11 Digits)
              </label>
              <input
                type="text"
                maxLength={11}
                placeholder="03019876543"
                name="jazzcashNumber"
                value={formData.jazzcashNumber}
                onChange={handleChange}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-0.5 text-[11px]">
                JazzCash Account Title (Name)
              </label>
              <input
                type="text"
                name="jazzcashTitle"
                value={formData.jazzcashTitle}
                onChange={handleChange}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Platform Rules & Limits */}
        <div className="p-5 rounded-2xl border-2 border-purple-200 bg-purple-50/40 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-purple-950 font-black text-sm">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <h3>Student Cashout & Referral Rules</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Minimum Withdrawal (Rs.)
              </label>
              <input
                type="number"
                name="minWithdrawal"
                value={formData.minWithdrawal}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-purple-600"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">Students cannot withdraw less than this amount.</p>
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Base Invites for 1st Cashout
              </label>
              <input
                type="number"
                name="minInvitesForWithdraw"
                value={formData.minInvitesForWithdraw}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-purple-600"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">Subsequent cashouts require +2 additional paid invites.</p>
            </div>
          </div>
        </div>

        {/* Support & Announcement Notice */}
        <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/70 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
            <Megaphone className="w-4 h-4 text-cyan-600" />
            <h3>Customer Support & Live Announcement</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Support WhatsApp Number (11 Digits)
              </label>
              <input
                type="text"
                maxLength={11}
                placeholder="03451234567"
                name="supportWhatsapp"
                value={formData.supportWhatsapp}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold focus:outline-none focus:border-cyan-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Support Email
              </label>
              <input
                type="email"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-cyan-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Top Announcement Notice Text
            </label>
            <textarea
              rows={2}
              name="noticeText"
              value={formData.noticeText}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-cyan-600 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Gateway Settings...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Update System Settings</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default GatewaySettings;
