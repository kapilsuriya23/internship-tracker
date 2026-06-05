import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Feature = ({ icon, label }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
    style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.06)', color: '#a3b0cc' }}>
    <span>{icon}</span>{label}
  </div>
);

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      {/* Nav */}
      <nav style={{ background: '#131929', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        className="sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="icon-badge" style={{ background: '#4b7cf3', width: 36, height: 36, borderRadius: 10 }}>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L4.09 12.96a.5.5 0 0 0 .41.54H11l-2 9 8.91-10.96a.5.5 0 0 0-.41-.54H11l2-9z"/>
              </svg>
            </div>
            <span className="font-bold text-lg text-white">InternTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              style={{ color: '#a3b0cc' }}>Login</Link>
            <Link to={isAuthenticated ? '/dashboard' : '/register'}
              className="text-sm font-bold px-5 py-2.5 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #4b7cf3, #3a6be0)', boxShadow: '0 4px 16px rgba(75,124,243,0.35)' }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-up text-sm font-semibold"
          style={{ background: 'rgba(75,124,243,0.12)', border: '1px solid rgba(75,124,243,0.25)', color: '#7aa3f7' }}>
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse inline-block" />
          Internship Application Tracker
        </div>

        <h1 className="font-extrabold text-5xl sm:text-6xl text-white leading-tight mb-6 animate-fade-up delay-1"
          style={{ opacity: 0, letterSpacing: '-0.02em' }}>
          Never lose track of an<br />
          <span style={{ color: '#4b7cf3' }}>internship</span> again.
        </h1>

        <p className="text-lg mb-10 max-w-lg mx-auto animate-fade-up delay-2"
          style={{ color: '#6b7a99', opacity: 0, lineHeight: 1.7 }}>
          One dashboard to manage all your applications — track statuses, deadlines, and stats in real time.
        </p>

        <div className="flex items-center justify-center gap-4 mb-16 animate-fade-up delay-3" style={{ opacity: 0 }}>
          <Link to="/register"
            className="font-bold text-sm px-8 py-4 rounded-2xl text-white"
            style={{ background: 'linear-gradient(135deg, #4b7cf3, #3a6be0)', boxShadow: '0 8px 24px rgba(75,124,243,0.4)' }}>
            Start for Free
          </Link>
          <Link to="/login"
            className="font-semibold text-sm px-6 py-4 rounded-2xl transition-colors"
            style={{ color: '#a3b0cc', background: '#1a2236', border: '1px solid rgba(255,255,255,0.06)' }}>
            Sign In →
          </Link>
        </div>

        {/* Feature pills
        <div className="flex flex-wrap justify-center gap-3 animate-fade-up delay-4" style={{ opacity: 0 }}>
          {[
            { icon: '🔐', label: 'JWT Secured' },
            { icon: '📊', label: 'Stats Dashboard' },
            { icon: '⚡', label: 'Live Search' },
            { icon: '🎯', label: '6 Status Stages' },
            { icon: '📅', label: 'Deadline Tracking' },
          ].map(f => <Feature key={f.label} {...f} />)}
        </div> */}
      </main>

      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(75,124,243,0.08) 0%, transparent 70%)' }} />
    </div>
  );
}