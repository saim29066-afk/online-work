import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PlanCard from '../components/PlanCard';
import {
  TrendingUp,
  ShieldCheck,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
  Smartphone,
  Gift,
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const DEFAULT_PLANS = [
  { id: 1, name: 'Student Starter', price: 1000, dailyBonus: 100, durationDays: 50, referralBonusPercent: 50, badge: 'Popular', features: ['Daily Rs. 100 guaranteed return', '50 Days validity', '50% referral commission'] },
  { id: 2, name: 'Student Standard', price: 2000, dailyBonus: 200, durationDays: 50, referralBonusPercent: 50, badge: 'Best Value', features: ['Daily Rs. 200 guaranteed return', '50 Days validity', '50% referral commission'] },
  { id: 3, name: 'Student Silver', price: 4000, dailyBonus: 400, durationDays: 50, referralBonusPercent: 50, badge: 'Silver', features: ['Daily Rs. 400 guaranteed return', '50 Days validity', '50% referral commission'] },
  { id: 4, name: 'Student Gold', price: 8000, dailyBonus: 800, durationDays: 50, referralBonusPercent: 50, badge: 'Gold VIP', features: ['Daily Rs. 800 guaranteed return', '50 Days validity', '50% referral commission'] },
  { id: 5, name: 'Student Diamond', price: 12000, dailyBonus: 1200, durationDays: 50, referralBonusPercent: 50, badge: 'Diamond Elite', features: ['Daily Rs. 1,200 guaranteed return', '50 Days validity', '50% referral commission'] }
];

import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_plans');
      return cached ? JSON.parse(cached) : DEFAULT_PLANS;
    } catch {
      return DEFAULT_PLANS;
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
  const [loadingPlans, setLoadingPlans] = useState(false);

  const fetchHomeData = async () => {
    try {
      const promises = [api.get('/plans')];
      if (isAuthenticated) {
        promises.push(api.get('/plans/my-investments'));
      }
      const [resPlans, resInvs] = await Promise.all(promises);

      if (resPlans.data.success && Array.isArray(resPlans.data.plans)) {
        setPlans(resPlans.data.plans);
        try {
          localStorage.setItem('cached_plans', JSON.stringify(resPlans.data.plans));
        } catch {}
      }
      if (resInvs && resInvs.data.success && Array.isArray(resInvs.data.investments)) {
        setInvestments(resInvs.data.investments);
        try {
          localStorage.setItem('cached_investments', JSON.stringify(resInvs.data.investments));
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load home plans:', err);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [isAuthenticated]);

  return (
    <div className="space-y-10 py-6 sm:py-10 bg-white">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto px-4">
        {/* Rs. 150 Free Signup Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Rs. 150 Free Welcome Bonus on New Signup!</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
          University & College Student <br className="hidden sm:inline" />
          <span className="text-emerald-600">Daily Earning & Investment App</span>
        </h1>

        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed mb-6">
          Activate affordable student plans, collect guaranteed daily returns, and receive <span className="text-amber-700 font-bold">50% instant cash commission</span> for every friend who joins!
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-xs mx-auto">
          <Link
            to="/register"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>Register & Get Rs. 150 Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-300 transition-colors flex items-center justify-center"
          >
            Sign In
          </Link>
        </div>

        {/* 4 Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 text-left">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <Zap className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
            <p className="text-slate-900 font-bold text-[11px]">Daily Bonus</p>
            <p className="text-slate-500 text-[9.5px]">Collect return every 24h</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <Gift className="w-3.5 h-3.5 text-amber-600 mb-0.5" />
            <p className="text-slate-900 font-bold text-[11px]">50% Referral</p>
            <p className="text-slate-500 text-[9.5px]">Instant cash reward</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <Smartphone className="w-3.5 h-3.5 text-teal-600 mb-0.5" />
            <p className="text-slate-900 font-bold text-[11px]">EasyPaisa / JazzCash</p>
            <p className="text-slate-500 text-[9.5px]">Fast slip approvals</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 mb-0.5" />
            <p className="text-slate-900 font-bold text-[11px]">Permanent Data</p>
            <p className="text-slate-500 text-[9.5px]">Safe wallet & records</p>
          </div>
        </div>
      </section>

      {/* Student Investment Plans Section on Home */}
      <section className="max-w-5xl mx-auto px-3 sm:px-4">
        <div className="text-center max-w-xl mx-auto mb-4">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[9.5px] font-bold mb-1 border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-600" /> Student Friendly Tiers
          </div>
          <h2 className="text-base sm:text-xl font-bold text-slate-900">Student Investment Plans</h2>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Choose from Starter to Elite plans with guaranteed daily profit and 50% referral commission.
          </p>
        </div>

        {loadingPlans ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onPlanPurchased={fetchHomeData}
                userInvestments={investments}
              />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="text-center max-w-xl mx-auto mb-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">How It Works (4 Simple Steps)</h2>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Transparent and easy to start for all Pakistani students.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center mb-1">
              1
            </div>
            <h3 className="text-[11px] font-bold text-slate-900 mb-0.5">Register Account</h3>
            <p className="text-[9.5px] text-slate-500 leading-tight">
              Sign up in 30 seconds and receive instant Rs. 150 welcome bonus.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="w-5 h-5 rounded-md bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center mb-1">
              2
            </div>
            <h3 className="text-[11px] font-bold text-slate-900 mb-0.5">Deposit Funds</h3>
            <p className="text-[9.5px] text-slate-500 leading-tight">
              Send money to EasyPaisa/JazzCash and upload transaction slip.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="w-5 h-5 rounded-md bg-cyan-100 text-cyan-800 font-bold text-[10px] flex items-center justify-center mb-1">
              3
            </div>
            <h3 className="text-[11px] font-bold text-slate-900 mb-0.5">Activate Plan</h3>
            <p className="text-[9.5px] text-slate-500 leading-tight">
              Choose your plan and collect daily income every 24h.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center mb-1">
              4
            </div>
            <h3 className="text-[11px] font-bold text-slate-900 mb-0.5">Invite & Cashout</h3>
            <p className="text-[9.5px] text-slate-500 leading-tight">
              Invite 1 active friend to cashout directly to your wallet.
            </p>
          </div>
        </div>
      </section>

      {/* 50% Referral Highlight Banner */}
      <section className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[9px] uppercase tracking-wider">
              50% Cash Bonus Program
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
              Earn 50% Cash Every Time a Friend Activates a Plan
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 max-w-lg">
              When your friend activates the Rs. 1,000 plan, you get <strong className="text-emerald-700">Rs. 500</strong> directly in your wallet!
            </p>
          </div>
          <Link
            to="/register"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs shrink-0"
          >
            Start Earning Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
