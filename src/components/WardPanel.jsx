import React from 'react';

const CRIME_COLORS = {
  'Theft': '#ff2233',
  'Assault': '#ff6600',
  'Robbery': '#ff0088',
  'Cybercrime': '#00aaff',
  'Fraud': '#aa00ff',
  'Burglary': '#ff8800',
  'Pickpocketing': '#ff3355',
  'default': '#ff2233',
};

function getStatusClass(status) {
  if (!status) return 'status-pending';
  const s = status.toLowerCase();
  if (s.includes('solved') || s.includes('arrested')) return 'status-solved';
  if (s.includes('charge')) return 'status-charge';
  return 'status-pending';
}

function DonutChart({ crimes }) {
  if (!crimes || crimes.length === 0) return null;
  const total = crimes.reduce((s, c) => s + c.count, 0);
  if (total === 0) return null;

  let cumulative = 0;
  const segments = crimes.map(c => {
    const pct = (c.count / total) * 360;
    const start = cumulative;
    cumulative += pct;
    return { ...c, start, pct };
  });

  // Build conic-gradient
  let gradient = 'conic-gradient(';
  gradient += segments.map(s => {
    const color = CRIME_COLORS[s.type] || CRIME_COLORS.default;
    return `${color} ${s.start.toFixed(1)}deg ${(s.start + s.pct).toFixed(1)}deg`;
  }).join(', ');
  gradient += ')';

  return (
    <div className="flex items-center gap-4 mt-3">
      <div
        className="donut-chart"
        style={{ background: gradient, boxShadow: '0 0 18px rgba(255,34,51,0.25)' }}
      >
        <div className="donut-inner">
          <div style={{ color: 'var(--accent)', fontSize: '18px', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
            {total.toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: '9px', marginTop: '2px', letterSpacing: '1px' }}>
            CASES
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        {crimes.slice(0, 4).map(c => (
          <div key={c.type} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
            <div
              className="flex-shrink-0"
              style={{
                width: '8px', height: '8px', borderRadius: '1px',
                background: CRIME_COLORS[c.type] || CRIME_COLORS.default,
                boxShadow: `0 0 4px ${CRIME_COLORS[c.type] || CRIME_COLORS.default}`,
              }}
            />
            <span style={{ flex: 1, color: 'var(--text)', fontSize: '11px' }}>{c.type}</span>
            <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{c.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CrimeBar({ crime, maxCount }) {
  const pct = maxCount > 0 ? (crime.count / maxCount) * 100 : 0;
  const color = CRIME_COLORS[crime.type] || CRIME_COLORS.default;
  return (
    <div className="mb-2.5">
      <div className="flex justify-between items-center mb-1" style={{ fontSize: '11px' }}>
        <span style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{crime.type}</span>
        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>IPC §{crime.ipc}</span>
          <span style={{ color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{crime.count}</span>
        </div>
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
        <div
          className="crime-bar-fill h-full rounded-sm"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 6px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}

function RecordRow({ record, index }) {
  const statusClass = getStatusClass(record.status);
  return (
    <div
      className="fade-in"
      style={{
        border: '1px solid rgba(255,34,51,0.12)',
        background: 'rgba(255,34,51,0.03)',
        padding: '8px 10px',
        marginBottom: '6px',
        borderRadius: '2px',
        animationDelay: `${index * 0.05}s`,
      }}
    >
      <div className="flex justify-between items-center mb-1">
        <span style={{ color: 'var(--accent)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
          #{record.case_id}
        </span>
        <span className={`status-badge ${statusClass}`}>{record.status}</span>
      </div>
      <div className="flex justify-between items-center">
        <div style={{ fontSize: '11px', color: 'var(--text)' }}>{record.type}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
          {record.date} · {record.victim_gender}
        </div>
      </div>
    </div>
  );
}

export default function WardPanel({ area, onClose }) {
  const crimes = area.filteredCrimes?.length > 0 ? area.filteredCrimes : area.crimes;
  const maxCount = Math.max(...crimes.map(c => c.count), 1);

  return (
    <div
      className="panel panel-corner h-full flex flex-col"
      style={{ borderColor: 'rgba(255,34,51,0.5)', borderWidth: '0 0 0 1px' }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 p-4"
        style={{ borderBottom: '1px solid rgba(255,34,51,0.2)' }}
      >
        <div className="flex justify-between items-start">
          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '10px', letterSpacing: '2px', marginBottom: '4px' }}>
              CRIME INTELLIGENCE PANEL
            </div>
            <h2
              className="glitch-text"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '20px',
                color: 'var(--accent)',
                fontWeight: 'bold',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {area.name}
            </h2>
            <div style={{ color: 'var(--text-dim)', fontSize: '11px', marginTop: '4px' }}>
              LAT {area.lat.toFixed(4)} · LNG {area.lng.toFixed(4)}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,34,51,0.4)',
              color: 'var(--accent)',
              width: '28px', height: '28px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        {/* Total crimes stat */}
        <div
          className="mt-3 p-3"
          style={{
            background: 'rgba(255,34,51,0.06)',
            border: '1px solid rgba(255,34,51,0.25)',
            borderRadius: '2px',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '4px' }}>
            TOTAL REPORTED CASES
          </div>
          <div style={{
            fontSize: '36px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
            textShadow: '0 0 20px rgba(255,34,51,0.6)',
            lineHeight: 1,
          }}>
            {area.total_crimes.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4" style={{ overflowX: 'hidden' }}>

        {/* Donut Chart Section */}
        <div style={{ marginBottom: '20px' }}>
          <div className="terminal-label" style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1.5px', marginBottom: '8px' }}>
            CRIME BREAKDOWN
          </div>
          <DonutChart crimes={crimes} />
        </div>

        {/* Bar Charts */}
        <div style={{ marginBottom: '20px' }}>
          <div className="terminal-label" style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1.5px', marginBottom: '10px' }}>
            DISTRIBUTION
          </div>
          {crimes.map(c => (
            <CrimeBar key={c.type} crime={c} maxCount={maxCount} />
          ))}
        </div>

        {/* Records */}
        <div>
          <div
            className="terminal-label flex items-center gap-2"
            style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1.5px', marginBottom: '10px' }}
          >
            CASE RECORDS
            <span style={{
              background: 'rgba(255,34,51,0.15)',
              border: '1px solid rgba(255,34,51,0.4)',
              color: 'var(--accent)',
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: '2px',
            }}>
              {area.records?.length || 0}
            </span>
          </div>
          {area.records?.map((record, i) => (
            <RecordRow key={record.case_id} record={record} index={i} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex-shrink-0 p-3"
        style={{ borderTop: '1px solid rgba(255,34,51,0.2)', fontSize: '10px', color: 'var(--text-dim)' }}
      >
        <div className="flex items-center gap-2">
          <div className="pulse-dot" />
          <span>DATA SOURCE: NCRB · LAST UPDATED 2023</span>
        </div>
      </div>
    </div>
  );
}
