import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Phone, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react';

const Login = () => {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const sanitizePhone = (val) => {
    if (!val) return '';
    let digits = String(val).trim().replace(/\D/g, '');
    if (digits.startsWith('0092')) {
      digits = '0' + digits.slice(4);
    } else if (digits.startsWith('92') && digits.length >= 11) {
      digits = '0' + digits.slice(2);
    } else if (digits.length === 10 && digits.startsWith('3')) {
      digits = '0' + digits;
    }
    return digits;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneOrEmail.trim() || !password) {
      setError('Please fill in both mobile number and password');
      return;
    }

    const cleanInput = phoneOrEmail.trim();
    const cleanPhone = sanitizePhone(cleanInput);
    const identifier = (cleanPhone.length === 11 && cleanPhone.startsWith('03')) ? cleanPhone : cleanInput;

    setLoading(true);
    setError('');

    try {
      const data = await login(identifier, password);
      if (data.success) {
        if (data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-md relative bg-white">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter your mobile number and password
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Mobile Number (11 Digits)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={phoneOrEmail.includes('@') ? 80 : 11}
                  placeholder="03XXXXXXXXX (11 digits) or Email"
                  value={phoneOrEmail}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val.includes('@') && /^\d+$/.test(val)) {
                      setPhoneOrEmail(val.slice(0, 11));
                    } else {
                      setPhoneOrEmail(val);
                    }
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-mono font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs sm:text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:underline">
              Register Free (+Rs. 150 Bonus)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
