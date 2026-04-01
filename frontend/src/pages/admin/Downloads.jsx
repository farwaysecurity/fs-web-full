import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../../api';

const s = {
  page: { padding: 28 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 20, fontWeight: 700, color: '#e2e8f0' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 },
  statCard: { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '18px 20px' },
  statNum: { fontSize: 30, fontWeight: 700, marginBottom: 4 },
  statLabel: { color: '#8b949e', fontSize: 12 },
  tabs: { display: 'flex', gap: 4, marginBottom: 20 },
  tab: (a) => ({ padding: '7px 16px', borderRadius: 6, border: `1px solid ${a ? '#00d4ff' : '#30363d'}`, background: a ? '#00d4ff22' : 'transparent', color: a ? '#00d4ff' : '#8b949e', fontSize: 13, cursor: 'pointer' }),
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
  panel: { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 20 },
  panelTitle: { fontSize: 13, fontWeight: 600, color: '#8b949e', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' },
  barRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  barLabel: { fontSize: 13, color: '#e2e8f0', width: 140, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  barTrack: { flex: 1, background: '#21262d', borderRadius: 4, height: 8, overflow: 'hidden' },
  barCount: { fontSize: 12, color: '#8b949e', width: 36, textAlign: 'right', flexShrink: 0 },
  flag: { fontSize: 15, marginRight: 6 },
  filters: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  input: { padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e2e8f0', fontSize: 13, outline: 'none' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #30363d', color: '#8b949e', fontWeight: 600 },
  td: { padding: '10px 12px', borderBottom: '1px solid #21262d', color: '#e2e8f0', verticalAlign: 'middle' },
  btn: { padding: '8px 16px', background: '#238636', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600 },
  cancelBtn: { padding: '8px 16px', background: 'transparent', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', fontSize: 13, cursor: 'pointer' },
  dangerBtn: { padding: '5px 10px', background: 'transparent', border: '1px solid #f85149', borderRadius: 5, color: '#f85149', fontSize: 12, cursor: 'pointer' },
  smBtn: (color) => ({ padding: '5px 10px', background: 'transparent', border: `1px solid ${color}`, borderRadius: 5, color, fontSize: 12, cursor: 'pointer', marginRight: 6 }),
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 28, width: 480, maxWidth: '95vw' },
  modalTitle: { fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#e2e8f0' },
  label: { display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 5 },
  mInput: { width: '100%', padding: '8px 10px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 5, color: '#e2e8f0', fontSize: 13, marginBottom: 12, outline: 'none', fontFamily: 'inherit' },
  dropZone: (drag) => ({ border: `2px dashed ${drag ? '#00d4ff' : '#30363d'}`, borderRadius: 8, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 12, background: drag ? 'rgba(0,212,255,0.05)' : 'transparent', transition: 'all 0.2s' }),
  dayBar: { display: 'flex', alignItems: 'flex-end', gap: 3, height: 80, marginTop: 8 },
  dayCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  dayLabel: { fontSize: 9, color: '#8b949e', marginTop: 4, transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' },
};

function fmt(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function countryFlag(code) {
  if (!code || code === 'LO') return '🌐';
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

// ─── Files Tab ────────────────────────────────────────────────────────────────
function FilesTab() {
  const [files, setFiles] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ product: 'Farway AntiVirus', version: '', description: '', platform: 'Windows' });
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(null);
  const fileRef = useRef();

  const load = useCallback(() => {
    api.get('/files').then(r => setFiles(r.data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const openModal = () => { setForm({ product: 'Farway AntiVirus', version: '', description: '', platform: 'Windows' }); setFile(null); setProgress(0); setModal(true); };

  const onDrop = (e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('product', form.product);
    fd.append('version', form.version);
    fd.append('description', form.description);
    fd.append('platform', form.platform);
    try {
      await api.post('/files', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100)),
      });
      setModal(false); load();
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false); setProgress(0);
    }
  };

  const toggle = async (id) => { await api.patch(`/files/${id}/toggle`); load(); };
  const del = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await api.delete(`/files/${id}`); load();
  };

  const copyLink = (id) => {
    const url = `${window.location.origin}/api/files/${id}/download`;
    navigator.clipboard.writeText(url);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button style={s.btn} onClick={openModal}>+ Upload File</button>
      </div>

      <div style={{ overflowX: 'auto', background: '#161b22', borderRadius: 10, border: '1px solid #30363d' }}>
        <table style={s.table}>
          <thead>
            <tr>{['File', 'Product', 'Version', 'Platform', 'Size', 'Downloads', 'Status', 'Uploaded', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {files.length === 0 && <tr><td colSpan={9} style={{ ...s.td, textAlign: 'center', color: '#8b949e' }}>No files uploaded yet</td></tr>}
            {files.map(f => (
              <tr key={f.id}>
                <td style={s.td}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{f.original_name}</div>
                  {f.description && <div style={{ color: '#8b949e', fontSize: 11, marginTop: 2 }}>{f.description}</div>}
                </td>
                <td style={s.td}>{f.product}</td>
                <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 12 }}>{f.version}</td>
                <td style={s.td}>{f.platform || '—'}</td>
                <td style={s.td}>{fmt(f.size)}</td>
                <td style={{ ...s.td, textAlign: 'center', color: '#00d4ff', fontWeight: 600 }}>{f.download_count ?? 0}</td>
                <td style={s.td}>
                  <span style={{ background: f.active ? '#3fb95022' : '#f8514922', color: f.active ? '#3fb950' : '#f85149', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                    {f.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={s.td}>{f.uploaded_at?.slice(0, 10)}</td>
                <td style={s.td}>
                  <button style={s.smBtn('#58a6ff')} onClick={() => copyLink(f.id)}>{copied === f.id ? '✓ Copied' : 'Copy Link'}</button>
                  <button style={s.smBtn(f.active ? '#d29922' : '#3fb950')} onClick={() => toggle(f.id)}>{f.active ? 'Disable' : 'Enable'}</button>
                  <button style={s.dangerBtn} onClick={() => del(f.id, f.original_name)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && !uploading && setModal(false)}>
          <div style={s.modal}>
            <div style={s.modalTitle}>Upload Download File</div>
            <form onSubmit={submit}>
              {/* Drop zone */}
              <div
                style={s.dropZone(drag)}
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" style={{ display: 'none' }} accept=".exe,.msi,.zip,.tar,.gz,.dmg,.pkg,.deb,.rpm,.appimage" onChange={e => setFile(e.target.files[0])} />
                {file
                  ? <div><div style={{ color: '#3fb950', fontWeight: 600, fontSize: 14 }}>✓ {file.name}</div><div style={{ color: '#8b949e', fontSize: 12, marginTop: 4 }}>{fmt(file.size)}</div></div>
                  : <div><div style={{ color: '#8b949e', fontSize: 14 }}>Drag & drop or click to select</div><div style={{ color: '#8b949e', fontSize: 12, marginTop: 4 }}>.exe .msi .zip .dmg .pkg .deb .rpm — max 500 MB</div></div>
                }
              </div>

              <label style={s.label}>Product *</label>
              <input style={s.mInput} value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} required />

              <label style={s.label}>Version *</label>
              <input style={s.mInput} placeholder="e.g. 1.2.0" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} required />

              <label style={s.label}>Platform</label>
              <select style={s.mInput} value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                <option value="Windows">Windows</option>
                <option value="macOS">macOS</option>
                <option value="Linux">Linux</option>
                <option value="Android">Android</option>
                <option value="iOS">iOS</option>
              </select>

              <label style={s.label}>Description</label>
              <input style={s.mInput} placeholder="Optional release notes..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

              {uploading && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b949e', marginBottom: 4 }}>
                    <span>Uploading...</span><span>{progress}%</span>
                  </div>
                  <div style={{ background: '#21262d', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, background: '#00d4ff', height: '100%', borderRadius: 4, transition: 'width 0.2s' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" style={s.cancelBtn} onClick={() => setModal(false)} disabled={uploading}>Cancel</button>
                <button type="submit" style={s.btn} disabled={!file || uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stats Tab ────────────────────────────────────────────────────────────────
function StatsTab({ stats }) {
  if (!stats) return <div style={{ color: '#8b949e', fontSize: 13 }}>Loading...</div>;
  const maxCountry = stats.byCountry?.[0]?.count || 1;
  const maxPlatform = stats.byPlatform?.[0]?.count || 1;
  const maxDay = Math.max(...(stats.byDay?.map(d => d.count) || [1]));

  return (
    <>
      <div style={s.panel}>
        <div style={s.panelTitle}>📈 Downloads — Last 30 Days</div>
        {!stats.byDay?.length
          ? <div style={{ color: '#8b949e', fontSize: 13 }}>No data yet</div>
          : <div style={s.dayBar}>
              {stats.byDay.map(d => (
                <div key={d.day} style={s.dayCol} title={`${d.day}: ${d.count}`}>
                  <div style={{ width: '100%', background: '#00d4ff', borderRadius: '3px 3px 0 0', height: `${(d.count / maxDay) * 72}px`, minHeight: 2 }} />
                  <div style={s.dayLabel}>{d.day?.slice(5)}</div>
                </div>
              ))}
            </div>
        }
      </div>
      <div style={{ ...s.row2, marginTop: 16 }}>
        <div style={s.panel}>
          <div style={s.panelTitle}>🌍 By Country</div>
          {!stats.byCountry?.length
            ? <div style={{ color: '#8b949e', fontSize: 13 }}>No data yet</div>
            : stats.byCountry.slice(0, 10).map(c => (
              <div key={c.country} style={s.barRow}>
                <div style={s.barLabel}><span style={s.flag}>{countryFlag(c.country_code)}</span>{c.country || 'Unknown'}</div>
                <div style={s.barTrack}><div style={{ width: `${(c.count / maxCountry) * 100}%`, background: '#00d4ff', height: '100%', borderRadius: 4 }} /></div>
                <div style={s.barCount}>{c.count}</div>
              </div>
            ))
          }
        </div>
        <div style={s.panel}>
          <div style={s.panelTitle}>💻 By Platform</div>
          {!stats.byPlatform?.length
            ? <div style={{ color: '#8b949e', fontSize: 13 }}>No data yet</div>
            : stats.byPlatform.map(p => (
              <div key={p.platform} style={s.barRow}>
                <div style={s.barLabel}>{p.platform || 'Unknown'}</div>
                <div style={s.barTrack}><div style={{ width: `${(p.count / maxPlatform) * 100}%`, background: '#bc8cff', height: '100%', borderRadius: 4 }} /></div>
                <div style={s.barCount}>{p.count}</div>
              </div>
            ))
          }
        </div>
      </div>
    </>
  );
}

// ─── Logs Tab ─────────────────────────────────────────────────────────────────
function LogsTab() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [country, setCountry] = useState('');
  const limit = 30;

  const load = useCallback(() => {
    api.get('/downloads', { params: { page, limit, country: country || undefined } })
      .then(r => { setRows(r.data.data); setTotal(r.data.total); });
  }, [page, country]);

  useEffect(() => { load(); }, [load]);
  const pages = Math.ceil(total / limit);

  return (
    <>
      <div style={s.filters}>
        <input style={s.input} placeholder="Filter by country..." value={country} onChange={e => { setCountry(e.target.value); setPage(1); }} />
      </div>
      <div style={{ overflowX: 'auto', background: '#161b22', borderRadius: 10, border: '1px solid #30363d' }}>
        <table style={s.table}>
          <thead><tr>{['Time', 'Product', 'Version', 'Platform', 'Country', 'City', 'IP Address', 'ISP'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center', color: '#8b949e' }}>No downloads recorded yet</td></tr>}
            {rows.map(row => (
              <tr key={row.id}>
                <td style={s.td}>{row.downloaded_at?.slice(0, 16)}</td>
                <td style={s.td}>{row.product}</td>
                <td style={s.td}>{row.version || '—'}</td>
                <td style={s.td}>{row.platform || '—'}</td>
                <td style={s.td}>{row.country ? <><span style={s.flag}>{countryFlag(row.country_code)}</span>{row.country}</> : '—'}</td>
                <td style={s.td}>{row.city || '—'}</td>
                <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11 }}>{row.ip_address || '—'}</td>
                <td style={s.td}>{row.isp || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 16, justifyContent: 'center' }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ ...s.cancelBtn, ...(p === page ? { background: '#21262d', color: '#e2e8f0' } : {}) }}>{p}</button>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Downloads() {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('files');

  useEffect(() => {
    api.get('/downloads/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div style={s.page}>
      <div style={s.topRow}>
        <div style={s.title}>📥 Downloads</div>
      </div>

      <div style={s.statsGrid}>
        {[
          { label: 'Total Downloads', value: stats?.total ?? '—', color: '#00d4ff' },
          { label: 'Today', value: stats?.today ?? '—', color: '#3fb950' },
          { label: 'This Week', value: stats?.thisWeek ?? '—', color: '#d29922' },
          { label: 'This Month', value: stats?.thisMonth ?? '—', color: '#bc8cff' },
        ].map(c => (
          <div key={c.label} style={s.statCard}>
            <div style={{ ...s.statNum, color: c.color }}>{c.value}</div>
            <div style={s.statLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={s.tabs}>
        <button style={s.tab(tab === 'files')} onClick={() => setTab('files')}>📁 Files</button>
        <button style={s.tab(tab === 'stats')} onClick={() => setTab('stats')}>Analytics</button>
        <button style={s.tab(tab === 'logs')} onClick={() => setTab('logs')}>Raw Logs</button>
      </div>

      {tab === 'files' && <FilesTab />}
      {tab === 'stats' && <StatsTab stats={stats} />}
      {tab === 'logs' && <LogsTab />}
    </div>
  );
}
