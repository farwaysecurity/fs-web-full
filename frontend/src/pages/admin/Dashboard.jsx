import React, { useEffect, useState } from 'react';
import api from '../../api';

const s = {
  page: { padding: 28 },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#e2e8f0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 },
  card: { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 24 },
  num: { fontSize: 36, fontWeight: 700, marginBottom: 4 },
  label: { color: '#8b949e', fontSize: 13 },
  sub: { color: '#8b949e', fontSize: 12, marginTop: 4 },
  section: { fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  panel: { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 20 },
  panelTitle: { fontSize: 14, fontWeight: 600, color: '#8b949e', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' },
  barRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  barLabel: { fontSize: 13, color: '#e2e8f0', width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  barTrack: { flex: 1, background: '#21262d', borderRadius: 4, height: 8, overflow: 'hidden' },
  barCount: { fontSize: 12, color: '#8b949e', width: 36, textAlign: 'right', flexShrink: 0 },
  flag: { fontSize: 16, marginRight: 6 },
};

const statColors = ['#58a6ff', '#f85149', '#3fb950', '#d29922', '#00d4ff', '#bc8cff', '#f0883e', '#10b981'];

function countryFlag(code) {
  if (!code || code === 'LO') return '🌐';
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [geo, setGeo] = useState(null);
  const [dlStats, setDlStats] = useState(null);

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data));
    api.get('/geo/usage').then(r => setGeo(r.data)).catch(() => {});
    api.get('/downloads/stats').then(r => setDlStats(r.data)).catch(() => {});
  }, []);

  if (!stats) return <div style={{ padding: 28, color: '#8b949e' }}>Loading...</div>;

  const statCards = [
    { label: 'Total Malware Entries', value: stats.totalMalware, color: statColors[0] },
    { label: 'Critical Threats', value: stats.criticalMalware, color: statColors[1] },
    { label: 'Total Licenses', value: stats.totalLicenses, color: statColors[2] },
    { label: 'Active Licenses', value: stats.activeLicenses, color: statColors[3] },
    { label: 'Total Downloads', value: stats.totalDownloads ?? 0, sub: `${stats.todayDownloads ?? 0} today`, color: statColors[4] },
    { label: 'License Checks', value: stats.totalChecks ?? 0, color: statColors[6] },
    { label: 'Unique Users (IP)', value: stats.uniqueUsers ?? 0, color: statColors[7] },
  ];

  const topCountries = geo?.byCountry?.slice(0, 8) || [];
  const dlCountries = dlStats?.byCountry?.slice(0, 8) || [];
  const maxGeo = topCountries[0]?.count || 1;
  const maxDl = dlCountries[0]?.count || 1;

  return (
    <div style={s.page}>
      <div style={s.title}>Dashboard Overview</div>

      <div style={s.grid}>
        {statCards.map(item => (
          <div key={item.label} style={s.card}>
            <div style={{ ...s.num, color: item.color }}>{item.value}</div>
            <div style={s.label}>{item.label}</div>
            {item.sub && <div style={s.sub}>{item.sub}</div>}
          </div>
        ))}
      </div>

      <div style={s.row2}>
        {/* Top countries by license checks */}
        <div style={s.panel}>
          <div style={s.panelTitle}>🌍 Top Countries — License Checks</div>
          {topCountries.length === 0
            ? <div style={{ color: '#8b949e', fontSize: 13 }}>No geo data yet</div>
            : topCountries.map(c => (
              <div key={c.country} style={s.barRow}>
                <div style={s.barLabel}>
                  <span style={s.flag}>{countryFlag(c.country_code)}</span>
                  {c.country || 'Unknown'}
                </div>
                <div style={s.barTrack}>
                  <div style={{ width: `${(c.count / maxGeo) * 100}%`, background: '#58a6ff', height: '100%', borderRadius: 4 }} />
                </div>
                <div style={s.barCount}>{c.count}</div>
              </div>
            ))
          }
        </div>

        {/* Top countries by downloads */}
        <div style={s.panel}>
          <div style={s.panelTitle}>📥 Top Countries — Downloads</div>
          {dlCountries.length === 0
            ? <div style={{ color: '#8b949e', fontSize: 13 }}>No download data yet</div>
            : dlCountries.map(c => (
              <div key={c.country} style={s.barRow}>
                <div style={s.barLabel}>
                  <span style={s.flag}>{countryFlag(c.country_code)}</span>
                  {c.country || 'Unknown'}
                </div>
                <div style={s.barTrack}>
                  <div style={{ width: `${(c.count / maxDl) * 100}%`, background: '#00d4ff', height: '100%', borderRadius: 4 }} />
                </div>
                <div style={s.barCount}>{c.count}</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
