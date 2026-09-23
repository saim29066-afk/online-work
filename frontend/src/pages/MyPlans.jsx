import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import {
  Layers,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  PlusCircle,
  Loader2
} from 'lucide-react';

const MyPlans = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestments = async () => {
    try {
      const res = await api.get('/plans/my-investments');
      if (res.data.success) {
        setInvestments(res.data.investments);
      }
    } catch (err) {
      console.error('Failed to load investments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const activePlans = investments.filter((i) => i.status === 'ACTIVE');
  const completedPlans = investments.filter((i) => i.status === 'COMPLETED');
  const totalDailyProfit = activePlans.reduce((acc, curr) => acc + curr.dailyBonus, 0);
  const totalInvestedAmount = investments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4 bg-white">
      {/* Mobile-Native Back Button Header */}
      <PageHeader
        title="My Plans & ROI"
        subtitle="Active investment packages and daily profit returns"
        backTo="/dashboard"
        rightAction={
          <Link
            to="/dashboard"
            className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Buy Plan
          </Link>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-600 block font-bold">Active Plans</span>
          <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block">{activePlans.length}</span>
          <span className="text-[9px] text-emerald-700 font-bold block">Currently Earning</span>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <span className="text-[10px] text-emerald-900 block font-bold">Daily Profit</span>
          <span className="text-sm sm:text-base font-bold text-emerald-700 mt-0.5 block">Rs. {totalDailyProfit}</span>
          <span className="text-[9px] text-emerald-800 font-semibold block">Per 24 Hours</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-600 block font-bold">Total Invested</span>
          <span className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block">Rs. {totalInvestedAmount.toLocaleString()}</span>
          <span className="text-[9px] text-slate-500 font-medium block">All Plans</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-600 block font-bold">Completed</span>
          <span className="text-sm sm:text-base font-bold text-slate-700 mt-0.5 block">{completedPlans.length}</span>
          <span className="text-[9px] text-slate-500 font-medium block">Full Cycle</span>
        </div>
      </div>

      {/* Active Plans List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            Active Subscriptions ({activePlans.length})
          </h2>
          <Link
            to="/daily-bonus"
            className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
          >
            Claim Daily Bonus →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-600 text-xs font-semibold">Loading plans...</div>
        ) : activePlans.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
            <Layers className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No active plans found</p>
            <p className="text-[10.5px] text-slate-500 max-w-sm mx-auto">
              You haven't activated any plan yet. Start with our Level 0 Free Starter or Level 1 Bronze plan!
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 mt-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] shadow-xs"
            >
              <span>Explore Plans</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activePlans.map((inv) => {
              const progress = Math.min(100, Math.round((inv.daysClaimed / inv.durationDays) * 100));
              const remainingDays = Math.max(0, inv.durationDays - inv.daysClaimed);

              return (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                        ACTIVE
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                        {inv.plan?.name || 'Investment Plan'}
                      </h3>
                      <p className="text-[11px] font-bold text-emerald-700">
                        Rs. {inv.dailyBonus} / Day
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">
                        Rs. {Number(inv.amount).toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-500 block">Package Cost</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-700">
                      <span>Progress: {inv.daysClaimed} / {inv.durationDays} Days</span>
                      <span className="text-emerald-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[9.5px] text-slate-500 font-medium block">
                      {remainingDays} days remaining of guaranteed ROI
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Plans */}
      {completedPlans.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
            Completed Plans ({completedPlans.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {completedPlans.map((inv) => (
              <div
                key={inv.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between opacity-80"
              >
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{inv.plan?.name}</h3>
                  <p className="text-[11px] text-slate-500">
                    Claimed all {inv.durationDays} days profit
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                  COMPLETED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPlans;
