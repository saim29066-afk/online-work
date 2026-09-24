import React from 'react';
import { TrendingUp, ShieldCheck, HeartHandshake } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-8 pb-20 lg:pb-8 text-slate-500 text-xs mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white stroke-[2.5]" />
              </div>
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                STUDENT<span className="text-emerald-600">INVEST</span> HUB
              </span>
            </div>
            <p className="text-slate-500 max-w-sm text-[11px] leading-relaxed">
              Pakistan's trusted investment & earning platform for college & university students. Guaranteed daily bonus payouts and instant referral commissions.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> 100% Verified Manual Slips
              </span>
              <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold text-[10px] flex items-center gap-1">
                <HeartHandshake className="w-3 h-3" /> 24/7 Student Helpline
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold text-[11px] tracking-wider uppercase mb-2">Payment Gateways</h4>
            <div className="space-y-1 text-[11px]">
              <p>• EasyPaisa (Telenor Bank)</p>
              <p>• JazzCash (Mobilink Microfinance)</p>
              <p>• Manual TID Slip Verification</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <p>© 2026 Student Invest Hub. Built for Pakistani Students.</p>
          <p className="mt-1 sm:mt-0">Fast • Reliable • Permanent Storage</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
