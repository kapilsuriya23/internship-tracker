const CONFIGS = {
  total:      { label: 'Total Applied',   icon: '★', bg: '#4b7cf3', glow: 'rgba(75,124,243,0.15)' },
  Applied:    { label: 'Applied',         icon: '◎', bg: '#4b7cf3', glow: 'rgba(75,124,243,0.15)' },
  Interview:  { label: 'Interview',       icon: '◐', bg: '#f97316', glow: 'rgba(249,115,22,0.15)' },
  Offer:      { label: 'Offer',           icon: '●', bg: '#22c55e', glow: 'rgba(34,197,94,0.15)'  },
  Rejected:   { label: 'Rejected',        icon: '✕', bg: '#ef4444', glow: 'rgba(239,68,68,0.15)'  },
  Selected:   { label: 'Selected',        icon: '✓', bg: '#a855f7', glow: 'rgba(168,85,247,0.15)' },
  Assessment: { label: 'Assessment',      icon: '◈', bg: '#eab308', glow: 'rgba(234,179,8,0.15)'  },
};

export default function StatCard({ type, count, delay = 0 }) {
  const c = CONFIGS[type] || CONFIGS.total;

  return (
    <div className="card animate-fade-up p-5 flex items-center gap-4"
      style={{ animationDelay: `${delay}ms`, opacity: 0, boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
      <div className="icon-badge" style={{ background: c.glow, border: `1px solid ${c.bg}30` }}>
        <span style={{ color: c.bg, fontSize: 18 }}>{c.icon}</span>
      </div>
      <div>
        <p className="text-3xl font-bold text-white leading-none mb-1">{count}</p>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6b7a99' }}>{c.label}</p>
      </div>
    </div>
  );
}