import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Megaphone, X } from 'lucide-react';

const NoticeBanner = () => {
  const [notice, setNotice] = useState('');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await api.get('/transactions/gateway-info');
        if (res.data.success && res.data.settings?.noticeText) {
          setNotice(res.data.settings.noticeText);
        }
      } catch (err) {
        setNotice('🎉 Welcome Students! Rs. 150 Free Bonus on new account + 50% instant referral bonus!');
      }
    };
    fetchNotice();
  }, []);

  if (!visible || !notice) return null;

  return (
    <div className="bg-emerald-50 border-b border-emerald-100 text-emerald-800 px-3 py-1.5 text-xs flex items-center justify-between">
      <div className="flex items-center gap-2 overflow-hidden mx-auto max-w-6xl">
        <Megaphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <p className="truncate font-medium text-[11px] sm:text-xs">
          <span className="font-bold text-emerald-900 uppercase">ANNOUNCEMENT:</span> {notice}
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-emerald-600 hover:text-emerald-900 p-0.5 rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default NoticeBanner;
