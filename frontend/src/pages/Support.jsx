import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import {
  HelpCircle,
  Send,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Mail,
  MessageSquare
} from 'lucide-react';

const Support = () => {
  const { user, isAuthenticated } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      const resSettings = await api.get('/transactions/gateway-info');
      if (resSettings.data.success) {
        setSettings(resSettings.data.settings);
      }

      if (isAuthenticated) {
        const resTickets = await api.get('/support/my-tickets');
        if (resTickets.data.success) {
          setTickets(resTickets.data.tickets);
        }
      }
    } catch (err) {
      console.error('Failed to load support data:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !message) return;

    setLoading(true);
    setFeedback({ text: '', type: '' });

    try {
      const res = await api.post('/support', { subject, message });
      if (res.data.success) {
        setFeedback({ text: res.data.message, type: 'success' });
        setSubject('');
        setMessage('');
        fetchData();
      }
    } catch (err) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to submit support ticket',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const whatsappNumber = settings?.supportWhatsapp || '03218956397';
  let cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, '');
  if (cleanWhatsapp.startsWith('03')) {
    cleanWhatsapp = '92' + cleanWhatsapp.substring(1);
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4">
      {/* Top Back Navigation */}
      <PageHeader
        title="Student Helpdesk"
        subtitle="24/7 assistance for deposits, plan activations, and cashouts"
        backTo="/dashboard"
      />

      {/* Direct Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* WhatsApp Card */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-emerald-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Direct WhatsApp Help</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              Chat live with our student manager for instant deposit / cashout support.
            </p>
          </div>
          <a
            href={`https://api.whatsapp.com/send?phone=${cleanWhatsapp}&text=Hello%20Student%20Invest%20Support!`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition-all"
          >
            <span>Open WhatsApp ({whatsappNumber})</span>
          </a>
        </div>

        {/* Email / Official Desk */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-2">
              <Mail className="w-4 h-4 text-slate-700" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Email Assistance</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              Send detailed inquiries or student account verification requests.
            </p>
          </div>
          <a
            href={`mailto:${settings?.supportEmail || 'support@studentinvest.pk'}`}
            className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] border border-slate-200 flex items-center justify-center gap-1 transition-colors"
          >
            <span>{settings?.supportEmail || 'support@studentinvest.pk'}</span>
          </a>
        </div>
      </div>

      {/* Ticket Form */}
      {isAuthenticated && (
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">Create Support Ticket</h3>
            <p className="text-[10.5px] text-slate-500">
              Submit a question to the admin team. We reply within 15-30 minutes.
            </p>
          </div>

          {feedback.text && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-semibold">{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject / Issue Topic
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Deposit TID confirmation, withdrawal question"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Message Details
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe your question or issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Past Tickets */}
      {isAuthenticated && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-slate-900">My Tickets & Admin Replies</h3>

          {loadingTickets ? (
            <div className="text-center py-6 text-xs text-slate-400">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 font-medium">No support tickets submitted yet.</div>
          ) : (
            <div className="space-y-2.5">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{t.subject}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium">{t.message}</p>
                  {t.reply && (
                    <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <span className="font-bold text-[10px] block text-emerald-800">✓ Admin Reply:</span>
                      <p className="mt-0.5">{t.reply}</p>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block pt-0.5 font-mono">
                    {new Date(t.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Support;
