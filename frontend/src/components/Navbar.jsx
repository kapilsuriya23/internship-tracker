import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bellOpen, setBellOpen]   = useState(false);
  const [toggling, setToggling]   = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const { data } = await api.patch('/auth/preferences', {
        emailRemindersEnabled: !user.emailRemindersEnabled
      });
      updateUser({ emailRemindersEnabled: data.user.emailRemindersEnabled });
    } catch (e) { console.error(e); }
    finally { setToggling(false); }
  };

  const handleTestEmail = async () => {
    setTestStatus(null);
    try {
      const { data } = await api.post('/applications/test-reminder');
      setTestStatus({ type: data.sent ? 'success' : 'info', message: data.message });
    } catch (e) {
      setTestStatus({ type: 'error', message: e.response?.data?.error || 'Failed to send' });
    }
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/analytics', label: 'ATS Analyzer' },
  ];

  return (
    <nav style={{
      background: 'rgba(18,18,31,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(167,139,250,0.1)',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative z-10">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
          }}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L4.09 12.96a.5.5 0 0 0 .41.54H11l-2 9 8.91-10.96a.5.5 0 0 0-.41-.54H11l2-9z"/>
            </svg>
          </div>
          <span className="font-bold text-lg iris-text">Job Application Tracker</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 p-1 neu-inset"
          style={{ borderRadius: 14 }}>
          {navLinks.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                className="text-sm font-semibold px-5 py-2 transition-all"
                style={{
                  borderRadius: 10,
                  background: active
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(14,165,233,0.2))'
                    : 'transparent',
                  color: active ? '#a78bfa' : '#8b8aad',
                  boxShadow: active
                    ? '4px 4px 10px rgba(0,0,0,0.3), -2px -2px 6px rgba(255,255,255,0.04)'
                    : 'none',
                }}>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 relative">

          {/* Bell */}
          <div className="relative">
            <button onClick={() => { setBellOpen(o => !o); setTestStatus(null); }}
              className="neu-btn w-9 h-9 flex items-center justify-center relative"
              style={{ borderRadius: 10 }}>
              <svg className="w-4 h-4" style={{ color: '#8b8aad' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              {user?.emailRemindersEnabled && (
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #34d399, #0ea5e9)',
                  boxShadow: '0 0 6px rgba(52,211,153,0.8)',
                }} />
              )}
            </button>

            {bellOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                <div className="absolute right-0 mt-2 z-50 animate-fade-in neu iris-border"
                  style={{ width: 290, padding: 20 }}>
                  <p className="font-bold text-sm mb-1" style={{ color: '#e2e0ff' }}>Email Reminders</p>
                  <p className="text-xs mb-4" style={{ color: '#8b8aad', lineHeight: 1.5 }}>
                    Get notified 48 hours before application deadlines.
                  </p>

                  <div className="flex items-center justify-between mb-4 p-3"
                    style={{ background: 'var(--bg-deep)', borderRadius: 10 }}>
                    <span className="text-sm font-semibold" style={{ color: '#e2e0ff' }}>
                      {user?.emailRemindersEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button onClick={handleToggle} disabled={toggling}
                      style={{
                        width: 42, height: 24, borderRadius: 12, border: 'none',
                        cursor: 'pointer', position: 'relative', padding: 0,
                        opacity: toggling ? 0.5 : 1, transition: 'all 0.2s',
                        background: user?.emailRemindersEnabled
                          ? 'linear-gradient(135deg, #7c3aed, #0ea5e9)'
                          : 'rgba(255,255,255,0.08)',
                        boxShadow: user?.emailRemindersEnabled
                          ? '0 0 12px rgba(124,58,237,0.5)' : 'none',
                      }}>
                      <span style={{
                        position: 'absolute', top: 3,
                        left: user?.emailRemindersEnabled ? 21 : 3,
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#fff', transition: 'left 0.2s',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                      }} />
                    </button>
                  </div>

                  <button onClick={handleTestEmail} className="iris-btn w-full py-2.5 text-sm">
                    Send Test Email
                  </button>

                  {testStatus && (
                    <p className="text-xs mt-3" style={{
                      color: testStatus.type === 'success' ? '#34d399'
                           : testStatus.type === 'error'   ? '#f87171' : '#8b8aad',
                      lineHeight: 1.5
                    }}>{testStatus.message}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Avatar */}
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #f472b6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 12px rgba(124,58,237,0.35)',
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="hidden sm:block text-sm font-medium" style={{ color: '#8b8aad' }}>
            {user?.name?.split(' ')[0]}
          </span>

          <button onClick={handleLogout} className="neu-btn text-sm px-4 py-1.5"
            style={{ color: '#8b8aad' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}