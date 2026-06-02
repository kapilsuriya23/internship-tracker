const STATUS_CONFIG = {
  total: { label: 'Total', color: 'text-frost', bg: 'bg-white/5', border: 'border-white/10', icon: '◈' },
  Applied: { label: 'Applied', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: '◎' },
  Interview: { label: 'Interview', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '◐' },
  Offer: { label: 'Offer', color: 'text-volt', bg: 'bg-volt/10', border: 'border-volt/20', icon: '◉' },
  Rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: '◌' },
  Selected: { label: 'Selected', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '●' },
};

export default function StatCard({ type, count, delay = 0 }) {
  const config = STATUS_CONFIG[type] || STATUS_CONFIG.total;

  return (
    <div
      className={`rounded-2xl p-5 border ${config.bg} ${config.border} animate-fade-up`}
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-display font-600 tracking-widest text-frost/40 uppercase mb-3">
            {config.label}
          </p>
          <p className={`text-4xl font-display font-800 ${config.color}`}>{count}</p>
        </div>
        <span className={`text-2xl ${config.color} opacity-60`}>{config.icon}</span>
      </div>
    </div>
  );
}