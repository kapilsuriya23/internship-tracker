import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [bellOpen, setBellOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // { type: 'success'|'error', message }

  const handleLogout = () => { logout(); navigate('/'); };

  const handleToggleReminders = async () => {
    setToggling(true);
    try {
      const { data } = await api.patch('/auth/preferences', {
        emailRemindersEnabled: !user.emailRemindersEnabled
      });
      updateUser({ emailRemindersEnabled: data.user.emailRemindersEnabled });
    } catch (err) {
      console.error('Preference update failed:', err);
    } finally {
      setToggling(false);
    }
  };

  const handleTestEmail = async () => {
    setTestStatus(null);
    try {
      const { data } = await api.post('/applications/test-reminder');
      setTestStatus({ type: data.sent ? 'success' : 'info', message: data.message });
    } catch (err) {
      setTestStatus({ type: 'error', message: err.response?.data?.error || 'Failed to send test email' });
    }
  };

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
          <span className="font-bold text-lg text-white tracking-tight">InternTrack</span>
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
        <div className="flex items-center gap-4 relative">

          {/* Notification bell with dropdown */}
          <div className="relative">
            <button onClick={() => { setBellOpen(o => !o); setTestStatus(null); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center relative"
              style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.06)' }}>
              <svg className="w-4 h-4" style={{ color: '#6b7a99' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              {user?.emailRemindersEnabled && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
              )}
            </button>

            {bellOpen && (
              <>
                {/* Backdrop to close on outside click */}
                <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />

                <div className="absolute right-0 mt-2 z-50 animate-fade-in"
                  style={{
                    width: 280, background: '#1a2236',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14, padding: 16,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.4)'
                  }}>
                  <p className="text-sm font-bold text-white mb-1">Email Reminders</p>
                  <p className="text-xs mb-4" style={{ color: '#6b7a99' }}>
                    Get notified when application deadlines are within 48 hours.
                  </p>

                  {/* Toggle switch */}
                  <div className="flex items-center justify-between mb-4 p-3 rounded-xl"
                    style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-sm font-medium text-white">
                      {user?.emailRemindersEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button onClick={handleToggleReminders} disabled={toggling}
                      style={{
                        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                        background: user?.emailRemindersEnabled ? '#4b7cf3' : 'rgba(255,255,255,0.1)',
                        position: 'relative', transition: 'background 0.2s', opacity: toggling ? 0.5 : 1,
                        padding: 0,
                      }}>
                      <span style={{
                        position: 'absolute', top: 2,
                        left: user?.emailRemindersEnabled ? 20 : 2,
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#fff', transition: 'left 0.2s'
                      }} />
                    </button>
                  </div>

                  {/* Test email button */}
                  <button onClick={handleTestEmail}
                    className="w-full text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    style={{
                      background: 'rgba(75,124,243,0.12)', color: '#4b7cf3',
                      border: '1px solid rgba(75,124,243,0.2)', cursor: 'pointer'
                    }}>
                    Send Test Email
                  </button>

                  {testStatus && (
                    <p className="text-xs mt-3 leading-relaxed" style={{
                      color: testStatus.type === 'success' ? '#4ade80'
                           : testStatus.type === 'error' ? '#f87171'
                           : '#6b7a99'
                    }}>
                      {testStatus.message}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

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