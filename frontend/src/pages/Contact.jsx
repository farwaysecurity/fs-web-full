import { useState } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import DownloadButton from '../components/DownloadButton';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await axios.post('/api/contact', form);
      if (res.data.success) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <main style={s.main}>
      <div style={s.container}>
        <p style={s.tag}>Contact Us</p>
        <h1 style={s.h1}>We're Here to Help</h1>
        <p style={s.sub}>Have a question, need support, or want to talk sales? Reach out — we respond within 24 hours.</p>

        <div style={s.layout}>
          <div style={s.info}>
            <div style={s.infoCard}><Mail size={20} color="#00d4ff" /><div><div style={s.infoLabel}>Email</div><a href="mailto:support@farwaysecurity.com" style={s.infoValue}>support@farwaysecurity.com</a></div></div>
            <div style={s.infoCard}><Phone size={20} color="#00d4ff" /><div><div style={s.infoLabel}>Phone</div><span style={s.infoValue}>+1 (800) 327-9291</span></div></div>
            <div style={s.infoCard}><MapPin size={20} color="#00d4ff" /><div><div style={s.infoLabel}>Office</div><span style={s.infoValue}>San Francisco, CA, USA</span></div></div>
            <div style={s.hours}><strong>Support Hours</strong><p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>24/7 for Total Security & Business Suite customers.<br />Mon–Fri 9am–6pm PST for all other plans.</p></div>
            <div style={s.trialCard}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>🎁 Try Before You Buy</div>
              <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>Full-featured 30-day trial. No credit card. No commitment.</p>
              <DownloadButton product="Farway AntiVirus" label="Download Free Trial" variant="primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '10px' }} />
            </div>
          </div>

          <form style={s.form} onSubmit={handleSubmit}>
            {status === 'success' ? (
              <div style={s.successBox}>
                <CheckCircle size={40} color="#10b981" />
                <h3 style={{ fontSize: 20, fontWeight: 600 }}>Message Sent</h3>
                <p style={{ color: '#94a3b8' }}>We'll get back to you within 24 hours.</p>
                <button type="button" style={s.resetBtn} onClick={() => setStatus(null)}>Send Another</button>
              </div>
            ) : (
              <>
                <div style={s.row}>
                  <div style={s.field}><label style={s.label}>Name *</label><input style={s.input} name="name" value={form.name} onChange={handleChange} placeholder="Your name" required /></div>
                  <div style={s.field}><label style={s.label}>Email *</label><input style={s.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required /></div>
                </div>
                <div style={s.field}><label style={s.label}>Subject</label><input style={s.input} name="subject" value={form.subject} onChange={handleChange} placeholder="How can we help?" /></div>
                <div style={s.field}><label style={s.label}>Message *</label><textarea style={{ ...s.input, ...s.textarea }} name="message" value={form.message} onChange={handleChange} placeholder="Tell us more..." required /></div>
                {status === 'error' && <p style={s.errorMsg}>{error}</p>}
                <button type="submit" style={s.submitBtn} disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending...' : <><Send size={16} /> Send Message</>}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}

const s = {
  main: { padding: '80px 0' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
  tag: { color: '#00d4ff', fontSize: 13, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 },
  h1: { fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, marginBottom: 16 },
  sub: { color: '#94a3b8', fontSize: 17, maxWidth: 520, marginBottom: 60 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 40 },
  info: { display: 'flex', flexDirection: 'column', gap: 20 },
  infoCard: { display: 'flex', gap: 16, alignItems: 'flex-start', background: '#111827', border: '1px solid #1e2d4a', borderRadius: 14, padding: '20px' },
  infoLabel: { color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 },
  infoValue: { color: '#f1f5f9', fontSize: 14 },
  hours: { background: '#111827', border: '1px solid #1e2d4a', borderRadius: 14, padding: '20px' },
  trialCard: { background: 'linear-gradient(135deg,rgba(0,212,255,0.06),rgba(124,58,237,0.06))', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: '20px' },
  form: { background: '#111827', border: '1px solid #1e2d4a', borderRadius: 20, padding: '40px', display: 'flex', flexDirection: 'column', gap: 20 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 500, color: '#94a3b8' },
  input: { background: '#0f1628', border: '1px solid #1e2d4a', borderRadius: 10, padding: '12px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  textarea: { minHeight: 140, resize: 'vertical' },
  errorMsg: { color: '#ef4444', fontSize: 14 },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', color: '#fff', fontWeight: 600, fontSize: 15 },
  successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '40px 0', textAlign: 'center' },
  resetBtn: { padding: '10px 24px', borderRadius: 8, border: '1px solid #1e2d4a', background: 'transparent', color: '#94a3b8', fontSize: 14 },
};
