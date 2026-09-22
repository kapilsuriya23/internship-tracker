import { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

// ── Helpers ───────────────────────────────────────────────────

const scoreColor = (score) => {
  if (score >= 80) return { color: '#34d399', glow: 'rgba(52,211,153,0.4)', label: 'Excellent' };
  if (score >= 60) return { color: '#fbbf24', glow: 'rgba(251,191,36,0.4)',  label: 'Good'      };
  if (score >= 40) return { color: '#f97316', glow: 'rgba(249,115,22,0.4)',  label: 'Fair'      };
  return               { color: '#f87171', glow: 'rgba(248,113,113,0.4)',  label: 'Poor'      };
};

const Chip = ({ label, type }) => {
  const styles = {
    matched:   { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.3)'  },
    missing:   { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.3)' },
    partial:   { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.3)'  },
    suggested: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: 'rgba(167,139,250,0.3)' },
  };
  const s = styles[type] || styles.suggested;
  return (
    <span style={{
      display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12,
      fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, margin: '3px',
    }}>{label}</span>
  );
};

const ScoreArc = ({ score }) => {
  const c = scoreColor(score);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;

  return (
    <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 8px' }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none"
          stroke={c.color} strokeWidth="10"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 8px ${c.glow})`,
            transition: 'stroke-dasharray 1s ease',
          }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: c.color,
          fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: c.color,
          textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
          {c.label}
        </span>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children, delay = 0 }) => (
  <div className="neu iris-border animate-fade-up"
    style={{ borderRadius: 18, padding: 24, opacity: 0, animationDelay: `${delay}ms` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#e2e0ff' }}>{title}</h3>
    </div>
    {children}
  </div>
);

const BreakdownBar = ({ label, value, max = 100, color }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#8b8aad' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace' }}>
        {value}/{max}
      </span>
    </div>
    <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 4, width: `${(value / max) * 100}%`,
        background: color, boxShadow: `0 0 8px ${color}80`,
        transition: 'width 1s ease',
      }} />
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────

export default function Analytics() {
  const [resume, setResume]         = useState('');
  const [jd, setJd]                 = useState('');
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [activeTab, setActiveTab]   = useState('paste'); // 'paste' | 'upload'
  const fileRef = useRef(null);

  // ── File upload handler ───────────────────────────────────
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type === 'text/plain') {
      const text = await file.text();
      setResume(text);
    } else {
      // PDF / DOCX — extract text from name and notify
      setResume(`[File uploaded: ${file.name}]\n\nPlease paste the text content of your resume below for accurate analysis, or use a .txt file.`);
    }
  };

  // ── Call Anthropic API ────────────────────────────────────
  const analyze = async () => {
    if (!resume.trim()) { setError('Please add your resume content.'); return; }
    if (!jd.trim())     { setError('Please paste the job description.'); return; }
    setError(''); setLoading(true); setResult(null);

    

    try {
      const res = await api.post('/ai/analyze', { resume, jd });
      setResult(res.data);
    } catch (err) {
      setError('Analysis failed: ' + err.message + '. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const impactColor = v =>
    v === 'high' ? '#f87171' : v === 'medium' ? '#fbbf24' : '#34d399';

  const importanceColor = v =>
    v === 'high' ? '#f87171' : v === 'medium' ? '#fbbf24' : '#8b8aad';

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Navbar />

      {/* Ambient orbs */}
      <div style={{
        position: 'fixed', top: '10%', right: '5%', width: 320, height: 320,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle, rgba(167,139,250,0.1), transparent 70%)',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', left: '5%', width: 240, height: 240,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle, rgba(56,189,248,0.08), transparent 70%)',
        filter: 'blur(60px)',
      }} />

      <main className="max-w-7xl mx-auto px-6 py-8" style={{ position: 'relative', zIndex: 1 }}>

        {/* Page header */}
        <div className="animate-fade-up mb-8">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
            }}>🎯</div>
            <div>
              <h1 className="font-black" style={{ fontSize: 26, letterSpacing: '-0.02em', color: '#e2e0ff' }}>
                ATS Analyzer
              </h1>
              <p style={{ fontSize: 13, color: '#8b8aad', marginTop: 2 }}>
                AI-powered resume vs job description analysis
              </p>
            </div>
          </div>
        </div>

        {/* Input section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}
          className="animate-fade-up delay-1">

          {/* Resume panel */}
          <div className="neu iris-border" style={{ borderRadius: 18, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>📄</span>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#e2e0ff' }}>Your Resume</h3>
              </div>
              {/* Tab toggle */}
              <div style={{
                display: 'flex', gap: 4, padding: 4, borderRadius: 10,
                background: 'var(--bg-deep)',
              }}>
                {['paste','upload'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    style={{
                      fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 7,
                      border: 'none', cursor: 'pointer',
                      background: activeTab === t
                        ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(14,165,233,0.2))'
                        : 'transparent',
                      color: activeTab === t ? '#a78bfa' : '#8b8aad',
                    }}>
                    {t === 'paste' ? '✏️ Paste' : '📁 Upload'}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'upload' && (
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: '2px dashed rgba(167,139,250,0.25)', borderRadius: 12,
                  padding: '20px 16px', textAlign: 'center',
                  cursor: 'pointer', marginBottom: 12,
                  background: 'rgba(167,139,250,0.04)',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(167,139,250,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(167,139,250,0.25)'}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>📂</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa' }}>Click to upload</p>
                <p style={{ fontSize: 11, color: '#8b8aad', marginTop: 4 }}>.txt recommended · .pdf .docx (paste text)</p>
                <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx"
                  style={{ display: 'none' }} onChange={handleFile} />
              </div>
            )}

            <textarea
              value={resume}
              onChange={e => setResume(e.target.value)}
              placeholder="Paste your resume text here — skills, experience, education, projects..."
              className="neu-input"
              style={{
                resize: 'vertical', minHeight: 280,
                fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                lineHeight: 1.6, borderRadius: 12,
              }} />
            <p style={{ fontSize: 11, color: '#8b8aad', marginTop: 8 }}>
              {resume.trim().split(/\s+/).filter(Boolean).length} words
            </p>
          </div>

          {/* JD panel */}
          <div className="neu iris-border" style={{ borderRadius: 18, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 16 }}>💼</span>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#e2e0ff' }}>Job Description</h3>
            </div>
            <textarea
              value={jd}
              onChange={e => setJd(e.target.value)}
              placeholder="Paste the full job description here — requirements, responsibilities, skills, qualifications..."
              className="neu-input"
              style={{
                resize: 'vertical', minHeight: 330,
                fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                lineHeight: 1.6, borderRadius: 12,
              }} />
            <p style={{ fontSize: 11, color: '#8b8aad', marginTop: 8 }}>
              {jd.trim().split(/\s+/).filter(Boolean).length} words
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 20, padding: '12px 18px', borderRadius: 12,
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
            color: '#fca5a5', fontSize: 14, fontWeight: 500,
          }}>{error}</div>
        )}

        {/* Analyze button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <button onClick={analyze} disabled={loading} className="iris-btn"
            style={{
              fontSize: 16, fontWeight: 800, padding: '16px 48px',
              borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10,
              opacity: loading ? 0.7 : 1,
              boxShadow: loading ? 'none' : '0 8px 28px rgba(124,58,237,0.45)',
            }}>
            {loading ? (
              <>
                <span style={{
                  width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  display: 'inline-block', animation: 'spin 0.7s linear infinite',
                }} />
                Analyzing with AI...
              </>
            ) : (
              <>🎯 Analyze Job Match</>
            )}
          </button>
        </div>

        {/* ── Results ── */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Row 1 — Score + Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>

              {/* ATS Score */}
              <Section title="ATS Score" icon="🏆" delay={0}>
                <ScoreArc score={result.atsScore} />
                <p style={{ fontSize: 13, color: '#8b8aad', textAlign: 'center', lineHeight: 1.6 }}>
                  {result.summary}
                </p>
              </Section>

              {/* Score Breakdown */}
              <Section title="Score Breakdown" icon="📊" delay={60}>
                <BreakdownBar label="Keyword Match"           value={result.breakdown.keywordMatch}          max={35} color="#a78bfa" />
                <BreakdownBar label="Skills Alignment"        value={result.breakdown.skillsAlignment}       max={25} color="#38bdf8" />
                <BreakdownBar label="Experience Relevance"    value={result.breakdown.experienceRelevance}   max={20} color="#f472b6" />
                <BreakdownBar label="Formatting & Clarity"    value={result.breakdown.formattingClarity}     max={10} color="#34d399" />
                <BreakdownBar label="Education & Certs"       value={result.breakdown.educationCertifications} max={10} color="#fbbf24" />
              </Section>
            </div>

            {/* Row 2 — Keywords */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              <Section title={`Matched (${result.matched?.length || 0})`} icon="✅" delay={120}>
                <div>
                  {result.matched?.length
                    ? result.matched.map(k => <Chip key={k} label={k} type="matched" />)
                    : <p style={{ color: '#8b8aad', fontSize: 13 }}>No matched keywords found.</p>}
                </div>
              </Section>

              <Section title={`Missing (${result.missing?.length || 0})`} icon="❌" delay={160}>
                <div>
                  {result.missing?.length
                    ? result.missing.map(k => <Chip key={k} label={k} type="missing" />)
                    : <p style={{ color: '#8b8aad', fontSize: 13 }}>No missing keywords — great!</p>}
                </div>
              </Section>

              <Section title={`Partial Match (${result.partial?.length || 0})`} icon="⚡" delay={200}>
                <div>
                  {result.partial?.length
                    ? result.partial.map(k => <Chip key={k} label={k} type="partial" />)
                    : <p style={{ color: '#8b8aad', fontSize: 13 }}>No partial matches.</p>}
                </div>
              </Section>
            </div>

            {/* Row 3 — Top JD Keywords */}
            {result.topJdKeywords?.length > 0 && (
              <Section title="Top JD Keywords" icon="🔑" delay={240}>
                <div>
                  {result.topJdKeywords.map(k => <Chip key={k} label={k} type="suggested" />)}
                </div>
              </Section>
            )}

            {/* Row 4 — Skill Gap Analysis */}
            {result.skillGaps?.length > 0 && (
              <Section title="Skill Gap Analysis" icon="🧠" delay={280}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {result.skillGaps.map((gap, i) => (
                    <div key={i} style={{
                      background: 'var(--bg-deep)', borderRadius: 12, padding: '14px 16px',
                      display: 'flex', gap: 14, alignItems: 'flex-start',
                    }}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                        background: `${importanceColor(gap.importance)}18`,
                        color: importanceColor(gap.importance),
                        border: `1px solid ${importanceColor(gap.importance)}40`,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        flexShrink: 0, marginTop: 2,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>
                        {gap.importance}
                      </span>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#e2e0ff', marginBottom: 3 }}>
                          {gap.skill}
                        </p>
                        <p style={{ fontSize: 13, color: '#8b8aad', lineHeight: 1.5 }}>
                          {gap.suggestion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Row 5 — AI Suggestions */}
            {result.suggestions?.length > 0 && (
              <Section title="AI Suggestions to Improve Your Resume" icon="🚀" delay={320}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {result.suggestions.map((s, i) => (
                    <div key={i} style={{
                      background: 'var(--bg-deep)', borderRadius: 12, padding: '16px',
                      borderLeft: `3px solid ${impactColor(s.impact)}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#e2e0ff' }}>{s.area}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                          background: `${impactColor(s.impact)}18`, color: impactColor(s.impact),
                          border: `1px solid ${impactColor(s.impact)}40`,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}>
                          {s.impact} impact
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#8b8aad', lineHeight: 1.6 }}>{s.action}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Re-analyze button */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 40 }}>
              <button onClick={analyze} className="neu-btn font-bold text-sm px-8 py-3"
                style={{ color: '#a78bfa', borderRadius: 12 }}>
                ↺ Re-analyze
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0 80px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(14,165,233,0.1))',
              border: '1px solid rgba(167,139,250,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32,
            }}>🎯</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#e2e0ff', marginBottom: 8 }}>
              Ready to analyze your resume
            </p>
            <p style={{ fontSize: 14, color: '#8b8aad' }}>
              Paste your resume and job description above, then click Analyze Job Match
            </p>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}