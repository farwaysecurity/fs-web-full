import { Link } from 'react-router-dom';
import { Shield, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import DownloadButton from './DownloadButton';

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        <div style={s.brand}>
          <div style={s.logo}>
            <Shield size={24} color="#00d4ff" />
            <span style={s.logoText}>Farway<span style={{ color: '#00d4ff' }}>Security</span></span>
          </div>
          <p style={s.tagline}>Protecting individuals and businesses from evolving cyber threats since 2024.</p>
          <DownloadButton
            product="Farway AntiVirus"
            label="Download Free Trial"
            variant="outline"
            style={{ fontSize: 13, padding: '9px 18px', borderRadius: 8, justifyContent: 'center' }}
          />
          <div style={s.socials}>
            <a href="#" aria-label="Twitter" style={s.icon}><Twitter size={18} /></a>
            <a href="#" aria-label="GitHub" style={s.icon}><Github size={18} /></a>
            <a href="#" aria-label="LinkedIn" style={s.icon}><Linkedin size={18} /></a>
            <a href="mailto:support@farwaysecurity.com" aria-label="Email" style={s.icon}><Mail size={18} /></a>
          </div>
        </div>
        <div style={s.col}>
          <h4 style={s.heading}>Products</h4>
          <Link to="/products" style={s.link}>Farway AntiVirus</Link>
          <Link to="/products" style={s.link}>Internet Security</Link>
          <Link to="/products" style={s.link}>Total Security</Link>
          <Link to="/products" style={s.link}>Business Suite</Link>
        </div>
        <div style={s.col}>
          <h4 style={s.heading}>Company</h4>
          <Link to="/about" style={s.link}>About Us</Link>
          <Link to="/contact" style={s.link}>Contact</Link>
          <a href="#" style={s.link}>Blog</a>
          <a href="#" style={s.link}>Careers</a>
        </div>
        <div style={s.col}>
          <h4 style={s.heading}>Support</h4>
          <a href="#" style={s.link}>Help Center</a>
          <a href="#" style={s.link}>Downloads</a>
          <a href="#" style={s.link}>Privacy Policy</a>
          <a href="#" style={s.link}>Terms of Service</a>
        </div>
      </div>
      <div style={s.bottom}>
        <span style={{ color: '#475569' }}>© {new Date().getFullYear()} Farway Security. All rights reserved.</span>
        <span style={{ color: '#475569' }}>Made with ❤️ for a safer internet</span>
      </div>
    </footer>
  );
}

const s = {
  footer: { background: '#0a0e1a', borderTop: '1px solid #1e2d4a', marginTop: 80 },
  inner: { maxWidth: 1200, margin: '0 auto', padding: '60px 24px 40px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40 },
  brand: { display: 'flex', flexDirection: 'column', gap: 16 },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoText: { fontSize: 18, fontWeight: 700 },
  tagline: { color: '#64748b', fontSize: 14, lineHeight: 1.7, maxWidth: 260 },
  socials: { display: 'flex', gap: 12 },
  icon: { color: '#64748b', display: 'flex' },
  col: { display: 'flex', flexDirection: 'column', gap: 12 },
  heading: { color: '#f1f5f9', fontWeight: 600, fontSize: 14, marginBottom: 4 },
  link: { color: '#64748b', fontSize: 14 },
  bottom: { maxWidth: 1200, margin: '0 auto', padding: '20px 24px', borderTop: '1px solid #1e2d4a', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 13 },
};
