import { useState, useEffect } from 'react';
import api from '../api/axios';

const STATUSES = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Selected'];
const EMPTY = {
  company: '', role: '', applicationLink: '',
  appliedDate: new Date().toISOString().split('T')[0],
  deadline: '', status: 'Applied'
};

export default function ApplicationModal({ isOpen, onClose, onSuccess, editData }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setForm({
        company: editData.company || '',
        role: editData.role || '',
        applicationLink: editData.applicationLink || '',
        appliedDate: editData.appliedDate?.split('T')[0] || EMPTY.appliedDate,
        deadline: editData.deadline?.split('T')[0] || '',
        status: editData.status || 'Applied'
      });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [editData, isOpen]);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editData) await api.put(`/applications/${editData._id}`, form);
      else await api.post('/applications', form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputStyle = {
    width: '100%',
    background: '#111827',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '11px 16px',
    color: '#e2e8f0',
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#6b7a99',
    marginBottom: 6,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose} />

      <div className="relative w-full max-w-lg animate-fade-up"
        style={{ background: '#1a2236', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
          padding: 32, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="icon-badge" style={{ background: 'rgba(75,124,243,0.15)', border: '1px solid rgba(75,124,243,0.3)' }}>
              <svg className="w-5 h-5" style={{ color: '#4b7cf3' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">{editData ? 'Edit Application' : 'Add Application'}</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#6b7a99' }}>✕</button>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label style={labelStyle}>Company</label>
              <input name="company" value={form.company} onChange={handle}
                placeholder="Google" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(75,124,243,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <input name="role" value={form.role} onChange={handle}
                placeholder="SWE Intern" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(75,124,243,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>
          </div>

          <div className="mb-4">
            <label style={labelStyle}>Application Link</label>
            <input name="applicationLink" value={form.applicationLink} onChange={handle}
              placeholder="https://careers.company.com/..." style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(75,124,243,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label style={labelStyle}>Applied Date</label>
              <input name="appliedDate" type="date" value={form.appliedDate} onChange={handle}
                required style={{ ...inputStyle, colorScheme: 'dark' }}
                onFocus={e => e.target.style.borderColor = 'rgba(75,124,243,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>
            <div>
              <label style={labelStyle}>Deadline</label>
              <input name="deadline" type="date" value={form.deadline} onChange={handle}
                style={{ ...inputStyle, colorScheme: 'dark' }}
                onFocus={e => e.target.style.borderColor = 'rgba(75,124,243,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>
          </div>

          <div className="mb-6">
            <label style={labelStyle}>Status</label>
            <select name="status" value={form.status} onChange={handle}
              style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark' }}
              onFocus={e => e.target.style.borderColor = 'rgba(75,124,243,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button type="submit" disabled={loading}
            style={{
              width: '100%', background: 'linear-gradient(135deg, #4b7cf3, #3a6be0)',
              color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 700, fontSize: 14, padding: '13px',
              borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, boxShadow: '0 4px 20px rgba(75,124,243,0.35)',
              transition: 'opacity 0.2s'
            }}>
            {loading ? 'Saving...' : editData ? 'Save Changes' : 'Add Application'}
          </button>
        </form>
      </div>
    </div>
  );
}