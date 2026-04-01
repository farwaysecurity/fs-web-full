import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import DownloadButton from '../components/DownloadButton';
import { Download } from 'lucide-react';

export default function Pricing() {
  const [products, setProducts] = useState([]);
  const [billing, setBilling] = useState('monthly');

  useEffect(() => {
    axios.get('/api/products').then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  return (
    <main style={s.main}>
      <div style={s.container}>
        <p style={s.tag}>Pricing</p>
        <h1 style={s.h1}>Simple, Transparent Pricing</h1>
        <p style={s.sub}>No hidden fees. Cancel anytime. 30-day money-back guarantee.</p>

        {/* Trial download banner */}
        <div style={s.trialBanner}>
          <div style={s.trialIcon}><Download size={22} color="#00d4ff" /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Try Before You Buy — Free 30-Day Trial</div>
            <div style={{ color: '#94a3b8', fontSize: 14 }}>Full-featured. No credit card. No commitment. Download and start protecting your device in minutes.</div>
          </div>
          <DownloadButton product="Farway AntiVirus" label="Download Free Trial" variant="primary" style={{ whiteSpace: 'nowrap' }} />
        </div>
        <div style={s.toggle}>
          <button style={{ ...s.toggleBtn, ...(billing === 'monthly' ? s.toggleActive : {}) }} onClick={() => setBilling('monthly')}>Monthly</button>
          <button style={{ ...s.toggleBtn, ...(billing === 'yearly' ? s.toggleActive : {}) }} onClick={() => setBilling('yearly')}>
            Yearly <span style={s.saveBadge}>Save up to 20%</span>
          </button>
        </div>
        <div style={s.grid}>
          {products.map((p) => <ProductCard key={p.id} product={p} billing={billing} />)}
        </div>
        <div style={s.guarantee}>
          <span style={s.guaranteeIcon}>🔒</span>
          <div>
            <strong>30-Day Money-Back Guarantee</strong>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Not satisfied? Get a full refund within 30 days — no questions asked.</p>
          </div>
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
  sub: { color: '#94a3b8', fontSize: 17, maxWidth: 520, marginBottom: 40 },
  trialBanner: {
    display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
    background: 'linear-gradient(135deg,rgba(0,212,255,0.07),rgba(124,58,237,0.07))',
    border: '1px solid rgba(0,212,255,0.2)', borderRadius: 16,
    padding: '24px 28px', marginBottom: 40,
  },
  trialIcon: { width: 48, height: 48, borderRadius: 12, background: 'rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  toggle: { display: 'inline-flex', background: '#111827', border: '1px solid #1e2d4a', borderRadius: 10, padding: 4, marginBottom: 48, gap: 4 },
  toggleBtn: { padding: '10px 24px', borderRadius: 8, border: 'none', background: 'transparent', color: '#94a3b8', fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 },
  toggleActive: { background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', color: '#fff' },
  saveBadge: { background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 28, marginBottom: 60 },
  guarantee: { display: 'flex', alignItems: 'flex-start', gap: 16, background: '#111827', border: '1px solid #1e2d4a', borderRadius: 16, padding: '28px 32px', maxWidth: 600 },
  guaranteeIcon: { fontSize: 32 },
};
