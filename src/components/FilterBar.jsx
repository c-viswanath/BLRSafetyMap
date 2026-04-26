import React from 'react';
import { Thermometer, Layers } from 'lucide-react';

export default function FilterBar({ filters, setFilters, crimeTypes, years }) {
  const update = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  return (
    <div
      className="panel pointer-events-auto mx-4 mt-4 px-6 py-3"
      style={{ borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
    >
      <div className="flex items-center gap-6 flex-wrap">

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="pulse-dot" />
          <span className="glitch-text" style={{
            fontFamily: 'var(--font-mono)', fontSize: '13px',
            color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold',
          }}>
            BLR_CRIME<span className="blink">_</span>MAP
          </span>
          <span style={{
            fontSize: '9px', color: '#444', letterSpacing: '1px',
            borderLeft: '1px solid #333', paddingLeft: '8px',
          }}>2025 · LIVE DATA</span>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* Crime type */}
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px', fontFamily: 'var(--font-ui)' }}>CRIME</span>
          <select
            id="filter-crime-type"
            className="custom-select"
            value={filters.crimeType}
            onChange={e => update('crimeType', e.target.value)}
          >
            {crimeTypes.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* Layer toggle */}
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px', fontFamily: 'var(--font-ui)' }}>VIEW</span>
          <button
            id="toggle-heatmap"
            className={`toggle-btn flex items-center gap-1.5 ${filters.layerMode === 'heatmap' ? 'active' : ''}`}
            onClick={() => update('layerMode', 'heatmap')}
          >
            <Thermometer size={11} /> HEATMAP
          </button>
          <button
            id="toggle-markers"
            className={`toggle-btn flex items-center gap-1.5 ${filters.layerMode === 'markers' ? 'active' : ''}`}
            onClick={() => update('layerMode', 'markers')}
          >
            <Layers size={11} /> MARKERS ONLY
          </button>
        </div>

        {/* Data source badge */}
        <div className="ml-auto flex-shrink-0 flex items-center gap-1.5">
          <div style={{
            fontSize: '9px', color: '#555', letterSpacing: '1px', fontFamily: 'var(--font-mono)',
            border: '1px solid #222', padding: '2px 8px',
          }}>
            SOURCE: KSP · OPENCITY.IN
          </div>
        </div>
      </div>
    </div>
  );
}
