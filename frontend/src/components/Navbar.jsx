import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import DownloadButton from './DownloadButton';

const links = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <Shield size={28} color="#00d4ff" />
          <span style={styles.logoText}>Farway<span style={{ color: '#00d4ff' }}>Security</span></span>
        </Link>

        <ul style={styles.links}>
          {links.map((l) => (
            <li key={l.to}>
              <Link to={l.to} style={{ ...styles.link, ...(pathname === l.to ? styles.active : {}) }}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <DownloadButton
          product="Farway AntiVirus"
          label="Free Trial"
          variant="outline"
          style={{ padding: '7px 16px', fontSize: 13, borderRadius: 8, whiteSpace: 'nowrap' }}
        />
        <Link to="/pricing" style={styles.cta}>Get Protected</Link>

        <button style={styles.burger} onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div style={styles.mobile}>
          {links.map((l) => (
            <Link key={l.to} to={l.to} style={styles.mobileLink} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link to="/pricing" style={styles.mobileCta} onClick={() => setOpen(false)}>Get Protected</Link>
          <DownloadButton
            product="Farway AntiVirus"
            label="Download Free Trial"
            variant="secondary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4, borderRadius: 8, padding: '12px', fontSize: 14, border: '1px solid #1e2d4a' }}
          />
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,14,26,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e2d4a' },
  inner: { maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', gap: 32 },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoText: { fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' },
  links: { display: 'flex', listStyle: 'none', gap: 8, marginLeft: 'auto' },
  link: { padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#94a3b8' },
  active: { color: '#f1f5f9', background: '#1e2d4a' },
  cta: { marginLeft: 8, padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', color: '#fff', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' },
  burger: { display: 'none', background: 'none', border: 'none', color: '#f1f5f9', marginLeft: 'auto' },
  mobile: { display: 'flex', flexDirection: 'column', padding: '12px 24px 20px', borderTop: '1px solid #1e2d4a', gap: 4 },
  mobileLink: { padding: '10px 0', fontSize: 15, color: '#94a3b8', borderBottom: '1px solid #1e2d4a11' },
  mobileCta: { marginTop: 12, padding: '12px', borderRadius: 8, textAlign: 'center', background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', color: '#fff', fontWeight: 600 },
};
