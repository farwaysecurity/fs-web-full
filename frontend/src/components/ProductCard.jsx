import { Shield, Globe, Lock, Building, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import DownloadButton from './DownloadButton';

const icons = { shield: Shield, globe: Globe, lock: Lock, building: Building };

export default function ProductCard({ product, billing = 'monthly' }) {
  const Icon = icons[product.icon] || Shield;
  const price = billing === 'yearly' ? product.yearlyPrice : product.price;

  return (
    <div style={s.card}>
      {product.badge && <span style={s.badge}>{product.badge}</span>}
      <div style={s.iconWrap}><Icon size={28} color="#00d4ff" /></div>
      <h3 style={s.name}>{product.name}</h3>
      <p style={s.desc}>{product.description}</p>
      <div style={s.price}>
        <span style={s.amount}>${price}</span>
        <span style={s.per}>/mo</span>
      </div>
      {billing === 'yearly' && (
        <p style={s.save}>Save ${((product.price - product.yearlyPrice) * 12).toFixed(0)}/yr</p>
      )}
      <ul style={s.features}>
        {product.features.map((f) => (
          <li key={f} style={s.feature}>
            <Check size={15} color="#10b981" style={{ flexShrink: 0 }} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <DownloadButton
        product={product.name}
        label="Free 30-Day Trial"
        variant="outline"
        style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 14 }}
      />
      <Link to="/contact" style={s.btn}>Buy Now</Link>
    </div>
  );
}

const s = {
  card: { position: 'relative', background: '#111827', border: '1px solid #1e2d4a', borderRadius: 16, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16 },
  badge: { position: 'absolute', top: -12, right: 20, background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.5px' },
  iconWrap: { width: 56, height: 56, borderRadius: 14, background: 'rgba(0,212,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: 700 },
  desc: { color: '#94a3b8', fontSize: 14, lineHeight: 1.6 },
  price: { display: 'flex', alignItems: 'baseline', gap: 4 },
  amount: { fontSize: 36, fontWeight: 800, color: '#00d4ff' },
  per: { color: '#64748b', fontSize: 14 },
  save: { color: '#10b981', fontSize: 13, fontWeight: 600, marginTop: -8 },
  features: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 },
  feature: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#cbd5e1' },
  btn: { marginTop: 'auto', padding: '12px', borderRadius: 10, textAlign: 'center', background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', color: '#fff', fontWeight: 600, fontSize: 15 },
};
