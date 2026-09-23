import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import {
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  User,
  Phone
} from 'lucide-react';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [replyingId, setReplyingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support/admin/tickets');
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleReply = async (id) => {
    const text = replyText[id];
    if (!text) return;

    setReplyingId(id);
    setMessage({ text: '', type: '' });

    try {
      const res = await api.post(`/support/admin/tickets/${id}/reply`, { reply: text });
      if (res.data.success) {
        setMessage({ text: res.data.message, type: 'success' });
        setReplyText((prev) => ({ ...prev, [id]: '' }));
        await fetchTickets();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to reply to ticket',
        type: 'error'
      });
    } finally {
      setReplyingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4">
      {/* Top Back Navigation */}
      <PageHeader
        title="Student Helpdesk Inquiries"
        subtitle="Review student support tickets and send official resolutions"
        backTo="/admin"
        rightAction={
          <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold font-mono">
            Tickets: {tickets.length}
          </span>
        }
      />

      {message.text && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Loading support inquiries...</span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs bg-white rounded-2xl border border-slate-200 font-medium">
          No support inquiries from students yet.
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{t.subject}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    From: <strong className="text-slate-900">{t.user?.name}</strong> ({t.user?.phone})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      t.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {t.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(t.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-slate-800 font-medium">
                <p>{t.message}</p>
              </div>

              {/* Reply if present */}
              {t.reply && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-900">
                  <span className="font-bold text-[11px] text-emerald-800 block mb-0.5">Admin Reply Sent:</span>
                  <p>{t.reply}</p>
                </div>
              )}

              {/* Reply input */}
              <div className="pt-1 flex gap-2">
                <input
                  type="text"
                  placeholder={t.reply ? 'Send an updated reply...' : 'Type response to student...'}
                  value={replyText[t.id] || ''}
                  onChange={(e) =>
                    setReplyText((prev) => ({ ...prev, [t.id]: e.target.value }))
                  }
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleReply(t.id)}
                  disabled={replyingId === t.id || !replyText[t.id]}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
                >
                  {replyingId === t.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Reply</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
