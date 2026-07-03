import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Building, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const { loginUser, isAuthenticated, user, error: authError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/resident/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await loginUser(email, password);
      if (data.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/resident/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      {/* Decorative Blur Spheres */}
      <div class="absolute w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl -top-10 -left-10 animate-pulse"></div>
      <div class="absolute w-80 h-80 bg-purple-600/20 rounded-full blur-3xl -bottom-10 -right-10 animate-pulse delay-700"></div>

      <div class="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div class="text-center mb-8">
          <div class="inline-flex bg-indigo-600/20 text-indigo-400 p-3.5 rounded-2xl mb-4 border border-indigo-500/20 shadow-inner">
            <Building class="h-8 w-8" />
          </div>
          <h2 class="text-3xl font-extrabold tracking-tight text-white font-sans">Welcome Back</h2>
          <p class="text-slate-400 text-sm mt-2">Manage and track your society affairs</p>
        </div>

        {error && (
          <div class="mb-6 flex items-start gap-3 bg-rose-950/30 border border-rose-900/50 p-4 rounded-xl text-rose-300 text-sm">
            <AlertCircle class="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} class="space-y-6">
          <div>
            <label class="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2" for="email">
              Email Address
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail class="h-5 w-5" />
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                class="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-slate-300 text-xs font-semibold uppercase tracking-wider" for="password">
                Password
              </label>
            </div>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock class="h-5 w-5" />
              </span>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                class="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            class="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.98] cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 class="h-5 w-5 animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p class="text-sm text-slate-400">
            Resident and new to the portal?{' '}
            <Link to="/register" class="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
