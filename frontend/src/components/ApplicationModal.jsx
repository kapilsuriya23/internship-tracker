import { useState, useEffect } from 'react';
import api from '../api/axios';

const STATUSES = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Selected'];

const EMPTY_FORM = {
  company: '', role: '', applicationLink: '',
  appliedDate: new Date().toISOString().split('T')[0],
  deadline: '', status: 'Applied'
};

export default function ApplicationModal({ isOpen, onClose, onSuccess, editData }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setForm({
        company: editData.company || '',
        role: editData.role || '',
        applicationLink: editData.applicationLink || '',
        appliedDate: editData.appliedDate?.split('T')[0] || EMPTY_FORM.appliedDate,
        deadline: editData.deadline?.split('T')[0] || '',
        status: editData.status || 'Applied'
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError('');
  }, [editData, isOpen]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editData) {
        await api.put(`/applications/${editData._id}`, form);
      } else {
        await api.post('/applications', form);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = "w-full bg-ink-muted border border-white/10 rounded-xl px-4 py-3 text-frost text-sm font-body placeholder-frost/20 focus:border-volt/50 focus:bg-ink-muted transition-colors duration-200";
  const labelClass = "block text-xs font-display font-600 tracking-widest text-frost/40 uppercase mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-ink-soft border border-white/8 rounded-3xl p-8 animate-fade-up shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-700 text-xl text-frost">
            {editData ? 'Edit Application' : 'Add Application'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-frost/40 hover:text-frost hover:bg-white/10 transition-all">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Company</label>
              <input name="company" value={form.company} onChange={handleChange}
                placeholder="Google" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <input name="role" value={form.role} onChange={handleChange}
                placeholder="SWE Intern" required className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Application Link</label>
            <input name="applicationLink" value={form.applicationLink} onChange={handleChange}
              placeholder="https://careers.google.com/..." className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Applied Date</label>
              <input name="appliedDate" type="date" value={form.appliedDate} onChange={handleChange}
                required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Deadline</label>
              <input name="deadline" type="date" value={form.deadline} onChange={handleChange}
                className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="w-full mt-2 bg-volt text-ink font-display font-700 text-sm tracking-wide py-3.5 rounded-xl hover:bg-volt-dark transition-colors duration-200 disabled:opacity-50">
            {loading ? 'Saving...' : editData ? 'Save Changes' : 'Add Application'}
          </button>
        </form>
      </div>
    </div>
  );
}