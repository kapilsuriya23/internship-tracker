import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Feature = ({ icon, label }) => (
  <div className="neu iris-border flex items-center gap-2.5 px-4 py-2.5"
    style={{ borderRadius: 12 }}>
    <span style={{ fontSize: 16 }}>{icon}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: '#8b8aad' }}>{label}</span>
  </div>
);

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Floating orbs */}
      <div style={{
        position: 'fixed', top: '15%', left: '10%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
      }} className="animate-float" />
      <div style={{
        position: 'fixed', top: '50%', right: '5%',
        width: 250, height: 250, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,165,233,0.12), transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
        animationDelay: '2s',
      }} className="animate-float" />
      <div style={{
        position: 'fixed', bottom: '15%', left: '30%',
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(244,114,182,0.1), transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
        animationDelay: '1s',
      }} className="animate-float" />

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(18,18,31,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(167,139,250,0.08)',
      }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
            }}>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L4.09 12.96a.5.5 0 0 0 .41.54H11l-2 9 8.91-10.96a.5.5 0 0 0-.41-.54H11l2-9z"/>
              </svg>
            </div>
            <span className="font-bold text-lg iris-text">InternTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="neu-btn text-sm px-4 py-2" style={{ color: '#8b8aad' }}>Login</Link>
            <Link to={isAuthenticated ? '/dashboard' : '/register'}
              className="iris-btn text-sm font-bold px-5 py-2.5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center"
        style={{ position: 'relative', zIndex: 1 }}>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 neu iris-border px-4 py-2 mb-10 animate-fade-up"
          style={{ borderRadius: 30 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
            boxShadow: '0 0 8px rgba(167,139,250,0.8)',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa',
            letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Internship Command Center
          </span>
        </div>

        <h1 className="font-black animate-fade-up delay-1"
          style={{ fontSize: 'clamp(40px, 7vw, 72px)', lineHeight: 1.08,
            letterSpacing: '-0.03em', opacity: 0, marginBottom: 24 }}>
          <span style={{ color: '#e2e0ff' }}>Never lose track of</span>
          <br />
          <span className="iris-text">an internship again.</span>
        </h1>

        <p className="animate-fade-up delay-2"
          style={{ opacity: 0, fontSize: 18, color: '#8b8aad', lineHeight: 1.7,
            maxWidth: 480, margin: '0 auto 40px' }}>
          Kanban board, analytics dashboard, and automated deadline reminders — everything you need to land the role.
        </p>

        <div className="flex items-center justify-center gap-4 animate-fade-up delay-3"
          style={{ opacity: 0, marginBottom: 64, flexWrap: 'wrap' }}>
          <Link to="/register" className="iris-btn font-bold text-sm px-8 py-4"
            style={{ borderRadius: 14, fontSize: 15 }}>
            Start Tracking Free
          </Link>
          <Link to="/login" className="neu-btn text-sm font-semibold px-6 py-4"
            style={{ color: '#8b8aad', borderRadius: 14 }}>
            Sign In →
          </Link>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-3 animate-fade-up delay-4" style={{ opacity: 0 }}>
          {[
            { icon: '🔐', label: 'JWT Secured'       },
            { icon: '🎯', label: 'Kanban Board'       },
            { icon: '📊', label: 'Analytics'          },
            { icon: '⏰', label: 'Email Reminders'    },
            { icon: '📍', label: 'Location Tracking'  },
            { icon: '✉️', label: 'Recruiter Contacts' },
          ].map(f => <Feature key={f.label} {...f} />)}
        </div>
      </main>
    </div>
  );
}