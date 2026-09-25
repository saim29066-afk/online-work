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
  History,
  X
} from 'lucide-react';

const Deposit = () => {
  const { user, refreshUser } = useAuth();
  const [gateway, setGateway] = useState('UPAISA');
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
      setFeedback({ text: 'Sender number must be a valid 11-digit mobile number (e.g. 03XXXXXXXXX).', type: 'error' });
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

  const activeStatus =
    gateway === 'UPAISA'
      ? settings?.upaisaStatus || 'ACTIVE'
      : gateway === 'JAZZCASH'
      ? settings?.jazzcashStatus || 'ACTIVE'
      : settings?.easypaisaStatus || 'ACTIVE';

  const activeNotice =
    gateway === 'UPAISA'
      ? settings?.upaisaNotice
      : gateway === 'JAZZCASH'
      ? settings?.jazzcashNotice
      : settings?.easypaisaNotice;

  const activeNumber =
    gateway === 'UPAISA'
      ? settings?.upaisaNumber || ''
      : gateway === 'JAZZCASH'
      ? settings?.jazzcashNumber || ''
      : settings?.easypaisaNumber || '';

  const activeTitle =
    gateway === 'UPAISA'
      ? settings?.upaisaTitle || 'Official Account'
      : gateway === 'JAZZCASH'
      ? settings?.jazzcashTitle || 'Official Account'
      : settings?.easypaisaTitle || 'Official Account';

  const gatewayName = gateway === 'UPAISA' ? 'UPaisa' : gateway === 'JAZZCASH' ? 'JazzCash' : 'EasyPaisa';

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4 bg-white">
      {/* Mobile-Native Back Button Header */}
      <PageHeader
        title="Deposit Funds"
        subtitle="Recharge your wallet via UPaisa / JazzCash / EasyPaisa"
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

      {/* Gateway Selector Tabs (1. UPaisa, 2. JazzCash, 3. EasyPaisa) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Tab 1: UPaisa */}
        <button
          type="button"
          onClick={() => setGateway('UPAISA')}
          className={`py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all border ${
            gateway === 'UPAISA'
              ? 'bg-orange-600 text-white border-orange-600 shadow-sm scale-[1.01]'
              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${settings?.upaisaStatus === 'UNDER_MAINTENANCE' ? 'bg-amber-400' : settings?.upaisaStatus === 'COMING_SOON' ? 'bg-blue-400' : 'bg-orange-400'}`} />
            <span className="truncate">UPaisa</span>
          </div>
          {settings?.upaisaStatus === 'UNDER_MAINTENANCE' && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
              Maintenance
            </span>
          )}
          {settings?.upaisaStatus === 'COMING_SOON' && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 border border-blue-300">
              Soon
            </span>
          )}
        </button>

        {/* Tab 2: JazzCash */}
        <button
          type="button"
          onClick={() => setGateway('JAZZCASH')}
          className={`py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all border ${
            gateway === 'JAZZCASH'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm scale-[1.01]'
              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${settings?.jazzcashStatus === 'UNDER_MAINTENANCE' ? 'bg-amber-300' : settings?.jazzcashStatus === 'COMING_SOON' ? 'bg-blue-400' : 'bg-amber-400'}`} />
            <span className="truncate">JazzCash</span>
          </div>
          {settings?.jazzcashStatus === 'UNDER_MAINTENANCE' && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
              Maintenance
            </span>
          )}
          {settings?.jazzcashStatus === 'COMING_SOON' && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 border border-blue-300">
              Soon
            </span>
          )}
        </button>

        {/* Tab 3: EasyPaisa */}
        <button
          type="button"
          onClick={() => setGateway('EASYPAISA')}
          className={`py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all border ${
            gateway === 'EASYPAISA'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-[1.01]'
              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${settings?.easypaisaStatus === 'UNDER_MAINTENANCE' ? 'bg-amber-400' : settings?.easypaisaStatus === 'COMING_SOON' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
            <span className="truncate">EasyPaisa</span>
          </div>
          {settings?.easypaisaStatus === 'UNDER_MAINTENANCE' && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
              Maintenance
            </span>
          )}
          {settings?.easypaisaStatus === 'COMING_SOON' && (
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 border border-blue-300">
              Soon
            </span>
          )}
        </button>
      </div>

      {/* Gateway Status Banner (If Under Maintenance or Coming Soon) */}
      {activeStatus !== 'ACTIVE' ? (
        <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3 shadow-xs text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-2xl font-black">
            {activeStatus === 'COMING_SOON' ? '🚀' : '🛠️'}
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base">
              {gatewayName} is {activeStatus === 'COMING_SOON' ? 'Coming Soon!' : 'Under Maintenance'}
            </h3>
            <p className="text-xs text-slate-700 mt-1.5 font-medium max-w-md mx-auto">
              {activeNotice || (activeStatus === 'COMING_SOON'
                ? `${gatewayName} deposit gateway will be available very soon. Please use another active gateway.`
                : `${gatewayName} receiving account is temporarily undergoing maintenance or limit update. Please select another active payment method above.`
              )}
            </p>
          </div>
          <p className="text-[11px] font-bold text-amber-900 bg-amber-100/70 py-1.5 px-3 rounded-xl inline-block border border-amber-200">
            👉 Tip: Click on another tab above (EasyPaisa / JazzCash / UPaisa) to deposit instantly.
          </p>
        </div>
      ) : (
        <>
          {/* Official Admin Receiver Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider block">
                  Official {gatewayName} Receiver Number:
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
                <p>1. Open {gatewayName} app</p>
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
                className={`p-3.5 rounded-xl text-xs flex items-start justify-between gap-2.5 font-semibold ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950 shadow-xs'
                    : 'bg-rose-50 border-2 border-rose-300 text-rose-950 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{feedback.text}</p>
                    {feedback.type === 'success' && (
                      <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                        Your deposit verification request has been submitted. It will be verified by administration shortly.
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedback({ text: '', type: '' })}
                  className="text-slate-400 hover:text-slate-700 p-0.5 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
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
                    placeholder="03XXXXXXXXX (11 digits)"
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
                    placeholder="Account Title / Full Name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Transaction ID (TID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12345678901"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Payment Slip / Screenshot <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>{screenshot ? 'Change Screenshot' : 'Upload Screenshot / Slip'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {screenshot && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Slip Selected ({screenshot.name})
                    </span>
                  )}
                </div>

                {previewUrl && (
                  <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border-2 border-emerald-500">
                    <img
                      src={previewUrl}
                      alt="Receipt Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading & Submitting...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
                    <span>Submit Deposit Verification</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Deposit;

