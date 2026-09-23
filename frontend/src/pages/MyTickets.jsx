import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import {
  HelpCircle,
  PlusCircle,
  Clock,
  CheckCircle2,
  MessageSquare,
  Loader2
} from 'lucide-react';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/support/my-tickets');
        if (res.data.success) {
          setTickets(res.data.tickets);
        }
      } catch (err) {
        console.error('Failed to load tickets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4">
      {/* Top Back Navigation */}
      <PageHeader
        title="My Support Tickets"
        subtitle="Check official admin responses and resolutions"
        backTo="/dashboard"
        rightAction={
          <Link
            to="/support"
            className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Ticket</span>
          </Link>
        }
      />

      {/* Tickets List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            <span>Loading support tickets...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl p-6 border border-slate-200 text-slate-400 text-xs font-medium">
            No support tickets submitted yet. If you have any issue with deposits or plans, click "New Ticket".
          </div>
        ) : (
          tickets.map((t) => (
            <div
              key={t.id}
              className="bg-white p-4 rounded-2xl space-y-2.5 text-xs border border-slate-200 shadow-2xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-black text-slate-900 text-xs sm:text-sm">{t.subject}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Submitted: {new Date(t.createdAt).toLocaleString()}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    t.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {t.status === 'RESOLVED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {t.status}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-slate-700 font-medium">
                <p>{t.message}</p>
              </div>

              {t.reply ? (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-900">
                  <span className="font-bold text-[11px] text-emerald-800 block mb-0.5">
                    ✓ Official Admin Response:
                  </span>
                  <p>{t.reply}</p>
                </div>
              ) : (
                <div className="text-[11px] text-amber-700 font-medium italic flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Awaiting admin response (usually 15-30 mins)</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyTickets;
