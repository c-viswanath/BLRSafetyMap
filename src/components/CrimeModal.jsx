import React, { useEffect } from 'react';
import { X, MapPin, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip as RechartTooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const CRIME_COLORS = [
  '#ff2233', '#ff5500', '#ff8800', '#ffaa00', '#ffcc00',
  '#cc00ff', '#00aaff', '#00ff88', '#ff0066', '#66ff00',
];

const RISK_CONFIG = {
  'Very High': { color: '#ff2233', bg: 'rgba(255,34,51,0.15)', border: 'rgba(255,34,51,0.6)' },
  'High':      { color: '#ff4400', bg: 'rgba(255,68,0,0.15)',  border: 'rgba(255,68,0,0.6)' },
  'Medium-High': { color: '#ff7700', bg: 'rgba(255,119,0,0.12)', border: 'rgba(255,119,0,0.5)' },
  'Medium':    { color: '#ffaa00', bg: 'rgba(255,170,0,0.10)', border: 'rgba(255,170,0,0.4)' },
  'Low-Medium': { color: '#ffcc44', bg: 'rgba(255,204,68,0.08)', border: 'rgba(255,204,68,0.35)' },
};

function getStatusClass(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('solved') || s.includes('arrested')) return 'status-solved';
  if (s.includes('charge')) return 'status-charge';
  return 'status-pending';
}

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(8,8,8,0.97)', border: '1px solid rgba(255,34,51,0.5)',
        padding: '6px 10px', fontFamily: 'var(--font-mono)', fontSize: '11px', borderRadius: '2px',
      }}>
        <div style={{ color: payload[0].payload.fill }}>{payload[0].name}</div>
        <div style={{ color: '#e0e0e0' }}>{payload[0].value.toLocaleString()} cases</div>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(8,8,8,0.97)', border: '1px solid rgba(255,34,51,0.4)',
        padding: '5px 9px', fontFamily: 'var(--font-mono)', fontSize: '11px', borderRadius: '2px',
      }}>
        <div style={{ color: '#ff2233' }}>{payload[0].value.toLocaleString()} cases</div>
      </div>
    );
  }
  return null;
};

