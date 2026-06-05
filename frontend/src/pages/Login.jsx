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

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

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

  const inputStyle = {
    width: '100%', background: '#111827',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, padding: '13px 16px',
    color: '#e2e8f0', fontSize: 14,
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0d1117' }}>
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="icon-badge" style={{ background: '#4b7cf3', width: 40, height: 40, borderRadius: 12 }}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L4.09 12.96a.5.5 0 0 0 .41.54H11l-2 9 8.91-10.96a.5.5 0 0 0-.41-.54H11l2-9z"/>
              </svg>
            </div>
            <span className="font-bold text-xl text-white">InternTrack</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white mb-1">Welcome back</h1>
          <p className="text-sm" style={{ color: '#6b7a99' }}>Sign in to your account</p>
        </div>

        <div style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 32 }}>
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7a99', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Email
              </label>
              <input name="email" type="email" value={form.email} onChange={handle}
                placeholder="you@example.com" required autoComplete="email" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(75,124,243,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7a99', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Password
              </label>
              <input name="password" type="password" value={form.password} onChange={handle}
                placeholder="••••••••" required autoComplete="current-password" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(75,124,243,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', marginTop: 4,
              background: 'linear-gradient(135deg, #4b7cf3, #3a6be0)',
              color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 700, fontSize: 14, padding: '14px',
              borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: '0 4px 20px rgba(75,124,243,0.35)', transition: 'opacity 0.2s'
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: '#6b7a99' }}>
            No account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#4b7cf3' }}>Create one →</Link>
          </p>
        </div>
      </div>

      <div className="fixed top-1/3 right-1/4 w-64 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(75,124,243,0.06) 0%, transparent 70%)' }} />
    </div>
  );
}