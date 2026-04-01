import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api';

// ─── Shared styles ────────────────────────────────────────────────────────────
const s = {
  page:       { padding: 28 },
  topRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  title:      { fontSize: 20, fontWeight: 700, color: '#e2e8f0' },
  tabs:       { display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' },
  tab:    a => ({ padding: '7px 16px', borderRadius: 6, border: `1px solid ${a ? '#58a6ff' : '#30363d'}`, background: a ? '#58a6ff22' : 'transparent', color: a ? '#58a6ff' : '#8b949e', fontSize: 13, cursor: 'pointer' }),
  filters:    { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  input:      { padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e2e8f0', fontSize: 13, outline: 'none' },
  select:     { padding: '8px 10px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e2e8f0', fontSize: 13, outline: 'none' },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:         { textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #30363d', color: '#8b949e', fontWeight: 600 },
  td:         { padding: '10px 12px', borderBottom: '1px solid #21262d', color: '#e2e8f0', verticalAlign: 'middle' },
  cancelBtn:  { padding: '8px 16px', background: 'transparent', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', fontSize: 13, cursor: 'pointer' },
  exportBtn:  { padding: '8px 14px', background: 'transparent', border: '1px solid #3fb950', borderRadius: 6, color: '#3fb950', fontSize: 13, cursor: 'pointer' },
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:      { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 28, width: 820, maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto' },
  modalTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#e2e8f0' },
  grid2:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  grid4:      { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 },
  panel:      { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 20 },
  panelTitle: { fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' },
  statCard:   { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '18px 20px' },
  statVal:    { fontSize: 28, fontWeight: 700, color: '#e2e8f0', lineHeight: 1 },
  statLabel:  { fontSize: 12, color: '#8b949e', marginTop: 6 },
  barRow:     { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  barLabel:   { fontSize: 13, color: '#e2e8f0', width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  barTrack:   { flex: 1, background: '#21262d', borderRadius: 4, height: 8, overflow: 'hidden' },
  barCount:   { fontSize: 12, color: '#8b949e', width: 40, textAlign: 'right', flexShrink: 0 },
  flag:       { fontSize: 15, marginRight: 6 },
};

const resultColor = { valid: '#3fb950', expired: '#d29922', revoked: '#f85149', not_found: '#8b949e' };
const platformColor = { windows: '#58a6ff', android: '#3fb950', ios: '#a78bfa', mac: '#f0883e', linux: '#d29922', unknown: '#8b949e' };

function countryFlag(code) {
  if (!code || code === 'LO') return '🌐';
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function exportCSV(rows, filename) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv  = [keys.join(','), ...rows.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function BarChart({ data, color = '#58a6ff', labelKey = 'label', valueKey = 'count' }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div>
      {data.map((d, i) => (
        <div key={i} style={s.barRow}>
          <div style={s.barLabel}>{d[labelKey]}</div>
          <div style={s.barTrack}>
            <div style={{ width: `${(d[valueKey] / max) * 100}%`, background: color, height: '100%', borderRadius: 4, transition: 'width .3s' }} />
          </div>
          <div style={s.barCount}>{d[valueKey]}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Sparkline (SVG) ─────────────────────────────────────────────────────────
function Sparkline({ data, color = '#58a6ff', height = 48 }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 300, h = height, pad = 4;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1 || 1)) * (w - pad * 2);
    const y = h - pad - ((v / max) * (h - pad * 2));
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState('30');

  useEffect(() => {
    api.get('/usage/analytics', { params: { days } }).then(r => setData(r.data));
  }, [days]);

  if (!data) return <div style={{ color: '#8b949e', padding: 20 }}>Loading...</div>;

  const { daily, byResult, byPlatform, byVersion, byHour, topLicenses, totals } = data;

  return (
    <>
      {/* KPI cards */}
      <div style={s.grid4}>
        {[
          { label: 'Total Checks',      val: totals.total,            color: '#58a6ff' },
          { label: 'Unique Licenses',   val: totals.unique_keys,      color: '#3fb950' },
          { label: 'Unique Machines',   val: totals.unique_machines,  color: '#d29922' },
          { label: 'Countries',         val: totals.unique_countries, color: '#a78bfa' },
        ].map(c => (
          <div key={c.label} style={s.statCard}>
            <div style={{ ...s.statVal, color: c.color }}>{c.val ?? 0}</div>
            <div style={s.statLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Daily trend */}
      <div style={{ ...s.panel, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={s.panelTitle}>📈 Daily Checks</div>
          <select style={s.select} value={days} onChange={e => setDays(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
        {daily.length === 0
          ? <div style={{ color: '#8b949e', fontSize: 13 }}>No data for this period</div>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ ...s.table, minWidth: 500 }}>
                <thead><tr>
                  {['Date', 'Total', 'Valid', 'Expired', 'Revoked', 'Not Found', 'Trend'].map(h => <th key={h} style={s.th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {daily.map(d => (
                    <tr key={d.day}>
                      <td style={s.td}>{d.day}</td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{d.total}</td>
                      <td style={{ ...s.td, color: '#3fb950' }}>{d.valid}</td>
                      <td style={{ ...s.td, color: '#d29922' }}>{d.expired}</td>
                      <td style={{ ...s.td, color: '#f85149' }}>{d.revoked}</td>
                      <td style={{ ...s.td, color: '#8b949e' }}>{d.not_found}</td>
                      <td style={{ ...s.td, width: 80 }}>
                        <Sparkline data={[d.valid, d.expired, d.revoked, d.not_found]} height={24} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      <div style={s.grid2}>
        {/* Result breakdown */}
        <div style={s.panel}>
          <div style={s.panelTitle}>✅ Result Breakdown</div>
          <BarChart data={byResult.map(r => ({ label: r.result, count: r.count }))}
            color="#58a6ff" labelKey="label" valueKey="count" />
        </div>

        {/* Platform breakdown */}
        <div style={s.panel}>
          <div style={s.panelTitle}>💻 Platform Breakdown</div>
          <BarChart data={byPlatform.map(r => ({ label: r.platform, count: r.count }))}
            color="#3fb950" labelKey="label" valueKey="count" />
        </div>
      </div>

      <div style={s.grid2}>
        {/* Hourly heatmap */}
        <div style={s.panel}>
          <div style={s.panelTitle}>🕐 Checks by Hour (UTC)</div>
          {byHour.length === 0
            ? <div style={{ color: '#8b949e', fontSize: 13 }}>No data</div>
            : (
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {Array.from({ length: 24 }, (_, h) => {
                  const found = byHour.find(r => r.hour === h);
                  const count = found?.count || 0;
                  const max   = Math.max(...byHour.map(r => r.count), 1);
                  const alpha = count ? 0.15 + (count / max) * 0.85 : 0.05;
                  return (
                    <div key={h} title={`${h}:00 — ${count} checks`}
                      style={{ width: 32, height: 32, borderRadius: 4, background: `rgba(88,166,255,${alpha})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: count ? '#e2e8f0' : '#30363d', cursor: 'default' }}>
                      {h}
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>

        {/* Version breakdown */}
        <div style={s.panel}>
          <div style={s.panelTitle}>🔖 Software Versions</div>
          <BarChart data={byVersion.map(r => ({ label: r.version, count: r.count }))}
            color="#a78bfa" labelKey="label" valueKey="count" />
        </div>
      </div>

      {/* Top licenses */}
      <div style={s.panel}>
        <div style={s.panelTitle}>🏆 Most Active Licenses</div>
        <table style={s.table}>
          <thead><tr>{['License Key', 'Holder', 'Plan', 'Total Checks'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {topLicenses.length === 0 && <tr><td colSpan={4} style={{ ...s.td, color: '#8b949e', textAlign: 'center' }}>No data</td></tr>}
            {topLicenses.map(r => (
              <tr key={r.license_key}>
                <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11 }}>{r.license_key}</td>
                <td style={s.td}>{r.owner_name || '—'}</td>
                <td style={s.td}>{r.plan || '—'}</td>
                <td style={{ ...s.td, fontWeight: 700, color: '#58a6ff' }}>{r.checks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Summary Tab ─────────────────────────────────────────────────────────────
function SummaryTab() {
  const [rows, setRows]       = useState([]);
  const [detail, setDetail]   = useState(null);
  const [detailRows, setDetailRows] = useState([]);

  useEffect(() => { api.get('/usage/summary').then(r => setRows(r.data)); }, []);

  const openDetail = async key => {
    const { data } = await api.get(`/usage/${encodeURIComponent(key)}`);
    setDetail(key); setDetailRows(data);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <button style={s.exportBtn} onClick={() => exportCSV(rows, 'usage-summary.csv')}>⬇ Export CSV</button>
      </div>
      <div style={{ overflowX: 'auto', background: '#161b22', borderRadius: 10, border: '1px solid #30363d' }}>
        <table style={s.table}>
          <thead>
            <tr>{['License Key','Holder','Plan','Status','Total','Valid','Failed','Machines','IPs','Countries','Last Seen',''].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={12} style={{ ...s.td, textAlign: 'center', color: '#8b949e' }}>No usage data yet</td></tr>}
            {rows.map(row => (
              <tr key={row.license_key}>
                <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11 }}>{row.license_key}</td>
                <td style={s.td}>{row.holder_name || '—'}</td>
                <td style={s.td}>{row.plan || '—'}</td>
                <td style={s.td}><span style={{ color: row.status === 'active' ? '#3fb950' : '#f85149', fontSize: 12 }}>{row.status || '—'}</span></td>
                <td style={{ ...s.td, textAlign: 'center', fontWeight: 600 }}>{row.total_checks}</td>
                <td style={{ ...s.td, textAlign: 'center', color: '#3fb950' }}>{row.valid_checks}</td>
                <td style={{ ...s.td, textAlign: 'center', color: '#f85149' }}>{row.failed_checks}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{row.unique_machines}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{row.unique_ips}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{row.unique_countries}</td>
                <td style={s.td}>{row.last_seen?.slice(0, 16) || '—'}</td>
                <td style={s.td}>
                  <button style={{ ...s.cancelBtn, fontSize: 12, padding: '4px 10px', color: '#58a6ff', borderColor: '#58a6ff' }}
                    onClick={() => openDetail(row.license_key)}>Logs</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div style={s.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={s.modalTitle}>Logs — <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#58a6ff' }}>{detail}</span></div>
              <button style={s.exportBtn} onClick={() => exportCSV(detailRows, `logs-${detail}.csv`)}>⬇ CSV</button>
            </div>
            <table style={s.table}>
              <thead><tr>{['Time','Result','Country','City','IP','ISP','Machine ID','Platform','Version'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {detailRows.map(r => (
                  <tr key={r.id}>
                    <td style={s.td}>{r.checked_at?.slice(0, 16)}</td>
                    <td style={s.td}><span style={{ color: resultColor[r.result] || '#e2e8f0', fontSize: 12, fontWeight: 600 }}>{r.result}</span></td>
                    <td style={s.td}>{r.country ? <><span style={s.flag}>{countryFlag(r.country_code)}</span>{r.country}</> : '—'}</td>
                    <td style={s.td}>{r.city || '—'}</td>
                    <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11 }}>{r.ip_address || '—'}</td>
                    <td style={s.td}>{r.isp || '—'}</td>
                    <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11 }}>{r.machine_id || '—'}</td>
                    <td style={s.td}>{r.platform || '—'}</td>
                    <td style={s.td}>{r.software_version || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 16, textAlign: 'right' }}><button style={s.cancelBtn} onClick={() => setDetail(null)}>Close</button></div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Logs Tab ─────────────────────────────────────────────────────────────────
function LogsTab() {
  const [rows, setRows]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [search, setSearch] = useState('');
  const [result, setResult] = useState('');
  const [platform, setPlatform] = useState('');
  const [country, setCountry]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [page, setPage]     = useState(1);
  const limit = 30;

  const load = useCallback(() => {
    api.get('/usage', { params: { license_key: search, result, platform, country, date_from: dateFrom, date_to: dateTo, page, limit } })
      .then(r => { setRows(r.data.data); setTotal(r.data.total); });
  }, [search, result, platform, country, dateFrom, dateTo, page]);

  useEffect(() => { load(); }, [load]);

  const reset = () => { setSearch(''); setResult(''); setPlatform(''); setCountry(''); setDateFrom(''); setDateTo(''); setPage(1); };
  const pages = Math.ceil(total / limit);

  return (
    <>
      <div style={s.filters}>
        <input style={s.input} placeholder="License key..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select style={s.select} value={result} onChange={e => { setResult(e.target.value); setPage(1); }}>
          <option value="">All Results</option>
          <option value="valid">Valid</option><option value="expired">Expired</option>
          <option value="revoked">Revoked</option><option value="not_found">Not Found</option>
        </select>
        <select style={s.select} value={platform} onChange={e => { setPlatform(e.target.value); setPage(1); }}>
          <option value="">All Platforms</option>
          <option value="windows">Windows</option><option value="android">Android</option>
          <option value="ios">iOS</option><option value="mac">Mac</option><option value="linux">Linux</option>
        </select>
        <input style={s.input} placeholder="Country..." value={country} onChange={e => { setCountry(e.target.value); setPage(1); }} />
        <input style={{ ...s.input, width: 130 }} type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} title="From date" />
        <input style={{ ...s.input, width: 130 }} type="date" value={dateTo}   onChange={e => { setDateTo(e.target.value);   setPage(1); }} title="To date" />
        <button style={s.cancelBtn} onClick={reset}>Reset</button>
        <button style={s.exportBtn} onClick={() => exportCSV(rows, 'usage-logs.csv')}>⬇ CSV</button>
      </div>
      <div style={{ color: '#8b949e', fontSize: 12, marginBottom: 10 }}>{total} records</div>
      <div style={{ overflowX: 'auto', background: '#161b22', borderRadius: 10, border: '1px solid #30363d' }}>
        <table style={s.table}>
          <thead><tr>{['Time','License Key','Result','Platform','Country','City','IP Address','ISP','Version'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={9} style={{ ...s.td, textAlign: 'center', color: '#8b949e' }}>No logs found</td></tr>}
            {rows.map(row => (
              <tr key={row.id}>
                <td style={s.td}>{row.checked_at?.slice(0, 16)}</td>
                <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11 }}>{row.license_key}</td>
                <td style={s.td}><span style={{ color: resultColor[row.result] || '#e2e8f0', fontSize: 12, fontWeight: 600 }}>{row.result}</span></td>
                <td style={s.td}><span style={{ color: platformColor[row.platform] || '#8b949e', fontSize: 12 }}>{row.platform || '—'}</span></td>
                <td style={s.td}>{row.country ? <><span style={s.flag}>{countryFlag(row.country_code)}</span>{row.country}</> : '—'}</td>
                <td style={s.td}>{row.city || '—'}</td>
                <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11 }}>{row.ip_address || '—'}</td>
                <td style={s.td}>{row.isp || '—'}</td>
                <td style={s.td}>{row.software_version || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {Array.from({ length: Math.min(pages, 20) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ ...s.cancelBtn, ...(p === page ? { background: '#21262d', color: '#e2e8f0' } : {}) }}>{p}</button>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Platforms Tab ────────────────────────────────────────────────────────────
function PlatformsTab() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/usage/platforms').then(r => setData(r.data)); }, []);
  if (!data) return <div style={{ color: '#8b949e', padding: 20 }}>Loading...</div>;
  const { summary, trend } = data;

  // Build trend map: { platform: { day: count } }
  const trendMap = {};
  const trendDays = [...new Set(trend.map(r => r.day))].sort();
  trend.forEach(r => {
    if (!trendMap[r.platform]) trendMap[r.platform] = {};
    trendMap[r.platform][r.day] = r.count;
  });

  return (
    <>
      <div style={s.grid2}>
        {summary.map(p => {
          const color = platformColor[p.platform] || '#8b949e';
          const sparkData = trendDays.map(d => trendMap[p.platform]?.[d] || 0);
          const successRate = p.total_checks ? Math.round((p.valid / p.total_checks) * 100) : 0;
          return (
            <div key={p.platform} style={{ ...s.panel, borderColor: color + '44' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color, textTransform: 'capitalize' }}>{p.platform}</div>
                  <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>Last seen: {p.last_seen?.slice(0, 10) || '—'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0' }}>{p.total_checks}</div>
                  <div style={{ fontSize: 11, color: '#8b949e' }}>total checks</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Licenses',  val: p.unique_licenses },
                  { label: 'Machines',  val: p.unique_machines },
                  { label: 'IPs',       val: p.unique_ips },
                  { label: 'Success',   val: `${successRate}%` },
                ].map(c => (
                  <div key={c.label} style={{ background: '#0d1117', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{c.val}</div>
                    <div style={{ fontSize: 10, color: '#8b949e' }}>{c.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4 }}>Valid / Failed</div>
                  <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: '#21262d' }}>
                    <div style={{ width: `${successRate}%`, background: '#3fb950' }} />
                    <div style={{ flex: 1, background: '#f85149' }} />
                  </div>
                </div>
              </div>
              {sparkData.some(v => v > 0) && (
                <div>
                  <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4 }}>14-day trend</div>
                  <Sparkline data={sparkData} color={color} height={36} />
                </div>
              )}
            </div>
          );
        })}
        {summary.length === 0 && <div style={{ color: '#8b949e', fontSize: 13 }}>No platform data yet</div>}
      </div>
    </>
  );
}

// ─── Geo Tab ──────────────────────────────────────────────────────────────────
function GeoTab() {
  const [geo, setGeo] = useState(null);
  useEffect(() => {
    api.get('/geo/usage').then(r => setGeo(r.data)).catch(() => setGeo({ byCountry: [], byCity: [], recentGeo: [] }));
  }, []);
  if (!geo) return <div style={{ color: '#8b949e', padding: 20 }}>Loading...</div>;
  const maxCountry = geo.byCountry?.[0]?.count || 1;
  const maxCity    = geo.byCity?.[0]?.count    || 1;

  return (
    <>
      <div style={s.grid2}>
        <div style={s.panel}>
          <div style={s.panelTitle}>🌍 By Country</div>
          {geo.byCountry.length === 0
            ? <div style={{ color: '#8b949e', fontSize: 13 }}>No geo data yet</div>
            : geo.byCountry.map(c => (
              <div key={c.country} style={s.barRow}>
                <div style={s.barLabel}><span style={s.flag}>{countryFlag(c.country_code)}</span>{c.country || 'Unknown'}</div>
                <div style={s.barTrack}><div style={{ width: `${(c.count / maxCountry) * 100}%`, background: '#58a6ff', height: '100%', borderRadius: 4 }} /></div>
                <div style={s.barCount}>{c.count}</div>
              </div>
            ))
          }
        </div>
        <div style={s.panel}>
          <div style={s.panelTitle}>🏙️ Top Cities</div>
          {geo.byCity.length === 0
            ? <div style={{ color: '#8b949e', fontSize: 13 }}>No city data yet</div>
            : geo.byCity.map(c => (
              <div key={`${c.city}-${c.country}`} style={s.barRow}>
                <div style={s.barLabel}>{c.city}<span style={{ color: '#8b949e', fontSize: 11 }}>, {c.country}</span></div>
                <div style={s.barTrack}><div style={{ width: `${(c.count / maxCity) * 100}%`, background: '#3fb950', height: '100%', borderRadius: 4 }} /></div>
                <div style={s.barCount}>{c.count}</div>
              </div>
            ))
          }
        </div>
      </div>
      <div style={s.panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={s.panelTitle}>📡 Recent Unique Users</div>
          <button style={s.exportBtn} onClick={() => exportCSV(geo.recentGeo, 'geo-users.csv')}>⬇ CSV</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead><tr>{['IP Address','Country','City','Region','ISP','Last Seen'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {geo.recentGeo.length === 0 && <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#8b949e' }}>No data yet</td></tr>}
              {geo.recentGeo.map(r => (
                <tr key={r.ip_address}>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11 }}>{r.ip_address}</td>
                  <td style={s.td}>{r.country ? <><span style={s.flag}>{countryFlag(r.country_code)}</span>{r.country}</> : '—'}</td>
                  <td style={s.td}>{r.city || '—'}</td>
                  <td style={s.td}>{r.region || '—'}</td>
                  <td style={s.td}>{r.isp || '—'}</td>
                  <td style={s.td}>{r.last_seen?.slice(0, 16) || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Usage() {
  const [tab, setTab] = useState('analytics');
  return (
    <div style={s.page}>
      <div style={s.topRow}><div style={s.title}>📊 Usage & Analytics</div></div>
      <div style={s.tabs}>
        <button style={s.tab(tab === 'analytics')} onClick={() => setTab('analytics')}>📈 Analytics</button>
        <button style={s.tab(tab === 'summary')}   onClick={() => setTab('summary')}>📋 Summary</button>
        <button style={s.tab(tab === 'logs')}      onClick={() => setTab('logs')}>🗒 Raw Logs</button>
        <button style={s.tab(tab === 'platforms')} onClick={() => setTab('platforms')}>💻 Platforms</button>
        <button style={s.tab(tab === 'geo')}       onClick={() => setTab('geo')}>🌍 Geo</button>
      </div>
      {tab === 'analytics' && <AnalyticsTab />}
      {tab === 'summary'   && <SummaryTab />}
      {tab === 'logs'      && <LogsTab />}
      {tab === 'platforms' && <PlatformsTab />}
      {tab === 'geo'       && <GeoTab />}
    </div>
  );
}
