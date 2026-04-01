import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api';

const s = {
  page: { padding: 28 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 20, fontWeight: 700, color: '#e2e8f0' },
  btn: { padding: '8px 16px', background: '#238636', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #30363d', color: '#8b949e', fontWeight: 600 },
  td: { padding: '10px 12px', borderBottom: '1px solid #21262d', color: '#e2e8f0', verticalAlign: 'middle' },
  dangerBtn: { padding: '5px 10px', background: 'transparent', border: '1px solid #f85149', borderRadius: 5, color: '#f85149', fontSize: 12, cursor: 'pointer' },
  toggleBtn: (active) => ({ padding: '5px 10px', background: 'transparent', border: `1px solid ${active ? '#d29922' : '#3fb950'}`, borderRadius: 5, color: active ? '#d29922' : '#3fb950', fontSize: 12, cursor: 'pointer', marginRight: 6 }),
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 28, width: 440, maxWidth: '95vw' },
  modalTitle: { fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#e2e8f0' },
  label: { display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 5 },
  mInput: { width: '100%', padding: '8px 10px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 5, color: '#e2e8f0', fontSize: 13, marginBottom: 12, outline: 'none' },
  row: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { padding: '8px 16px', background: 'transparent', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', fontSize: 13, cursor: 'pointer' },
  keyBox: { background: '#0d1117', border: '1px solid #3fb950', borderRadius: 6, padding: 12, fontFamily: 'monospace', fontSize: 13, color: '#3fb950', wordBreak: 'break-all', marginBottom: 16 },
  copyBtn: { padding: '4px 10px', background: 'transparent', border: '1px solid #58a6ff', borderRadius: 5, color: '#58a6ff', fontSize: 12, cursor: 'pointer', marginLeft: 8 },
  infoBox: { background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 16, marginBottom: 24, fontSize: 13, color: '#8b949e', lineHeight: 1.7 },
  code: { background: '#0d1117', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', color: '#58a6ff', fontSize: 12 },
};

export default function ApiKeys() {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [newKey, setNewKey] = useState('');
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => { api.get('/apikeys').then(r => setRows(r.data)); }, []);
  useEffect(() => { load(); }, [load]);

  const create = async e => {
    e.preventDefault();
    const { data } = await api.post('/apikeys', { name });
    setNewKey(data.key); setName(''); load();
  };

  const toggle = async (id) => { await api.patch(`/apikeys/${id}/toggle`); load(); };
  const del = async (id) => { if (!confirm('Delete this API key?')) return; await api.delete(`/apikeys/${id}`); load(); };
  const copy = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={s.page}>
      <div style={s.topRow}>
        <div style={s.title}>🔌 API Keys <span style={{ color: '#8b949e', fontSize: 14, fontWeight: 400 }}>({rows.length} keys)</span></div>
        <button style={s.btn} onClick={() => { setNewKey(''); setModal(true); }}>+ Create API Key</button>
      </div>

      <div style={s.infoBox}>
        Connect your software using these endpoints. Pass the API key in the header: <span style={s.code}>x-api-key: YOUR_KEY</span>
        <br /><br />
        <strong style={{ color: '#e2e8f0' }}>Available endpoints:</strong><br />
        <span style={s.code}>POST /api/v1/license/verify</span> — verify a license key<br />
        <span style={s.code}>POST /api/v1/malware/check</span> — check a single hash<br />
        <span style={s.code}>POST /api/v1/malware/check-bulk</span> — check up to 500 hashes<br />
        <span style={s.code}>GET  /api/v1/malware/list</span> — get malware list
      </div>

      <div style={{ overflowX: 'auto', background: '#161b22', borderRadius: 10, border: '1px solid #30363d' }}>
        <table style={s.table}>
          <thead><tr>{['Name', 'API Key', 'Status', 'Last Used', 'Created', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#8b949e' }}>No API keys yet</td></tr>}
            {rows.map(row => (
              <tr key={row.id}>
                <td style={s.td}>{row.name}</td>
                <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11 }}>{row.key}<button style={s.copyBtn} onClick={() => copy(row.key)}>Copy</button></td>
                <td style={s.td}><span style={{ background: row.active ? '#3fb95022' : '#f8514922', color: row.active ? '#3fb950' : '#f85149', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{row.active ? 'Active' : 'Inactive'}</span></td>
                <td style={s.td}>{row.last_used ? row.last_used.slice(0, 16) : '—'}</td>
                <td style={s.td}>{row.created_at?.slice(0, 10)}</td>
                <td style={s.td}>
                  <button style={s.toggleBtn(row.active)} onClick={() => toggle(row.id)}>{row.active ? 'Disable' : 'Enable'}</button>
                  <button style={s.dangerBtn} onClick={() => del(row.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={s.modal}>
            <div style={s.modalTitle}>Create API Key</div>
            {newKey ? (
              <>
                <div style={{ color: '#3fb950', fontSize: 13, marginBottom: 8 }}>API key created. Copy it now:</div>
                <div style={s.keyBox}>{newKey}<button style={s.copyBtn} onClick={() => copy(newKey)}>{copied ? 'Copied!' : 'Copy'}</button></div>
                <div style={s.row}><button style={s.btn} onClick={() => { setModal(false); setNewKey(''); }}>Done</button></div>
              </>
            ) : (
              <form onSubmit={create}>
                <label style={s.label}>Key Name</label>
                <input style={s.mInput} value={name} onChange={e => setName(e.target.value)} placeholder="My Software" required />
                <div style={s.row}>
                  <button type="button" style={s.cancelBtn} onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" style={s.btn}>Generate</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
