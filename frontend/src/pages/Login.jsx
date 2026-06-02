import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-ink-muted border border-white/8 rounded-2xl px-5 py-4 text-frost text-sm font-body placeholder-frost/20 focus:border-volt/50 transition-colors duration-200";

  return (
    <div className="noise-bg min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <span className="w-7 h-7 bg-volt rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-ink" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L4.09 12.96a.5.5 0 0 0 .41.54H11l-2 9 8.91-10.96a.5.5 0 0 0-.41-.54H11l2-9z"/>
              </svg>
            </span>
            <span className="font-display font-700 text-lg text-frost">InternTrack</span>
          </Link>
          <h1 className="font-display font-700 text-3xl text-frost mb-2">Welcome back</h1>
          <p className="text-frost/40 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-ink-soft border border-white/6 rounded-3xl p-8">
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-display font-600 tracking-widest text-frost/40 uppercase mb-2">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" required autoComplete="email" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-display font-600 tracking-widest text-frost/40 uppercase mb-2">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="••••••••" required autoComplete="current-password" className={inputClass} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-2 bg-volt text-ink font-display font-700 text-sm tracking-wide py-4 rounded-2xl hover:bg-volt-dark transition-colors duration-200 disabled:opacity-60 shadow-lg shadow-volt/15">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-frost/30 text-sm">
            No account?{' '}
            <Link to="/register" className="text-volt hover:text-volt-dark transition-colors font-600">
              Create one →
            </Link>
          </p>
        </div>
      </div>

      <div className="fixed top-1/3 right-1/4 w-64 h-64 bg-volt/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}