export default function CrimeModal({ area, onClose }) {
  const crimes = area.filteredCrimes?.length > 0 ? area.filteredCrimes : area.crimes;
  const riskCfg = RISK_CONFIG[area.risk_level] || RISK_CONFIG['Medium'];

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Recharts data
  const pieData = crimes.map((c, i) => ({
    name: c.type, value: c.count, fill: CRIME_COLORS[i % CRIME_COLORS.length],
  }));

  const barData = crimes
    .slice()
    .sort((a, b) => b.count - a.count)
    .map((c, i) => ({
      name: c.type.length > 18 ? c.type.slice(0, 16) + '…' : c.type,
      fullName: c.type,
      count: c.count,
      fill: CRIME_COLORS[i % CRIME_COLORS.length],
    }));

  return (
    /* Backdrop */
    <div
      className="absolute inset-0 z-[2000] flex items-end md:items-start justify-center md:justify-end pointer-events-none p-0 md:p-6"
    >
      {/* Dialog */}
      <div
        className="panel fade-in relative flex flex-col pointer-events-auto w-full h-[90vh] md:w-[640px] md:max-w-[65vw] md:h-full rounded-t-2xl md:rounded-2xl p-6 md:p-8"
        style={{
          border: `1px solid ${riskCfg.border}80`,
          boxShadow: `0 -8px 32px rgba(0,0,0,0.4), 0 0 40px ${riskCfg.color}15`,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 flex items-start justify-between pb-6"
          style={{ borderBottom: `1px solid ${riskCfg.border}30` }}
        >
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px' }}>
              BENGALURU CRIME INTELLIGENCE · 2025
            </div>
            <h2
              className="font-bold tracking-wider uppercase mb-3"
              style={{
                fontFamily: 'var(--font-ui)', fontSize: '24px',
                color: riskCfg.color, textShadow: `0 0 15px ${riskCfg.color}60`,
              }}
            >
              {area.name}
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5" style={{ color: 'var(--text-dim)', fontSize: '11px' }}>
                <MapPin size={11} style={{ color: 'var(--accent)' }} />
                {area.lat.toFixed(4)}°N · {area.lng.toFixed(4)}°E
              </div>
              <div style={{
                padding: '2px 8px', borderRadius: '2px', fontSize: '10px', letterSpacing: '1px',
                background: riskCfg.bg, border: `1px solid ${riskCfg.border}`,
                color: riskCfg.color, fontFamily: 'var(--font-mono)',
              }}>
                ⚠ {area.risk_level?.toUpperCase()} RISK
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '11px' }}>{area.division}</div>
            </div>
          </div>

          {/* Total stat */}
          <div className="flex flex-col md:flex-row items-end md:items-start gap-2 md:gap-5">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '4px' }}>TOTAL CASES</div>
              <div style={{
                fontSize: '44px', lineHeight: 1, fontFamily: 'var(--font-mono)', fontWeight: 600,
                color: riskCfg.color, textShadow: `0 0 20px ${riskCfg.color}50`,
              }}>
                {area.total_crimes.toLocaleString()}
              </div>
            </div>
            <button
              onClick={onClose}
              id="close-modal"
              style={{
                background: 'transparent', border: '1px solid rgba(255,34,51,0.45)',
                color: 'var(--accent)', width: '32px', height: '32px', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, borderRadius: '2px', transition: 'all 0.2s',
              }}
              aria-label="Close"
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,34,51,0.15)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6 hide-scrollbar">
          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Pie chart Card */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '16px' }}>
                CRIME DISTRIBUTION
              </div>
              <div className="flex items-center gap-4">
                <PieChart width={160} height={160}>
                  <Pie
                    data={pieData}
                    cx={78} cy={78} innerRadius={45} outerRadius={75}
                    dataKey="value" startAngle={90} endAngle={-270}
                    strokeWidth={0}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartTooltip content={<CustomPieTooltip />} />
                </PieChart>
                <div className="flex flex-col gap-1.5 flex-1">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div style={{ width: '8px', height: '8px', background: entry.fill, borderRadius: '1px', flexShrink: 0, boxShadow: `0 0 4px ${entry.fill}` }} />
                      <span style={{ color: 'var(--text)', fontSize: '10px', flex: 1, lineHeight: 1.3 }}>{entry.name}</span>
                      <span style={{ color: entry.fill, fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>{entry.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bar chart Card */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '16px' }}>
                CASE VOLUME
              </div>
              <ResponsiveContainer width="100%" height={175}>
                <BarChart data={barData} margin={{ top: 0, right: 8, bottom: 40, left: 0 }} barSize={14}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: '#666' }}
                    axisLine={false} tickLine={false}
                    angle={-35} textAnchor="end" interval={0}
                  />
                  <YAxis
                    tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: '#555' }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
                  />
                  <RechartTooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,34,51,0.08)' }} />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Crime type IPC details Card */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '16px' }}>
              OFFENSE BREAKDOWN
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {crimes.map((c, i) => {
                const clr = CRIME_COLORS[i % CRIME_COLORS.length];
                const maxCount = Math.max(...crimes.map(x => x.count));
                const pct = (c.count / maxCount) * 100;
                return (
                  <div key={c.type} style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    padding: '12px', borderRadius: '8px',
                  }}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span style={{ color: clr, fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700 }}>
                        {c.count.toLocaleString()}
                      </span>
                      <span style={{ color: '#555', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>§{c.ipc}</span>
                    </div>
                    <div style={{ color: 'var(--text)', fontSize: '10px', marginBottom: '5px' }}>{c.type}</div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: clr, borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Case records Card */}
          {area.records && area.records.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
              <div className="flex items-center gap-3 mb-5">
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px' }}>
                  RECENT RECORDS
                </div>
                <span style={{
                  background: 'rgba(255,34,51,0.12)', border: '1px solid rgba(255,34,51,0.35)',
                  color: 'var(--accent)', fontSize: '10px', padding: '1px 6px', fontFamily: 'var(--font-mono)',
                }}>
                  {area.records.length}
                </span>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: '1fr' }}>
                {area.records.map((record, i) => (
                  <div
                    key={record.case_id}
                    className="fade-in"
                    style={{
                      border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)',
                      padding: '12px 16px', borderRadius: '8px', animationDelay: `${i * 0.05}s`,
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span style={{ color: 'var(--accent)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                        #{record.case_id}
                      </span>
                      <span className={`status-badge ${getStatusClass(record.status)}`}>{record.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <div style={{ fontSize: '11px', color: 'var(--text)' }}>{record.type}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                        {record.date} · {record.victim_gender}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="flex-shrink-0 pt-4 flex items-center justify-between"
          style={{ borderTop: `1px solid rgba(255,255,255,0.05)`, fontSize: '11px', color: 'var(--text-dim)' }}
        >
          <div className="flex items-center gap-2">
            <span>Source: OpenCity.in</span>
          </div>
          <span style={{ color: '#555' }}>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
