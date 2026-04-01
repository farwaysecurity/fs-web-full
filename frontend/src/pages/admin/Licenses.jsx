import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api';

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page:      { padding: 28 },
  topRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 },
  title:     { fontSize: 20, fontWeight: 700, color: '#e2e8f0' },
  filters:   { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' },
  input:     { padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e2e8f0', fontSize: 13, outline: 'none' },
  select:    { padding: '8px 10px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e2e8f0', fontSize: 13, outline: 'none' },
  btn:       { padding: '8px 16px', background: '#238636', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600 },
  outBtn:    (c='#58a6ff') => ({ padding: '7px 13px', background: 'transparent', border: `1px solid ${c}`, borderRadius: 6, color: c, fontSize: 12, cursor: 'pointer' }),
  dangerBtn: { padding: '5px 10px', background: 'transparent', border: '1px solid #f85149', borderRadius: 5, color: '#f85149', fontSize: 12, cursor: 'pointer' },
  warnBtn:   { padding: '5px 10px', background: 'transparent', border: '1px solid #d29922', borderRadius: 5, color: '#d29922', fontSize: 12, cursor: 'pointer' },
  editBtn:   { padding: '5px 10px', background: 'transparent', border: '1px solid #58a6ff', borderRadius: 5, color: '#58a6ff', fontSize: 12, cursor: 'pointer' },
  greenBtn:  { padding: '5px 10px', background: 'transparent', border: '1px solid #3fb950', borderRadius: 5, color: '#3fb950', fontSize: 12, cursor: 'pointer' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:        { textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #30363d', color: '#8b949e', fontWeight: 600 },
  td:        { padding: '9px 12px', borderBottom: '1px solid #21262d', color: '#e2e8f0', verticalAlign: 'middle' },
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:     { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 28, width: 540, maxWidth: '95vw', maxHeight: '92vh', overflowY: 'auto' },
  modalTitle:{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#e2e8f0' },
  label:     { display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 5 },
  mInput:    { width: '100%', padding: '8px 10px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 5, color: '#e2e8f0', fontSize: 13, marginBottom: 12, outline: 'none', boxSizing: 'border-box' },
  mSelect:   { width: '100%', padding: '8px 10px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 5, color: '#e2e8f0', fontSize: 13, marginBottom: 12, outline: 'none' },
  row:       { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { padding: '8px 16px', background: 'transparent', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', fontSize: 13, cursor: 'pointer' },
  keyBox:    { background: '#0d1117', border: '1px solid #3fb950', borderRadius: 6, padding: 12, fontFamily: 'monospace', fontSize: 13, color: '#3fb950', wordBreak: 'break-all', marginBottom: 16 },
  statCard:  { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '14px 18px', textAlign: 'center' },
  statVal:   { fontSize: 24, fontWeight: 700, color: '#e2e8f0', lineHeight: 1 },
  statLabel: { fontSize: 11, color: '#8b949e', marginTop: 5 },
  badge:     (c='#8b949e') => ({ background: c+'22', color: c, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }),
  divider:   { borderTop: '1px solid #30363d', margin: '14px 0' },
  checkbox:  { width: 15, height: 15, cursor: 'pointer', accentColor: '#58a6ff' },
};

const statusColor  = { active: '#3fb950', expired: '#d29922', revoked: '#f85149' };
const planColor    = { basic: '#58a6ff', pro: '#d29922', enterprise: '#bc8cff', 'android-basic': '#10b981', 'android-pro': '#10b981', 'android-enterprise': '#10b981', 'ios-basic': '#a78bfa', 'ios-pro': '#a78bfa', 'ios-enterprise': '#a78bfa' };
const empty        = { owner_name: '', owner_email: '', plan: 'basic', status: 'active', expires_at: '', platform: 'desktop', device_limit: 1, mobile_features: '[]', notes: '' };

function copyText(t) { navigator.clipboard?.writeText(t).catch(() => {}); }
function exportCSV(rows) {
  const keys = ['key','owner_name','owner_email','plan','status','platform','device_limit','expires_at','created_at'];
  const csv  = [keys.join(','), ...rows.map(r => keys.map(k => `"${String(r[k]??'').replace(/"/g,'""')}"`).join(','))].join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download = 'licenses.csv'; a.click();
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar({ onFilterExpiring }) {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/licenses/stats').then(r => setStats(r.data)).catch(() => {}); }, []);
  if (!stats) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10, marginBottom: 18 }}>
      {[
        { label: 'Total',          val: stats.total,          color: '#e2e8f0' },
        { label: 'Active',         val: stats.active,         color: '#3fb950' },
        { label: 'Expired',        val: stats.expired,        color: '#d29922' },
        { label: 'Revoked',        val: stats.revoked,        color: '#f85149' },
        { label: 'Desktop',        val: stats.desktop,        color: '#58a6ff' },
        { label: 'Mobile',         val: stats.mobile,         color: '#10b981' },
        { label: 'Expiring ≤7d',   val: stats.expiring_soon,  color: '#f0883e', onClick: onFilterExpiring },
      ].map(c => (
        <div key={c.label} style={{ ...s.statCard, cursor: c.onClick ? 'pointer' : 'default', borderColor: c.onClick && stats.expiring_soon > 0 ? '#f0883e44' : '#30363d' }}
          onClick={c.onClick}>
          <div style={{ ...s.statVal, color: c.color }}>{c.val ?? 0}</div>
          <div style={s.statLabel}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Renew modal ──────────────────────────────────────────────────────────────
function RenewModal({ id, currentExpiry, onDone, onClose }) {
  const [days, setDays] = useState('365');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const submit = async () => {
    setLoading(true);
    const { data } = await api.patch(`/licenses/${id}/renew`, { days: Number(days) });
    setResult(data.expires_at);
    setLoading(false);
    onDone();
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...s.modal, width: 380 }}>
        <div style={s.modalTitle}>🔄 Renew License</div>
        {result ? (
          <>
            <div style={{ color: '#3fb950', fontSize: 13, marginBottom: 12 }}>Renewed — new expiry: <strong>{result}</strong></div>
            <div style={s.row}><button style={s.btn} onClick={onClose}>Done</button></div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 16 }}>
              Current expiry: <span style={{ color: '#e2e8f0' }}>{currentExpiry || 'None'}</span>
            </div>
            <label style={s.label}>Extend by</label>
            <select style={s.mSelect} value={days} onChange={e => setDays(e.target.value)}>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days (6 months)</option>
              <option value="365">1 year</option>
              <option value="730">2 years</option>
            </select>
            <div style={s.row}>
              <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
              <button style={s.btn} onClick={submit} disabled={loading}>{loading ? 'Renewing...' : 'Renew'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Clone modal ──────────────────────────────────────────────────────────────
function CloneModal({ src, onDone, onClose }) {
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [newKey, setNewKey] = useState('');

  const submit = async e => {
    e.preventDefault();
    const { data } = await api.post(`/licenses/${src.id}/clone`, { owner_name: name, owner_email: email });
    setNewKey(data.key);
    onDone();
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...s.modal, width: 420 }}>
        <div style={s.modalTitle}>📋 Clone License</div>
        {newKey ? (
          <>
            <div style={{ color: '#3fb950', fontSize: 13, marginBottom: 8 }}>Cloned successfully:</div>
            <div style={s.keyBox}>{newKey}</div>
            <div style={s.row}><button style={s.btn} onClick={onClose}>Done</button></div>
          </>
        ) : (
          <form onSubmit={submit}>
            <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 14 }}>
              Cloning <span style={{ color: '#58a6ff', fontFamily: 'monospace' }}>{src.plan}</span> license — same plan, platform & expiry.
            </div>
            <label style={s.label}>New Owner Name *</label>
            <input style={s.mInput} value={name} onChange={e => setName(e.target.value)} required placeholder={src.owner_name} />
            <label style={s.label}>New Owner Email *</label>
            <input style={s.mInput} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder={src.owner_email} />
            <div style={s.row}>
              <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
              <button type="submit" style={s.btn}>Clone</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Bulk action bar ──────────────────────────────────────────────────────────
function BulkBar({ selected, onAction, onClear }) {
  const [renewDays, setRenewDays] = useState('365');
  if (!selected.length) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#1c2128', border: '1px solid #58a6ff44', borderRadius: 8, marginBottom: 12, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, color: '#58a6ff', fontWeight: 600 }}>{selected.length} selected</span>
      <button style={s.greenBtn} onClick={() => onAction('reactivate')}>✅ Reactivate</button>
      <button style={s.warnBtn}  onClick={() => onAction('revoke')}>🚫 Revoke</button>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <select style={{ ...s.select, padding: '5px 8px', fontSize: 12 }} value={renewDays} onChange={e => setRenewDays(e.target.value)}>
          <option value="30">+30d</option><option value="90">+90d</option>
          <option value="180">+180d</option><option value="365">+1yr</option><option value="730">+2yr</option>
        </select>
        <button style={s.greenBtn} onClick={() => onAction('renew', renewDays)}>🔄 Renew</button>
      </div>
      <button style={s.dangerBtn} onClick={() => onAction('delete')}>🗑 Delete</button>
      <button style={{ ...s.cancelBtn, fontSize: 12, padding: '5px 10px', marginLeft: 'auto' }} onClick={onClear}>✕ Clear</button>
    </div>
  );
}

// ─── Generate / Edit modal ────────────────────────────────────────────────────
function LicenseModal({ editId, initialForm, mobilePlans, onSave, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [newKey, setNewKey] = useState('');
  const f = v => setForm(p => ({ ...p, ...v }));

  const save = async e => {
    e.preventDefault();
    if (editId) { await api.put(`/licenses/${editId}`, form); onSave(); onClose(); }
    else { const { data } = await api.post('/licenses', form); setNewKey(data.key); onSave(); }
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.modalTitle}>{editId ? '✏️ Edit License' : '🔑 Generate New License'}</div>

        {newKey ? (
          <>
            <div style={{ color: '#3fb950', fontSize: 13, marginBottom: 8 }}>License key generated:</div>
            <div style={s.keyBox}>{newKey}</div>
            <button style={{ ...s.outBtn('#3fb950'), marginBottom: 12, fontSize: 12 }} onClick={() => copyText(newKey)}>📋 Copy Key</button>
            <div style={s.row}><button style={s.btn} onClick={onClose}>Done</button></div>
          </>
        ) : (
          <form onSubmit={save}>
            {/* Owner */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={s.label}>Owner Name *</label>
                <input style={s.mInput} value={form.owner_name} onChange={e => f({ owner_name: e.target.value })} required />
              </div>
              <div>
                <label style={s.label}>Owner Email *</label>
                <input style={s.mInput} type="email" value={form.owner_email} onChange={e => f({ owner_email: e.target.value })} required />
              </div>
            </div>

            {/* Platform toggle */}
            <label style={s.label}>Platform *</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {['desktop','mobile'].map(p => (
                <button key={p} type="button"
                  onClick={() => f({ platform: p, plan: p === 'mobile' ? 'android-basic' : 'basic', device_limit: 1, mobile_features: '[]' })}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 600,
                    background: form.platform === p ? (p === 'mobile' ? '#10b98122' : '#58a6ff22') : '#0d1117',
                    border: `1px solid ${form.platform === p ? (p === 'mobile' ? '#10b981' : '#58a6ff') : '#30363d'}`,
                    color: form.platform === p ? (p === 'mobile' ? '#10b981' : '#58a6ff') : '#8b949e' }}>
                  {p === 'mobile' ? '📱 Mobile' : '🖥 Desktop'}
                </button>
              ))}
            </div>

            {/* Plan */}
            <label style={s.label}>Plan *</label>
            {form.platform === 'mobile' ? (
              <select style={s.mSelect} value={form.plan} onChange={e => {
                const info = mobilePlans[e.target.value];
                f({ plan: e.target.value, device_limit: info?.device_limit || 1, mobile_features: JSON.stringify(info?.features || []) });
              }}>
                <optgroup label="Android">
                  <option value="android-basic">Android Basic</option>
                  <option value="android-pro">Android Pro</option>
                  <option value="android-enterprise">Android Enterprise</option>
                </optgroup>
                <optgroup label="iOS">
                  <option value="ios-basic">iOS Basic</option>
                  <option value="ios-pro">iOS Pro</option>
                  <option value="ios-enterprise">iOS Enterprise</option>
                </optgroup>
              </select>
            ) : (
              <select style={s.mSelect} value={form.plan} onChange={e => f({ plan: e.target.value })}>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            )}

            {/* Mobile features preview */}
            {form.platform === 'mobile' && mobilePlans[form.plan] && (
              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '10px 12px', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 6 }}>Included features:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {mobilePlans[form.plan].features.map(ft => (
                    <span key={ft} style={s.badge('#10b981')}>{ft}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Device limit + Expiry */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={s.label}>Device Limit</label>
                <input style={s.mInput} type="number" min={1} max={1000} value={form.device_limit}
                  onChange={e => f({ device_limit: Number(e.target.value) })} />
              </div>
              <div>
                <label style={s.label}>Expiry Date</label>
                <input style={s.mInput} type="date" value={form.expires_at} onChange={e => f({ expires_at: e.target.value })} />
              </div>
            </div>

            {/* Status (edit only) */}
            {editId && (
              <>
                <label style={s.label}>Status</label>
                <select style={s.mSelect} value={form.status} onChange={e => f({ status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="revoked">Revoked</option>
                </select>
              </>
            )}

            {/* Notes */}
            <label style={s.label}>Notes (internal)</label>
            <textarea style={{ ...s.mInput, height: 64, resize: 'vertical', fontFamily: 'inherit' }}
              value={form.notes} onChange={e => f({ notes: e.target.value })}
              placeholder="Internal notes, order ID, etc." />

            <div style={s.row}>
              <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
              <button type="submit" style={s.btn}>{editId ? 'Save Changes' : 'Generate'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Licenses() {
  const [rows, setRows]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [plan, setPlan]         = useState('');
  const [platform, setPlatform] = useState('');
  const [expiring, setExpiring] = useState('');
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState([]);
  const [modal, setModal]       = useState(null); // null | 'add' | 'edit' | 'renew' | 'clone'
  const [activeRow, setActiveRow] = useState(null);
  const [mobilePlans, setMobilePlans] = useState({});
  const limit = 15;

  const load = useCallback(() => {
    api.get('/licenses', { params: { search, status, plan, platform, expiring_days: expiring || undefined, page, limit } })
      .then(r => { setRows(r.data.data); setTotal(r.data.total); setSelected([]); });
  }, [search, status, plan, platform, expiring, page]);

  useEffect(() => { load(); api.get('/licenses/plans/mobile').then(r => setMobilePlans(r.data)).catch(() => {}); }, [load]);

  const openAdd  = () => { setActiveRow(null); setModal('add'); };
  const openEdit = row => { setActiveRow(row); setModal('edit'); };
  const openRenew = row => { setActiveRow(row); setModal('renew'); };
  const openClone = row => { setActiveRow(row); setModal('clone'); };

  const revoke     = async id => { if (!confirm('Revoke this license?')) return; await api.patch(`/licenses/${id}/revoke`); load(); };
  const reactivate = async id => { await api.patch(`/licenses/${id}/reactivate`); load(); };
  const del        = async id => { if (!confirm('Delete this license?')) return; await api.delete(`/licenses/${id}`); load(); };

  const bulkAction = async (action, days) => {
    if (action === 'delete' && !confirm(`Delete ${selected.length} licenses?`)) return;
    await api.post('/licenses/bulk', { ids: selected, action, days });
    load();
  };

  const toggleSelect = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll    = () => setSelected(s => s.length === rows.length ? [] : rows.map(r => r.id));

  const pages = Math.ceil(total / limit);

  const editForm = activeRow ? {
    owner_name: activeRow.owner_name, owner_email: activeRow.owner_email,
    plan: activeRow.plan, status: activeRow.status,
    expires_at: activeRow.expires_at?.slice(0, 10) || '',
    platform: activeRow.platform || 'desktop',
    device_limit: activeRow.device_limit || 1,
    mobile_features: activeRow.mobile_features || '[]',
    notes: activeRow.notes || '',
  } : empty;

  const daysUntilExpiry = exp => {
    if (!exp) return null;
    const d = Math.ceil((new Date(exp) - new Date()) / 86400000);
    return d;
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.topRow}>
        <div style={s.title}>🔑 Licenses <span style={{ color: '#8b949e', fontSize: 14, fontWeight: 400 }}>({total})</span></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.outBtn('#3fb950')} onClick={() => exportCSV(rows)}>⬇ Export CSV</button>
          <button style={s.btn} onClick={openAdd}>+ Generate Key</button>
        </div>
      </div>

      {/* Stats */}
      <StatsBar onFilterExpiring={() => { setExpiring(expiring ? '' : '7'); setPage(1); }} />

      {/* Filters */}
      <div style={s.filters}>
        <input style={s.input} placeholder="Search name / email / key..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select style={s.select} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option><option value="expired">Expired</option><option value="revoked">Revoked</option>
        </select>
        <select style={s.select} value={platform} onChange={e => { setPlatform(e.target.value); setPage(1); }}>
          <option value="">All Platforms</option><option value="desktop">Desktop</option><option value="mobile">Mobile</option>
        </select>
        <select style={s.select} value={plan} onChange={e => { setPlan(e.target.value); setPage(1); }}>
          <option value="">All Plans</option>
          <option value="basic">Basic</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
          <option value="android-basic">Android Basic</option><option value="android-pro">Android Pro</option><option value="android-enterprise">Android Enterprise</option>
          <option value="ios-basic">iOS Basic</option><option value="ios-pro">iOS Pro</option><option value="ios-enterprise">iOS Enterprise</option>
        </select>
        <select style={s.select} value={expiring} onChange={e => { setExpiring(e.target.value); setPage(1); }}>
          <option value="">All Expiry</option>
          <option value="7">Expiring ≤7 days</option>
          <option value="30">Expiring ≤30 days</option>
          <option value="90">Expiring ≤90 days</option>
        </select>
        {(search || status || plan || platform || expiring) &&
          <button style={s.cancelBtn} onClick={() => { setSearch(''); setStatus(''); setPlan(''); setPlatform(''); setExpiring(''); setPage(1); }}>Reset</button>}
      </div>

      {/* Bulk bar */}
      <BulkBar selected={selected} onAction={bulkAction} onClear={() => setSelected([])} />

      {/* Table */}
      <div style={{ overflowX: 'auto', background: '#161b22', borderRadius: 10, border: '1px solid #30363d' }}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={{ ...s.th, width: 36 }}>
                <input type="checkbox" style={s.checkbox} checked={rows.length > 0 && selected.length === rows.length} onChange={toggleAll} />
              </th>
              {['License Key','Owner','Email','Plan','Platform','Devices','Status','Expires','Notes','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={11} style={{ ...s.td, textAlign: 'center', color: '#8b949e' }}>No licenses found</td></tr>}
            {rows.map(row => {
              const days = daysUntilExpiry(row.expires_at);
              const expiringSoon = days !== null && days >= 0 && days <= 7;
              return (
                <tr key={row.id} style={{ background: selected.includes(row.id) ? '#1c2128' : 'transparent' }}>
                  <td style={s.td}>
                    <input type="checkbox" style={s.checkbox} checked={selected.includes(row.id)} onChange={() => toggleSelect(row.id)} />
                  </td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11 }}>
                    <span title="Click to copy" style={{ cursor: 'pointer' }} onClick={() => copyText(row.key)}>{row.key}</span>
                  </td>
                  <td style={s.td}>{row.owner_name}</td>
                  <td style={{ ...s.td, fontSize: 12, color: '#8b949e' }}>{row.owner_email}</td>
                  <td style={s.td}><span style={s.badge(planColor[row.plan] || '#8b949e')}>{row.plan}</span></td>
                  <td style={s.td}>
                    <span style={s.badge(row.platform === 'mobile' ? '#10b981' : '#58a6ff')}>{row.platform || 'desktop'}</span>
                  </td>
                  <td style={{ ...s.td, textAlign: 'center' }}>{row.device_limit || 1}</td>
                  <td style={s.td}><span style={s.badge(statusColor[row.status] || '#8b949e')}>{row.status}</span></td>
                  <td style={s.td}>
                    {row.expires_at ? (
                      <span style={{ color: expiringSoon ? '#f0883e' : days < 0 ? '#f85149' : '#8b949e', fontSize: 12 }}>
                        {row.expires_at.slice(0, 10)}
                        {expiringSoon && <span style={{ marginLeft: 4, fontSize: 10 }}>⚠️ {days}d</span>}
                        {days < 0 && <span style={{ marginLeft: 4, fontSize: 10 }}>expired</span>}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ ...s.td, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: '#8b949e' }}
                    title={row.notes}>{row.notes || '—'}</td>
                  <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button style={s.editBtn}  onClick={() => openEdit(row)}>Edit</button>
                      <button style={s.greenBtn} onClick={() => openRenew(row)}>Renew</button>
                      <button style={s.editBtn}  onClick={() => openClone(row)}>Clone</button>
                      {row.status === 'active'  && <button style={s.warnBtn}   onClick={() => revoke(row.id)}>Revoke</button>}
                      {row.status !== 'active'  && <button style={s.greenBtn}  onClick={() => reactivate(row.id)}>Activate</button>}
                      <button style={s.dangerBtn} onClick={() => del(row.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {Array.from({ length: Math.min(pages, 20) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ ...s.cancelBtn, ...(p === page ? { background: '#21262d', color: '#e2e8f0' } : {}) }}>{p}</button>
          ))}
        </div>
      )}

      {/* Modals */}
      {(modal === 'add' || modal === 'edit') && (
        <LicenseModal
          editId={modal === 'edit' ? activeRow?.id : null}
          initialForm={modal === 'edit' ? editForm : empty}
          mobilePlans={mobilePlans}
          onSave={load}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'renew' && activeRow && (
        <RenewModal id={activeRow.id} currentExpiry={activeRow.expires_at?.slice(0,10)} onDone={load} onClose={() => setModal(null)} />
      )}
      {modal === 'clone' && activeRow && (
        <CloneModal src={activeRow} onDone={load} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
