import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PlanCard from '../components/PlanCard';
import { Sparkles, ShieldCheck, Zap, Users, Loader2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const Plans = () => {
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_plans');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [investments, setInvestments] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_investments');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('cached_plans');
  });

  const fetchData = async () => {
    try {
      const promises = [api.get('/plans')];
      if (isAuthenticated) {
        promises.push(api.get('/plans/my-investments'));
      }
      const [resPlans, resInvs] = await Promise.all(promises);

      if (resPlans.data.success && Array.isArray(resPlans.data.plans)) {
        setPlans(resPlans.data.plans);
        localStorage.setItem('cached_plans', JSON.stringify(resPlans.data.plans));
      }
      if (resInvs && resInvs.data.success && Array.isArray(resInvs.data.investments)) {
        setInvestments(resInvs.data.investments);
        localStorage.setItem('cached_investments', JSON.stringify(resInvs.data.investments));
      }
    } catch (err) {
      console.error('Failed to load plans or investments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold mb-1">
          <Sparkles className="w-3 h-3 text-emerald-600" /> Guaranteed Daily Returns
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900">
          Student Investment Plans
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Select any tier to collect daily income. Every tier gives you <strong className="text-amber-800">50% instant cash</strong> for every invited friend!
        </p>
      </div>

      {/* Plan Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <p className="text-xs">Loading plans...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onPlanPurchased={fetchData}
              userInvestments={investments}
            />
          ))}
        </div>
      )}

      {/* Guarantee Footnote (Compact) */}
      <div className="glass-card p-3 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-[11px]">Daily 24h Payouts</p>
            <p className="text-slate-500 text-[10px]">Collect daily returns on time.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-[11px]">50% Cash Bonus</p>
            <p className="text-slate-500 text-[10px]">Instant referral cash reward.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-[11px]">EasyPaisa / JazzCash</p>
            <p className="text-slate-500 text-[10px]">Fast deposits & withdrawals.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
