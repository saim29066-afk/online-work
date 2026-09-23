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

  const handlePhoneOrEmailChange = (e) => {
    let val = e.target.value;
    // If the input starts with digits (e.g. phone number 03...), restrict strictly to max 11 digits
    if (/^\d+$/.test(val)) {
      val = val.slice(0, 11);
    }
    setPhoneOrEmail(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneOrEmail || !password) {
      setError('Please fill in both fields');
      return;
    }

    // If user entered numbers (phone), ensure it is 11 digits
    if (/^\d+$/.test(phoneOrEmail) && phoneOrEmail.length !== 11) {
      setError('Mobile number must be exactly 11 digits (e.g. 03001234567)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login(phoneOrEmail, password);
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
        <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-lg relative bg-white">
          <div className="text-center mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2 text-emerald-700 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Student Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Access your investment wallet & daily bonus collection room
            </p>
          </div>

          {error && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number (11 Digits) or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={phoneOrEmail.includes('@') ? 100 : 11}
                  placeholder="e.g. 03123456789 or email"
                  value={phoneOrEmail}
                  onChange={handlePhoneOrEmailChange}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:underline">
              Register Free (+Rs. 250 Bonus)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
