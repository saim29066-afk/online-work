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
  const [animPhase, setAnimPhase] = useState('active'); // 'active' | 'exit-left' | 'enter-right'

  useEffect(() => {
    const fetchLivePayouts = async () => {
      try {
        const res = await api.get('/transactions/live-payouts');
        if (res.data.success && res.data.payouts && res.data.payouts.length > 0) {
          setItems([...res.data.payouts, ...BASE_LIVE_STREAM]);
        }
      } catch (err) {
        // Fallback to base
      }
    };
    fetchLivePayouts();
  }, []);

  // Smooth right-to-left slide transition every 7 seconds (6-8s)
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Slide current notification out to the left
      setAnimPhase('exit-left');

      setTimeout(() => {
        // 2. Load next notification and position it off-screen right
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setAnimPhase('enter-right');

        // 3. Slide next notification smoothly in from the right to center
        setTimeout(() => {
          setAnimPhase('active');
        }, 60);
      }, 500); // 500ms slide-out
    }, 7000); // 7s interval

    return () => clearInterval(timer);
  }, [items.length]);

  const currentItem = items[currentIndex] || items[0];

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 py-1.5 select-none overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between gap-2">
        {/* Fixed Live Indicator Badge */}
        <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-600/90 text-white font-black text-[10px] tracking-wider uppercase shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span>Live Payouts</span>
        </div>

        {/* Natural Timed Withdrawal Notification Card (Slides Right to Left every 7 seconds) */}
        <div className="flex-1 flex items-center justify-center overflow-hidden relative min-h-[26px]">
          <div
            className={`flex items-center gap-2 text-[11px] sm:text-xs font-medium ${
              animPhase === 'exit-left'
                ? 'transition-all duration-500 ease-in-out transform -translate-x-full opacity-0 pointer-events-none'
                : animPhase === 'enter-right'
                ? 'transform translate-x-full opacity-0 pointer-events-none'
                : 'transition-all duration-500 ease-out transform translate-x-0 opacity-100'
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
            <span className="font-mono text-slate-100 font-bold tracking-tight">{currentItem.phone}</span>
            <span className="text-slate-400 hidden xs:inline">received</span>
            <span className="font-black text-emerald-400">Rs. {Number(currentItem.amount).toLocaleString()}</span>
            <span
              className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                currentItem.gateway === 'EasyPaisa'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {currentItem.gateway}
            </span>
            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
              ({currentItem.time || 'Just now'})
            </span>
          </div>
        </div>

        {/* Real-time Status Counter */}
        <div className="hidden md:flex items-center gap-1 text-[10px] text-slate-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Automatic 24/7 Processing</span>
        </div>
      </div>
    </div>
  );
};

export default LiveWithdrawalTicker;

