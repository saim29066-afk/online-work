import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle2, Zap } from 'lucide-react';

const BASE_LIVE_STREAM = [
  { phone: '0300-***1482', amount: 2000, gateway: 'EasyPaisa', time: 'Just now' },
  { phone: '0333-***9812', amount: 500, gateway: 'JazzCash', time: '1 min ago' },
  { phone: '0312-***4401', amount: 4000, gateway: 'EasyPaisa', time: '2 mins ago' },
  { phone: '0345-***7623', amount: 8000, gateway: 'EasyPaisa', time: '4 mins ago' },
  { phone: '0301-***8921', amount: 2000, gateway: 'JazzCash', time: '6 mins ago' },
  { phone: '0321-***5109', amount: 16000, gateway: 'EasyPaisa', time: '8 mins ago' },
  { phone: '0334-***3211', amount: 500, gateway: 'EasyPaisa', time: '9 mins ago' },
  { phone: '0308-***6543', amount: 4000, gateway: 'JazzCash', time: '11 mins ago' },
  { phone: '0315-***7890', amount: 2000, gateway: 'EasyPaisa', time: '12 mins ago' },
  { phone: '0346-***2198', amount: 8000, gateway: 'JazzCash', time: '15 mins ago' },
  { phone: '0302-***9012', amount: 500, gateway: 'EasyPaisa', time: '17 mins ago' },
  { phone: '0331-***4567', amount: 2000, gateway: 'EasyPaisa', time: '19 mins ago' },
  { phone: '0313-***8901', amount: 4000, gateway: 'JazzCash', time: '21 mins ago' },
  { phone: '0347-***6789', amount: 16000, gateway: 'EasyPaisa', time: '23 mins ago' },
  { phone: '0303-***1234', amount: 2000, gateway: 'JazzCash', time: '25 mins ago' },
  { phone: '0335-***5678', amount: 500, gateway: 'EasyPaisa', time: '28 mins ago' },
  { phone: '0314-***9012', amount: 8000, gateway: 'EasyPaisa', time: '30 mins ago' },
  { phone: '0348-***3456', amount: 4000, gateway: 'JazzCash', time: '32 mins ago' },
  { phone: '0304-***7890', amount: 2000, gateway: 'EasyPaisa', time: '35 mins ago' },
  { phone: '0336-***1234', amount: 16000, gateway: 'JazzCash', time: '38 mins ago' }
];

const LiveWithdrawalTicker = () => {
  const [items, setItems] = useState(BASE_LIVE_STREAM);

  useEffect(() => {
    const fetchLivePayouts = async () => {
      try {
        const res = await api.get('/transactions/live-payouts');
        if (res.data.success && res.data.payouts && res.data.payouts.length > 0) {
          setItems([...res.data.payouts, ...BASE_LIVE_STREAM]);
        }
      } catch (err) {
        // Fallback to default
      }
    };
    fetchLivePayouts();
  }, []);

  const marqueeItems = [...items, ...items];

  return (
    <div className="bg-slate-900 text-slate-300 border-y border-slate-800 py-1 select-none overflow-hidden">
      <div className="flex items-center">
        {/* Fixed Live Indicator Badge */}
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white font-bold text-[10px] tracking-wider uppercase shadow-xs z-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span>Live Payouts</span>
        </div>

        {/* 24/7 Infinite Seamless Streaming Marquee */}
        <div className="flex overflow-hidden whitespace-nowrap w-full">
          <div className="animate-infinite-ticker flex items-center gap-3 text-[11px] font-medium py-0.5">
            {marqueeItems.map((item, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full border border-slate-700/80 shadow-2xs shrink-0"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                <span className="font-mono text-slate-200 font-bold">{item.phone}</span>
                <span className="text-slate-400 font-normal">cashed out</span>
                <span className="font-bold text-emerald-400">Rs. {Number(item.amount).toLocaleString()}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    item.gateway === 'EasyPaisa'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {item.gateway}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveWithdrawalTicker;

