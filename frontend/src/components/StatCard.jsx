const CONFIGS = {
  total:      { label: 'Total',      icon: '◈', grad: 'linear-gradient(135deg,#7c3aed,#4f46e5)', glow: 'rgba(124,58,237,0.35)' },
  Applied:    { label: 'Applied',    icon: '◎', grad: 'linear-gradient(135deg,#4f46e5,#0ea5e9)', glow: 'rgba(79,70,229,0.35)'  },
  Interview:  { label: 'Interview',  icon: '◐', grad: 'linear-gradient(135deg,#f97316,#f59e0b)', glow: 'rgba(249,115,22,0.35)' },
  Offer:      { label: 'Offer',      icon: '●', grad: 'linear-gradient(135deg,#10b981,#34d399)', glow: 'rgba(16,185,129,0.35)' },
  Rejected:   { label: 'Rejected',   icon: '✕', grad: 'linear-gradient(135deg,#ef4444,#f43f5e)', glow: 'rgba(239,68,68,0.35)'  },
  Selected:   { label: 'Selected',   icon: '✓', grad: 'linear-gradient(135deg,#a855f7,#ec4899)', glow: 'rgba(168,85,247,0.35)' },
  Assessment: { label: 'Assessment', icon: '◈', grad: 'linear-gradient(135deg,#eab308,#f97316)', glow: 'rgba(234,179,8,0.35)'  },
  Mailed:     { label: 'Mailed',     icon: '✉', grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)', glow: 'rgba(6,182,212,0.35)'  },
};

export default function StatCard({ type, count, delay = 0 }) {
  const c = CONFIGS[type] || CONFIGS.total;
  return (
    <div className="neu iris-border animate-fade-up"
      style={{ opacity: 0, animationDelay: `${delay}ms`, padding: '18px 16px' }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, marginBottom: 12,
        background: c.grad,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, color: '#fff',
        boxShadow: `0 4px 14px ${c.glow}`,
      }}>
        {c.icon}
      </div>
      <p className="mono font-bold" style={{ fontSize: 28, color: '#e2e0ff', lineHeight: 1 }}>{count}</p>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#8b8aad', textTransform: 'uppercase',
        letterSpacing: '0.07em', marginTop: 6 }}>{c.label}</p>
    </div>
  );
}