import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const COLORS = {
  Applied: '#4b7cf3',
  Assessment: '#eab308',
  Interview: '#f97316',
  Offer: '#22c55e',
  Rejected: '#ef4444',
  Selected: '#a855f7',
};

const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// ── Custom tooltip matching dark theme ─────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a2236', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12
    }}>
      <p style={{ color: '#a3b0cc', marginBottom: 4, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill, fontWeight: 700 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const ChartCard = ({ title, subtitle, children, delay = 0 }) => (
  <div className="card animate-fade-up p-6" style={{ opacity: 0, animationDelay: `${delay}ms` }}>
    <div className="mb-5">
      <p className="font-bold text-white text-sm">{title}</p>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: '#6b7a99' }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

const StatBlock = ({ label, value, suffix = '', color, delay = 0 }) => (
  <div className="card animate-fade-up p-5" style={{ opacity: 0, animationDelay: `${delay}ms` }}>
    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#6b7a99' }}>{label}</p>
    <p className="text-3xl font-extrabold" style={{ color }}>{value}{suffix}</p>
  </div>
);

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications/analytics')
      .then(res => setData(res.data))
      .catch(err => console.error('Analytics fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#0d1117' }}>
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'rgba(75,124,243,0.3)', borderTopColor: '#4b7cf3' }} />
        </div>
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="min-h-screen" style={{ background: '#0d1117' }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-extrabold text-white mb-1">Analytics</h1>
          <p className="text-sm mb-10" style={{ color: '#6b7a99' }}>Insights from your application history</p>
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
              style={{ background: 'rgba(75,124,243,0.1)', border: '1px solid rgba(75,124,243,0.2)' }}>📊</div>
            <p className="font-bold text-white mb-1">No data yet</p>
            <p className="text-sm" style={{ color: '#6b7a99' }}>Add some applications to see your analytics</p>
          </div>
        </div>
      </div>
    );
  }

  const pieData = Object.entries(data.distribution).map(([status, count]) => ({ name: status, value: count }));
  const timelineData = data.timeline.map(t => ({ ...t, label: fmtDate(t.date) }));

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-2xl font-extrabold text-white mb-1" style={{ letterSpacing: '-0.01em' }}>
            Analytics
          </h1>
          <p className="text-sm" style={{ color: '#6b7a99' }}>Insights from your application history</p>
        </div>

        {/* Top stat row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatBlock label="Total Applications" value={data.total} color="#4b7cf3" delay={0} />
          <StatBlock label="Avg. Response Time" value={data.avgResponseDays} suffix=" days" color="#f97316" delay={50} />
          <StatBlock label="Success Rate" value={data.successRate} suffix="%" color="#22c55e" delay={100} />
        </div>

        {/* Applications over time */}
        <div className="mb-6">
          <ChartCard title="Applications Over Time" subtitle="Weekly application volume" delay={150}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={timelineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4b7cf3" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#4b7cf3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" stroke="#6b7a99" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7a99" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="count" name="Applications"
                  stroke="#4b7cf3" strokeWidth={2.5} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Status distribution + Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Status Distribution" subtitle="Breakdown of all applications" delay={200}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.name] || '#6b7a99'} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  formatter={(value) => <span style={{ color: '#a3b0cc', fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Pipeline Funnel" subtitle="How far applications have progressed" delay={250}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.funnel} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#6b7a99" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="stage" stroke="#6b7a99" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Applications" radius={[0, 6, 6, 0]}>
                  {data.funnel.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.stage] || '#4b7cf3'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Top companies */}
        {data.topCompanies.length > 0 && (
          <ChartCard title="Top Companies" subtitle="Companies you've applied to most" delay={300}>
            <ResponsiveContainer width="100%" height={Math.max(180, data.topCompanies.length * 50)}>
              <BarChart data={data.topCompanies} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#6b7a99" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="company" stroke="#6b7a99" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Applications" fill="#4b7cf3" radius={[0, 6, 6, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </main>

      <div className="fixed top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(75,124,243,0.05) 0%, transparent 70%)' }} />
    </div>
  );
}