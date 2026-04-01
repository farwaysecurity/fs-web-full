import { Link } from 'react-router-dom';
import { Shield, Zap, Eye, RefreshCw, Award, Globe, ChevronRight } from 'lucide-react';
import DownloadButton from '../components/DownloadButton';

const stats = [
  { value: '10M+', label: 'Devices Protected' },
  { value: '99.9%', label: 'Threat Detection Rate' },
  { value: '150+', label: 'Countries Served' },
  { value: '24/7', label: 'Expert Support' },
];

const features = [
  { icon: Shield, title: 'Real-Time Protection', desc: 'Continuous monitoring blocks threats before they can cause damage.' },
  { icon: Zap, title: 'Lightning Fast Scans', desc: 'Multithreaded engine scans millions of files without slowing you down.' },
  { icon: Eye, title: 'Dark Web Monitor', desc: 'Get alerted if your personal data appears on the dark web.' },
  { icon: RefreshCw, title: 'Auto Updates', desc: 'Virus definitions update automatically to stay ahead of new threats.' },
  { icon: Globe, title: 'VPN & Privacy', desc: 'Browse anonymously with our built-in encrypted VPN.' },
  { icon: Award, title: 'Award-Winning', desc: 'Recognized by top security labs for outstanding threat detection.' },
];

const testimonials = [
  { name: 'Sarah M.', role: 'Small Business Owner', text: 'Farway Security caught a ransomware attack before it encrypted a single file. Absolutely worth every penny.' },
  { name: 'James K.', role: 'IT Administrator', text: 'The Business Suite gives us centralized control over 200+ endpoints. Setup was surprisingly easy.' },
  { name: 'Priya L.', role: 'Freelance Developer', text: 'I love that it runs silently in the background. No slowdowns, no popups — just protection.' },
];

export default function Home() {
  return (
    <main>
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroContent}>
          <span style={s.pill}>🛡️ Trusted by 10 Million+ Users Worldwide</span>
          <h1 style={s.h1}>Cybersecurity That<br /><span style={s.gradient}>Never Sleeps</span></h1>
          <p style={s.heroSub}>Farway Security delivers real-time antivirus, VPN, and threat intelligence to protect your digital life — on every device, everywhere.</p>
          <div style={s.heroBtns}>
            <DownloadButton product="Farway AntiVirus" label="Download Free Trial" variant="primary" />
            <Link to="/pricing" style={s.btnSecondary}>View Plans <ChevronRight size={16} /></Link>
            <Link to="/products" style={{ ...s.btnSecondary, borderColor: 'transparent', color: '#94a3b8', fontSize: 14 }}>View Products</Link>
          </div>
        </div>
        <div style={s.heroVisual}>
          <div style={s.shieldGlow}><Shield size={120} color="#00d4ff" strokeWidth={1.2} /></div>
        </div>
      </section>

      <section style={s.statsBar}>
        <div style={s.statsInner}>
          {stats.map((st) => (
            <div key={st.label} style={s.stat}>
              <span style={s.statVal}>{st.value}</span>
              <span style={s.statLabel}>{st.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={s.section}>
        <div style={s.container}>
          <p style={s.sectionTag}>Why Farway Security</p>
          <h2 style={s.h2}>Everything You Need to Stay Safe</h2>
          <div style={s.grid3}>
            {features.map((f) => (
              <div key={f.title} style={s.featureCard}>
                <div style={s.featureIcon}><f.icon size={22} color="#00d4ff" /></div>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={s.ctaBanner}>
        <div style={s.container}>
          <div style={s.ctaBox}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Start Your Free 30-Day Trial</h2>
              <p style={{ color: '#94a3b8' }}>No credit card required. Full protection from day one.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <DownloadButton product="Farway AntiVirus" label="Download Free Trial" variant="primary" />
              <Link to="/pricing" style={s.btnSecondary}>See Pricing <ChevronRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section style={s.section}>
        <div style={s.container}>
          <p style={s.sectionTag}>Customer Stories</p>
          <h2 style={s.h2}>Trusted by Millions</h2>
          <div style={s.grid3}>
            {testimonials.map((t) => (
              <div key={t.name} style={s.testimonialCard}>
                <p style={s.testimonialText}>"{t.text}"</p>
                <div style={s.testimonialAuthor}>
                  <div style={s.avatar}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: '#64748b', fontSize: 13 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 20 }}>Join millions of users who trust Farway Security every day.</p>
            <div style={{ display: 'inline-flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              <DownloadButton product="Farway AntiVirus" label="Download Free Trial" variant="primary" />
              <Link to="/pricing" style={s.btnSecondary}>See All Plans <ChevronRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const s = {
  hero: { position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '80px 24px' },
  heroBg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(0,212,255,0.08) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 80% 80%, rgba(124,58,237,0.08) 0%, transparent 60%)', pointerEvents: 'none' },
  heroContent: { maxWidth: 1200, margin: '0 auto', flex: 1, zIndex: 1 },
  pill: { display: 'inline-block', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, marginBottom: 24 },
  h1: { fontSize: 'clamp(40px,6vw,72px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24 },
  gradient: { background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub: { color: '#94a3b8', fontSize: 18, maxWidth: 520, lineHeight: 1.7, marginBottom: 40 },
  heroBtns: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', color: '#fff', fontWeight: 600, fontSize: 15 },
  btnSecondary: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, border: '1px solid #1e2d4a', color: '#f1f5f9', fontWeight: 600, fontSize: 15 },
  heroVisual: { position: 'absolute', right: '8%', top: '50%', transform: 'translateY(-50%)', opacity: 0.15, pointerEvents: 'none' },
  shieldGlow: { filter: 'drop-shadow(0 0 60px #00d4ff)' },
  statsBar: { background: '#0f1628', borderTop: '1px solid #1e2d4a', borderBottom: '1px solid #1e2d4a' },
  statsInner: { maxWidth: 1200, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 },
  stat: { textAlign: 'center' },
  statVal: { display: 'block', fontSize: 36, fontWeight: 800, color: '#00d4ff' },
  statLabel: { color: '#64748b', fontSize: 14 },
  section: { padding: '80px 0' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
  sectionTag: { color: '#00d4ff', fontSize: 13, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 },
  h2: { fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, marginBottom: 48 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 },
  featureCard: { background: '#111827', border: '1px solid #1e2d4a', borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 12 },
  featureIcon: { width: 48, height: 48, borderRadius: 12, background: 'rgba(0,212,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 17, fontWeight: 600 },
  featureDesc: { color: '#64748b', fontSize: 14, lineHeight: 1.6 },
  ctaBanner: { padding: '0 0 80px' },
  ctaBox: { background: 'linear-gradient(135deg,rgba(0,212,255,0.1),rgba(124,58,237,0.1))', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: '48px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 },
  testimonialCard: { background: '#111827', border: '1px solid #1e2d4a', borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 },
  testimonialText: { color: '#cbd5e1', fontSize: 15, lineHeight: 1.7, fontStyle: 'italic' },
  testimonialAuthor: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 },
};
