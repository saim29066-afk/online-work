import React from 'react';
import { X, ExternalLink, Download, User, Phone, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { API_URL } from '../services/api';

const ProofModal = ({ imageUrl, deposit, onClose }) => {
  if (!imageUrl) return null;

  const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${API_URL}${imageUrl}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                Payment Slip Proof
              </span>
              {deposit?.gateway && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                  {deposit.gateway}
                </span>
              )}
            </div>
            <h3 className="text-base font-black text-slate-900 mt-1">
              Deposit Verification Slip
            </h3>
            {deposit && (
              <p className="text-xs text-slate-500 font-medium">
                Student: <strong className="text-slate-900">{deposit.user?.name || 'Student'}</strong> ({deposit.user?.phone || deposit.senderNumber})
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Open full size image in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Preview Box */}
        <div className="my-3 flex-1 overflow-auto flex items-center justify-center bg-slate-950 rounded-2xl p-2 min-h-[260px] max-h-[58vh]">
          <img
            src={fullUrl}
            alt="Payment Slip Screenshot"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            draggable="false"
            className="max-h-full w-auto max-w-full object-contain rounded-xl select-none pointer-events-auto"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/600x400/e2e8f0/1e293b?text=Image+Load+Error';
            }}
          />
        </div>

        {/* Deposit Details Breakdown */}
        {deposit && (
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Claimed Amount</span>
              <span className="text-sm font-black text-emerald-700 block">
                Rs. {Number(deposit.amount).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Transaction ID</span>
              <span className="text-xs font-mono font-bold text-slate-900 block truncate" title={deposit.transactionId}>
                {deposit.transactionId}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Sender Name</span>
              <span className="text-xs font-bold text-slate-900 block truncate">
                {deposit.senderName}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Sender Phone</span>
              <span className="text-xs font-mono font-bold text-slate-900 block">
                {deposit.senderNumber}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProofModal;
