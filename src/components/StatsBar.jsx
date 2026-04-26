import React, { useMemo } from 'react';
import { AlertTriangle, TrendingUp, Database, MapPin, Shield } from 'lucide-react';
import crimeData from '../data/crimes.json';

export default function StatsBar({ areas, filters }) {
  const stats = useMemo(() => {
    const totalCases = areas.reduce((s, a) => s + a.filteredTotal, 0);

    const mostDangerous = areas.reduce((prev, curr) =>
      curr.filteredTotal > prev.filteredTotal ? curr : prev, areas[0]);

    const typeCounts = {};
    areas.forEach(a => {
      (a.filteredCrimes?.length ? a.filteredCrimes : a.crimes).forEach(c => {
        typeCounts[c.type] = (typeCounts[c.type] || 0) + c.count;
      });
    });
    const topCrime = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

    // City-wide totals from meta
    const cityIPC = crimeData.city_totals?.total_ipc || 37181;
    const cityTotal = cityIPC + (crimeData.city_totals?.total_sll || 19291);

    return { totalCases, mostDangerous, topCrime, cityTotal, cityIPC };
  }, [areas]);

  const Stat = ({ icon: Icon, label, value, highlight, subValue }) => (
    <div className="flex items-center gap-4 flex-1 min-w-0 px-5"
      style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{
        width: '32px', height: '32px', border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        borderRadius: '8px'
      }}>
        <Icon size={14} style={{ color: highlight ? 'var(--accent)' : '#a0a0a0' }} />
      </div>
      <div className="min-w-0">
        <div style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '2px' }}>{label}</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600,
          color: highlight ? 'var(--accent)' : 'var(--text)',
          textShadow: highlight ? '0 0 10px rgba(255,34,51,0.4)' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {value}
        </div>
        {subValue && <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>{subValue}</div>}
      </div>
    </div>
  );

  return (
    <div className="panel pointer-events-auto mx-4 mb-4"
      style={{ borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: 0, boxShadow: '0 -4px 20px rgba(0,0,0,0.5)' }}>
      <div className="flex items-stretch" style={{ minHeight: '64px' }}>

        <div className="flex items-center gap-2 px-5 flex-shrink-0"
          style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="pulse-dot" />
          <span style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px' }}>LIVE</span>
        </div>

        <Stat icon={Database} label="CITY-WIDE IPC CRIMES 2025" value={stats.cityIPC.toLocaleString()}
          subValue="KSP Official Data" highlight={true} />

        <Stat icon={AlertTriangle} label="HIGHEST CRIME ZONE"
          value={stats.mostDangerous ? stats.mostDangerous.name : 'N/A'}
          subValue={stats.mostDangerous ? `${stats.mostDangerous.total_crimes.toLocaleString()} reported` : ''} />

        <Stat icon={TrendingUp} label="TOP CRIME TYPE"
          value={stats.topCrime ? stats.topCrime[0].split(' ')[0] : 'N/A'}
          subValue={stats.topCrime ? `${stats.topCrime[1].toLocaleString()} city-wide` : ''} />

        <Stat icon={MapPin} label="ZONES MAPPED" value={`${areas.length} AREAS`}
          subValue="Click any marker for details" />

        <Stat icon={Shield} label="CYBERCRIME 2025"
          value="14,885" subValue="IT Act cases city-wide" />

        <div className="flex items-center px-5 flex-shrink-0"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '12px',
            padding: '4px 12px', letterSpacing: '1px', borderRadius: '4px'
          }}>
            2025
          </div>
        </div>
      </div>
    </div>
  );
}
