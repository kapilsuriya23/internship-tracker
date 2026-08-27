import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 16, position: 'relative' }}>

      <div style={{
        position: 'fixed', bottom: '20%', right: '10%', width: 260, height: 260,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,165,233,0.12), transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none',
      }} className="animate-float" />

      <div className="w-full animate-fade-up" style={{ maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 20 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(124,58,237,0.45)',
            }}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L4.09 12.96a.5.5 0 0 0 .41.54H11l-2 9 8.91-10.96a.5.5 0 0 0-.41-.54H11l2-9z"/>
              </svg>
            </div>
            <span className="font-bold text-xl iris-text">InternTrack</span>
          </Link>
          <h1 className="font-black" style={{ fontSize: 28, color: '#e2e0ff', letterSpacing: '-0.02em' }}>
            Create account
          </h1>
          <p style={{ color: '#8b8aad', fontSize: 14, marginTop: 6 }}>Start tracking your internships</p>
        </div>

        <div className="neu iris-border" style={{ padding: 32, borderRadius: 22 }}>
          {error && (
            <div style={{
              marginBottom: 20, padding: '12px 16px', borderRadius: 12,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#fca5a5', fontSize: 14, fontWeight: 500,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { name: 'name',     type: 'text',     label: 'Full Name', placeholder: 'Kapil Suriya'         },
              { name: 'email',    type: 'email',    label: 'Email',     placeholder: 'you@example.com'       },
              { name: 'password', type: 'password', label: 'Password',  placeholder: 'Min 6 characters'      },
            ].map(f => (
              <div key={f.name}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: '#8b8aad', marginBottom: 8 }}>{f.label}</label>
                <input name={f.name} type={f.type} value={form[f.name]} onChange={handle}
                  placeholder={f.placeholder} required className="neu-input"
                  minLength={f.name === 'password' ? 6 : undefined} />
              </div>
            ))}
            <button type="submit" disabled={loading} className="iris-btn"
              style={{ padding: '14px', borderRadius: 12, fontSize: 15, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#8b8aad' }}>
            Have an account?{' '}
            <Link to="/login" style={{ color: '#a78bfa', fontWeight: 700, textDecoration: 'none' }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}