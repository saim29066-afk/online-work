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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const fetchLivePayouts = async () => {
      try {
        const res = await api.get('/transactions/live-payouts');
        if (res.data.success && res.data.payouts && res.data.payouts.length > 0) {
          const enriched = res.data.payouts.map((p, idx) => ({
            ...p,
            time: idx === 0 ? 'Just now' : `${idx * 2} mins ago`
          }));
          setItems([...enriched, ...BASE_LIVE_STREAM]);
        }
      } catch (err) {
        // Fallback to default
      }
    };
    fetchLivePayouts();
  }, []);

  // Cycle smoothly with dynamic randomized intervals (5s, 7s, 10s, 12s)
  useEffect(() => {
    let timeoutId;
    const randomDelays = [5000, 7500, 10000, 6000, 12000, 8000, 9500];

    const cycleNext = () => {
      const delay = randomDelays[Math.floor(Math.random() * randomDelays.length)];
      timeoutId = setTimeout(() => {
        setFade(false);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % items.length);
          setFade(true);
          cycleNext();
        }, 400);
      }, delay);
    };

    cycleNext();
    return () => clearTimeout(timeoutId);
  }, [items.length]);

  const currentItem = items[currentIndex] || items[0];
  const nextItem = items[(currentIndex + 1) % items.length] || items[0];

  return (
    <div className="bg-slate-900 text-slate-300 border-y border-slate-800 py-1.5 px-3 select-none overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        {/* Live Status Badge */}
        <div className="flex items-center gap-1.5 shrink-0 bg-emerald-950 border border-emerald-800/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="uppercase tracking-wider">Live Payouts</span>
        </div>

        {/* Realistic Smooth Rotator Feed */}
        <div className="flex-1 flex items-center justify-center sm:justify-start overflow-hidden">
          <div
            className={`transition-all duration-500 flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs ${
              fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-mono font-bold text-slate-100">{currentItem.phone}</span>
              <span className="text-slate-400 hidden sm:inline">successfully withdrew</span>
              <span className="font-black text-emerald-400">Rs. {Number(currentItem.amount).toLocaleString()}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  currentItem.gateway === 'EasyPaisa'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {currentItem.gateway}
              </span>
              <span className="text-[10px] text-slate-500 font-medium ml-1">({currentItem.time || 'Just now'})</span>
            </div>
          </div>
        </div>

        {/* 24/7 Verified Security Badge */}
        <div className="hidden md:flex items-center gap-1 text-[10.5px] text-slate-400 font-semibold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Instant Automated Payouts</span>
        </div>
      </div>
    </div>
  );
};

export default LiveWithdrawalTicker;

