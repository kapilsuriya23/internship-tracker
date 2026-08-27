import { useState, useEffect } from 'react';
import api from '../api/axios';

const STATUSES = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Selected', 'Mailed'];

const EMPTY = {
  company: '', role: '', location: '', jobLink: '',
  appliedDate: new Date().toISOString().split('T')[0],
  status: 'Applied', recruiterEmail: '', tracking: ''
};

export default function ApplicationModal({ isOpen, onClose, onSuccess, editData }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setForm({
        company:        editData.company        || '',
        role:           editData.role           || '',
        location:       editData.location       || '',
        jobLink:        editData.jobLink        || '',
        appliedDate:    editData.appliedDate?.split('T')[0] || '',
        status:         editData.status         || 'Applied',
        recruiterEmail: editData.recruiterEmail || '',
        tracking:       editData.tracking       || '',
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

  const inputStyle = { display: 'none' };

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    color: '#6b7a99', marginBottom: 6,
  };

  const focus = e => e.target.style.borderColor = 'rgba(75,124,243,0.5)';
  const blur  = e => e.target.style.borderColor = 'rgba(255,255,255,0.08)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0"
        style={{ background: 'rgba(12,12,20,0.9)', backdropFilter: 'blur(16px)' }}
        onClick={onClose} />

            <div className="relative w-full max-w-2xl animate-fade-up neu iris-border"
        style={{ borderRadius: 22, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="icon-badge"
              style={{ background: 'rgba(75,124,243,0.15)', border: '1px solid rgba(75,124,243,0.3)' }}>
              <svg className="w-5 h-5" style={{ color: '#4b7cf3' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">
              {editData ? 'Edit Application' : 'Add Application'}
            </h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#6b7a99', border: 'none', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Row 1 — Company + Role */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label style={labelStyle}>Company *</label>
              <input name="company" value={form.company} onChange={handle}
                placeholder="Google" required className="neu-input"
                 />
            </div>
            <div>
              <label style={labelStyle}>Role *</label>
              <input name="role" value={form.role} onChange={handle}
                placeholder="Software Engineer Intern" required className="neu-input"
                 />
            </div>
          </div>

          {/* Row 2 — Location + Applied Date */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label style={labelStyle}>Location</label>
              <input name="location" value={form.location} onChange={handle}
                placeholder="Chennai / Remote / Bangalore" className="neu-input"
                 />
            </div>
            <div>
              <label style={labelStyle}>Applied Date</label>
              <input name="appliedDate" type="date" value={form.appliedDate} onChange={handle}
                style={{ ...inputStyle, colorScheme: 'dark' }}
                 />
            </div>
          </div>

          {/* Row 3 — Job Link */}
          <div className="mb-4">
            <label style={labelStyle}>Job Link</label>
            <input name="jobLink" value={form.jobLink} onChange={handle}
              placeholder="https://careers.google.com/jobs/..." className="neu-input"
               />
          </div>

          {/* Row 4 — Status */}
          <div className="mb-4">
            <label style={labelStyle}>Status</label>
            <select name="status" value={form.status} onChange={handle}
              className="neu-input"
              >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Row 5 — Recruiter Email */}
          <div className="mb-4">
            <label style={labelStyle}>Recruiter Email</label>
            <input name="recruiterEmail" value={form.recruiterEmail} onChange={handle}
              placeholder="hr@company.com, recruiter@company.com" className="neu-input"
              />
          </div>

          {/* Row 6 — Tracking */}
          <div className="mb-6">
            <label style={labelStyle}>Tracking / Notes</label>
            <input name="tracking" value={form.tracking} onChange={handle}
              placeholder="Candidate portal link, follow-up notes..." className="neu-input"
               />
          </div>

                    <button type="submit" disabled={loading} className="iris-btn w-full"
            style={{ padding: '14px', borderRadius: 12, fontSize: 15, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Saving...' : editData ? 'Save Changes' : 'Add Application'}
          </button>
        </form>
      </div>
    </div>
  );
}