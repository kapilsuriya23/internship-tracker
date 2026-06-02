import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="noise-bg min-h-screen bg-ink flex flex-col">
      {/* Nav */}
      <nav className="px-8 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-volt rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-ink" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L4.09 12.96a.5.5 0 0 0 .41.54H11l-2 9 8.91-10.96a.5.5 0 0 0-.41-.54H11l2-9z"/>
            </svg>
          </span>
          <span className="font-display font-700 text-lg text-frost">InternTrack</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-frost/60 hover:text-frost transition-colors font-display font-600">
            Login
          </Link>
          <Link to={isAuthenticated ? '/dashboard' : '/register'}
            className="bg-volt text-ink text-sm font-display font-700 px-5 py-2 rounded-xl hover:bg-volt-dark transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-8 relative z-10">
        <div className="max-w-3xl w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-volt/10 border border-volt/20 rounded-full px-4 py-1.5 mb-10 animate-fade-up">
            <span className="w-1.5 h-1.5 bg-volt rounded-full animate-pulse" />
            <span className="text-volt text-xs font-display font-600 tracking-widest uppercase">
              Application Command Center
            </span>
          </div>

          <h1 className="font-display font-800 text-6xl sm:text-7xl text-frost leading-[1.05] mb-6 animate-fade-up delay-100"
              style={{ opacity: 0 }}>
            Never Lose Track of an
            <br />
            <span className="text-volt">Internship</span> Again.
          </h1>

          <p className="text-frost/50 text-lg font-body font-300 mb-12 max-w-xl mx-auto leading-relaxed animate-fade-up delay-200"
             style={{ opacity: 0 }}>
            One dashboard to track every application — status updates, deadlines, and insights at a glance.
          </p>

          <div className="flex items-center justify-center gap-4 animate-fade-up delay-300" style={{ opacity: 0 }}>
            <Link to="/register"
              className="bg-volt text-ink font-display font-700 text-sm tracking-wide px-8 py-4 rounded-2xl hover:bg-volt-dark transition-colors duration-200 shadow-lg shadow-volt/20">
              Start Tracking Free
            </Link>
            <Link to="/login"
              className="text-frost/50 font-display font-600 text-sm hover:text-frost transition-colors">
              Already have an account →
            </Link>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-16 animate-fade-up delay-400" style={{ opacity: 0 }}>
            {['JWT Secured', '6 Status Stages', 'Instant Search', 'Stats Dashboard', 'Deadline Tracking'].map(f => (
              <span key={f} className="text-xs text-frost/30 font-display font-600 tracking-widest border border-white/6 rounded-full px-4 py-1.5 uppercase">
                {f}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Gradient orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-volt/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}