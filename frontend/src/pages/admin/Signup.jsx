import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1117' },
  card: { background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 40, width: 360 },
  title: { fontSize: 22, fontWeight: 700, color: '#f85149', marginBottom: 8, textAlign: 'center' },
  sub: { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 28 },
  label: { display: 'block', fontSize: 13, color: '#8b949e', marginBottom: 6 },
  input: { width: '100%', padding: '10px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e2e8f0', fontSize: 14, marginBottom: 16, outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '11px', background: '#238636', border: 'none', borderRadius: 6, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { color: '#f85149', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  success: { color: '#3fb950', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  link: { display: 'block', textAlign: 'center', marginTop: 16, color: '#8b949e', fontSize: 13, textDecoration: 'none' },
};

export default function Signup() {
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/admins', { username: form.username, password: form.password });
      setSuccess(`Admin "${form.username}" created. Redirecting...`);
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.title}>🛡 FarwayAdmin</div>
        <div style={s.sub}>Create a new admin account</div>
        {error && <div style={s.err}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}
        <form onSubmit={submit}>
          <label style={s.label}>Username</label>
          <input style={s.input} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          <label style={s.label}>Confirm Password</label>
          <input style={s.input} type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
          <button style={s.btn} disabled={loading}>{loading ? 'Creating...' : 'Create Admin'}</button>
        </form>
        <Link to="/admin/login" style={s.link}>← Back to login</Link>
      </div>
    </div>
  );
}
