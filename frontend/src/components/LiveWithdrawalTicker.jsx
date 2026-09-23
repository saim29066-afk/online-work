import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ArrowUpRight, Zap, Sparkles } from 'lucide-react';

const BASE_LIVE_STREAM = [
  { phone: '0300-***1482', amount: 2000, gateway: 'EasyPaisa' },
  { phone: '0333-***9812', amount: 500, gateway: 'JazzCash' },
  { phone: '0312-***4401', amount: 4000, gateway: 'EasyPaisa' },
  { phone: '0345-***7623', amount: 8000, gateway: 'EasyPaisa' },
  { phone: '0301-***8921', amount: 2000, gateway: 'JazzCash' },
  { phone: '0321-***5109', amount: 16000, gateway: 'EasyPaisa' },
  { phone: '0334-***3211', amount: 500, gateway: 'EasyPaisa' },
  { phone: '0308-***6543', amount: 4000, gateway: 'JazzCash' },
  { phone: '0315-***7890', amount: 2000, gateway: 'EasyPaisa' },
  { phone: '0346-***2198', amount: 8000, gateway: 'JazzCash' },
  { phone: '0302-***9012', amount: 500, gateway: 'EasyPaisa' },
  { phone: '0331-***4567', amount: 2000, gateway: 'EasyPaisa' },
  { phone: '0313-***8901', amount: 4000, gateway: 'JazzCash' },
  { phone: '0347-***6789', amount: 16000, gateway: 'EasyPaisa' },
  { phone: '0303-***1234', amount: 2000, gateway: 'JazzCash' },
  { phone: '0335-***5678', amount: 500, gateway: 'EasyPaisa' },
  { phone: '0314-***9012', amount: 8000, gateway: 'EasyPaisa' },
  { phone: '0348-***3456', amount: 4000, gateway: 'JazzCash' },
  { phone: '0304-***7890', amount: 2000, gateway: 'EasyPaisa' },
  { phone: '0336-***1234', amount: 16000, gateway: 'JazzCash' },
  { phone: '0316-***5678', amount: 500, gateway: 'EasyPaisa' },
  { phone: '0349-***9012', amount: 2000, gateway: 'EasyPaisa' },
  { phone: '0305-***3456', amount: 4000, gateway: 'JazzCash' },
  { phone: '0337-***7890', amount: 8000, gateway: 'EasyPaisa' },
  { phone: '0317-***1234', amount: 500, gateway: 'JazzCash' },
  { phone: '0340-***5678', amount: 2000, gateway: 'EasyPaisa' },
  { phone: '0306-***9012', amount: 4000, gateway: 'EasyPaisa' },
  { phone: '0338-***3456', amount: 16000, gateway: 'JazzCash' },
  { phone: '0318-***7890', amount: 2000, gateway: 'EasyPaisa' },
  { phone: '0341-***1234', amount: 8000, gateway: 'JazzCash' }
];

const LiveWithdrawalTicker = () => {
  const [items, setItems] = useState(BASE_LIVE_STREAM);

  useEffect(() => {
    const fetchLivePayouts = async () => {
      try {
        const res = await api.get('/transactions/live-payouts');
        if (res.data.success && res.data.payouts && res.data.payouts.length > 0) {
          // Merge real payouts at the start
          setItems([...res.data.payouts, ...BASE_LIVE_STREAM]);
        }
      } catch (err) {
        // Fallback to base stream
      }
    };
    fetchLivePayouts();
  }, []);

  // Duplicate items twice to ensure continuous 100% infinite marquee loop with zero gaps
  const marqueeItems = [...items, ...items];

  return (
    <div className="bg-slate-900/95 text-slate-300 border-y border-slate-800/80 overflow-hidden py-1 select-none">
      <div className="flex items-center">
        {/* Fixed Live Indicator Badge */}
        <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-600 text-white rounded-r-full font-bold text-[9.5px] tracking-wider uppercase shadow-xs z-10">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
          </span>
          <span>Live Payouts</span>
        </div>

        {/* 24/7 Infinite Seamless Streaming Marquee */}
        <div className="flex overflow-hidden whitespace-nowrap w-full">
          <div className="animate-infinite-ticker flex items-center gap-3 text-[10.5px] font-medium">
            {marqueeItems.map((item, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/60 shadow-2xs shrink-0"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                <span className="font-mono text-slate-200 font-bold">{item.phone}</span>
                <span className="text-slate-400 font-normal">cashed out</span>
                <span className="font-bold text-emerald-400">Rs. {Number(item.amount).toLocaleString()}</span>
                <span
                  className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded ${
                    item.gateway === 'EasyPaisa'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
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
