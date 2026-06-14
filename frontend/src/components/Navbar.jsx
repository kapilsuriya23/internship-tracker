import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={{ background: '#131929', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      className="sticky top-0 z-40 h-16">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="icon-badge" style={{ background: '#4b7cf3' }}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L4.09 12.96a.5.5 0 0 0 .41.54H11l-2 9 8.91-10.96a.5.5 0 0 0-.41-.54H11l2-9z"/>
            </svg>
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Job Application Tracker</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-xl"
          style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/analytics', label: 'Analytics' },
          ].map(link => {
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: active ? 'rgba(75,124,243,0.15)' : 'transparent',
                  color: active ? '#4b7cf3' : '#6b7a99',
                }}>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Notification bell */}
          <button className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.06)' }}>
            <svg className="w-4 h-4" style={{ color: '#6b7a99' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #4b7cf3, #6a3de8)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium" style={{ color: '#a3b0cc' }}>
              {user?.name?.split(' ')[0]}
            </span>
          </div>

          <button onClick={handleLogout}
            className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            style={{ color: '#6b7a99' }}
            onMouseEnter={e => e.target.style.color = '#e2e8f0'}
            onMouseLeave={e => e.target.style.color = '#6b7a99'}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}