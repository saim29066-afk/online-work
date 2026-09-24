import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import {
  ArrowDownLeft,
  Copy,
  Check,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Smartphone,
  ShieldCheck,
  History
} from 'lucide-react';

const Deposit = () => {
  const { user, refreshUser } = useAuth();
  const [gateway, setGateway] = useState('EASYPAISA');
  const [settings, setSettings] = useState(null);
  const [amount, setAmount] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [senderName, setSenderName] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [deposits, setDeposits] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchData = async () => {
    try {
      const [resSettings, resDeposits] = await Promise.all([
        api.get('/transactions/gateway-info'),
        api.get('/transactions/my-deposits')
      ]);

      if (resSettings.data.success) {
        setSettings(resSettings.data.settings);
      }
      if (resDeposits.data.success) {
        setDeposits(resDeposits.data.deposits);
      }
    } catch (err) {
      console.error('Failed to load deposit data:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      // If small file (< 100KB), no need to compress
      if (!file || file.size <= 100 * 1024) {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressed);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.82
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      const optimized = await compressImage(file);
      setScreenshot(optimized);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ text: '', type: '' });

    if (!amount || !senderNumber || !senderName || !transactionId) {
      setFeedback({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    const cleanSender = senderNumber.trim().replace(/\D/g, '');
    if (cleanSender.length !== 11 || !cleanSender.startsWith('03')) {
      setFeedback({ text: 'Sender number must be a valid 11-digit mobile number (e.g. 03001234567).', type: 'error' });
      return;
    }

    if (!screenshot) {
      setFeedback({ text: 'Please upload the payment transaction screenshot / slip.', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // Ensure screenshot is compressed for lightning-fast sub-second upload
      const fileToSend = await compressImage(screenshot);

      const formData = new FormData();
      formData.append('gateway', gateway);
      formData.append('amount', amount);
      formData.append('senderNumber', cleanSender);
      formData.append('senderName', senderName);
      formData.append('transactionId', transactionId);
      formData.append('screenshot', fileToSend);

      const res = await api.post('/transactions/deposit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setFeedback({ text: res.data.message, type: 'success' });
        setAmount('');
        setSenderNumber('');
        setSenderName('');
        setTransactionId('');
        setScreenshot(null);
        setPreviewUrl('');
        await fetchData();
        await refreshUser();
      }
    } catch (err) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to submit deposit request. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const activeNumber =
    gateway === 'EASYPAISA'
      ? settings?.easypaisaNumber || '03451234567'
      : settings?.jazzcashNumber || '03019876543';

  const activeTitle =
    gateway === 'EASYPAISA'
      ? settings?.easypaisaTitle || 'Muhammad Ali (Admin)'
      : settings?.jazzcashTitle || 'Muhammad Ali (Admin)';

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4 bg-white">
      {/* Mobile-Native Back Button Header */}
      <PageHeader
        title="Deposit Funds"
        subtitle="Recharge your wallet via EasyPaisa / JazzCash"
        backTo="/dashboard"
        rightAction={
          <Link
            to="/deposit-history"
            className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <History className="w-3.5 h-3.5" /> History
          </Link>
        }
      />

      {/* Gateway Selector Tabs */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setGateway('EASYPAISA')}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
            gateway === 'EASYPAISA'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-[1.01]'
              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>EasyPaisa Account</span>
        </button>

        <button
          type="button"
          onClick={() => setGateway('JAZZCASH')}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
            gateway === 'JAZZCASH'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm scale-[1.01]'
              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>JazzCash Account</span>
        </button>
      </div>

      {/* Official Admin Receiver Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider block">
              Official {gateway === 'EASYPAISA' ? 'EasyPaisa' : 'JazzCash'} Receiver Number:
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-mono font-black text-slate-900 tracking-wider">
                {activeNumber}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(activeNumber)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 border border-slate-300 shadow-2xs transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copied ? 'Copied!' : 'Copy Number'}</span>
              </button>
            </div>
            <p className="text-xs font-bold text-slate-800 mt-1">
              Account Title: <strong className="text-emerald-700 font-black">{activeTitle}</strong>
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-0.5 w-full sm:w-auto">
            <p className="text-slate-900 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 3 Quick Steps:
            </p>
            <p>1. Open {gateway === 'EASYPAISA' ? 'EasyPaisa' : 'JazzCash'} app</p>
            <p>2. Send amount to {activeNumber}</p>
            <p>3. Take screenshot & note TID</p>
          </div>
        </div>
      </div>

      {/* Deposit Form */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Submit Payment Slip</h3>

        {feedback.text && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2.5 font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border border-rose-300 text-rose-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Deposit Amount (Rs.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="100"
                placeholder="e.g. 1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Your Sender Mobile (11 Digits) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={11}
                placeholder="03001234567 (11 digits)"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Sender Account Title / Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ali Ahmed"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Transaction ID (TID) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 8492048102"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Screenshot Upload Field */}
          <div>
            <label className="block font-bold text-slate-800 text-xs mb-1">
              Upload Payment Slip Screenshot <span className="text-rose-500">*</span>
            </label>
            <div className="relative border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 transition-colors">
              <input
                type="file"
                accept="image/*,image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    draggable="false"
                    className="max-h-48 rounded-xl object-contain border border-slate-300 shadow-sm select-none"
                  />
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Slip attached from Gallery (Tap to change)
                  </span>
                </div>
              ) : (
                <div className="py-3 flex flex-col items-center justify-center text-slate-600 gap-1.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-emerald-600 shadow-2xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Tap to select slip from Gallery / Photos</p>
                  <p className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP</p>
                </div>
              )}
            </div>
          </div>

          {user?.isRestricted ? (
            <div className="w-full py-3 px-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold text-xs text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Account Restricted: Deposits are frozen by Administration</span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Slip...</span>
                </>
              ) : (
                <span>Submit Deposit Slip (Rs. {Number(amount || 0).toLocaleString()})</span>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Deposit;
