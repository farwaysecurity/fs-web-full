import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import DownloadButton from '../components/DownloadButton';
import { Loader } from 'lucide-react';

const categories = ['all', 'antivirus', 'internet-security', 'total-security', 'business'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get('/api/products').then((r) => setProducts(r.data)).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? products : products.filter((p) => p.category === filter);

  return (
    <main style={s.main}>
      <div style={s.container}>
        <p style={s.tag}>Our Products</p>
        <h1 style={s.h1}>Complete Cybersecurity Solutions</h1>
        <p style={s.sub}>From personal antivirus to enterprise-grade protection — we have you covered.</p>

        <div style={s.trialBar}>
          <span style={{ color: '#94a3b8', fontSize: 14 }}>🎁 Try Farway AntiVirus free for 30 days — no credit card needed.</span>
          <DownloadButton product="Farway AntiVirus" label="Download Free Trial" variant="outline" style={{ fontSize: 13, padding: '9px 20px' }} />
        </div>
        <div style={s.filters}>
          {categories.map((c) => (
            <button key={c} style={{ ...s.filter, ...(filter === c ? s.filterActive : {}) }} onClick={() => setFilter(c)}>
              {c === 'all' ? 'All Products' : c.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>
        {loading ? (
          <div style={s.loading}><Loader size={32} color="#00d4ff" /></div>
        ) : (
          <div style={s.grid}>{filtered.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </div>
    </main>
  );
}

const s = {
  main: { padding: '80px 0' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
  tag: { color: '#00d4ff', fontSize: 13, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 },
  h1: { fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, marginBottom: 16 },
  sub: { color: '#94a3b8', fontSize: 17, maxWidth: 520, marginBottom: 24 },
  trialBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: '#111827', border: '1px solid #1e2d4a', borderRadius: 12, padding: '14px 20px', marginBottom: 36 },
  filters: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 48 },
  filter: { padding: '8px 20px', borderRadius: 8, border: '1px solid #1e2d4a', background: 'transparent', color: '#94a3b8', fontSize: 14, fontWeight: 500 },
  filterActive: { background: 'rgba(0,212,255,0.1)', borderColor: '#00d4ff', color: '#00d4ff' },
  loading: { display: 'flex', justifyContent: 'center', padding: 80 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 28 },
};
