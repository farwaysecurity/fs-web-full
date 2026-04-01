import { Shield, Target, Heart, Users } from 'lucide-react';
import DownloadButton from '../components/DownloadButton';
import { Link } from 'react-router-dom';

const team = [
  { name: 'Alex Carter', role: 'CEO & Co-Founder', initials: 'AC' },
  { name: 'Maya Patel', role: 'CTO', initials: 'MP' },
  { name: 'Jordan Lee', role: 'Head of Security Research', initials: 'JL' },
  { name: 'Sam Rivera', role: 'Lead Engineer', initials: 'SR' },
];

const values = [
  { icon: Shield, title: 'Security First', desc: 'Every decision we make starts with one question: does this make our users safer?' },
  { icon: Target, title: 'Precision', desc: 'We obsess over detection accuracy. False positives waste your time; missed threats cost you more.' },
  { icon: Heart, title: 'User Trust', desc: 'We never sell your data. Your privacy is not a product — it\'s a promise.' },
  { icon: Users, title: 'Community', desc: 'We share threat intelligence with the broader security community to make the internet safer for everyone.' },
];

export default function About() {
  return (
    <main style={s.main}>
      <div style={s.container}>
        <section style={s.hero}>
          <p style={s.tag}>About Farway Security</p>
          <h1 style={s.h1}>We Exist to Make Cybersecurity<br /><span style={s.gradient}>Accessible to Everyone</span></h1>
          <p style={s.sub}>Founded in 2024, Farway Security was built by a team of cybersecurity veterans who believed that world-class protection shouldn't be complicated or expensive. Today, we protect over 10 million devices across 150+ countries.</p>
        </section>

        <section style={s.section}>
          <h2 style={s.h2}>Our Values</h2>
          <div style={s.grid2}>
            {values.map((v) => (
              <div key={v.title} style={s.valueCard}>
                <div style={s.valueIcon}><v.icon size={22} color="#00d4ff" /></div>
                <div>
                  <h3 style={s.valueTitle}>{v.title}</h3>
                  <p style={s.valueDesc}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={s.section}>
          <h2 style={s.h2}>Meet the Team</h2>
          <div style={s.grid4}>
            {team.map((m) => (
              <div key={m.name} style={s.teamCard}>
                <div style={s.avatar}>{m.initials}</div>
                <div style={s.memberName}>{m.name}</div>
                <div style={s.memberRole}>{m.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={s.cta}>
          <div style={s.ctaBox}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Ready to Get Protected?</h2>
              <p style={{ color: '#94a3b8', fontSize: 15 }}>Try Farway AntiVirus free for 30 days. No credit card required.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <DownloadButton product="Farway AntiVirus" label="Download Free Trial" variant="primary" />
              <Link to="/pricing" style={s.btnSecondary}>View Pricing</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

const s = {
  main: { padding: '80px 0' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
  hero: { marginBottom: 80 },
  tag: { color: '#00d4ff', fontSize: 13, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 },
  h1: { fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800, lineHeight: 1.15, marginBottom: 24 },
  gradient: { background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  sub: { color: '#94a3b8', fontSize: 17, maxWidth: 620, lineHeight: 1.7 },
  section: { marginBottom: 80 },
  h2: { fontSize: 'clamp(24px,3vw,36px)', fontWeight: 700, marginBottom: 40 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 },
  valueCard: { display: 'flex', gap: 20, background: '#111827', border: '1px solid #1e2d4a', borderRadius: 16, padding: '28px 24px' },
  valueIcon: { width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: 'rgba(0,212,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  valueTitle: { fontSize: 17, fontWeight: 600, marginBottom: 8 },
  valueDesc: { color: '#64748b', fontSize: 14, lineHeight: 1.6 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24 },
  teamCard: { background: '#111827', border: '1px solid #1e2d4a', borderRadius: 16, padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  avatar: { width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 },
  memberName: { fontWeight: 600, fontSize: 16 },
  memberRole: { color: '#64748b', fontSize: 13 },
  cta: { marginBottom: 80 },
  ctaBox: { background: 'linear-gradient(135deg,rgba(0,212,255,0.08),rgba(124,58,237,0.08))', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: '40px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 },
  btnSecondary: { display: 'inline-flex', alignItems: 'center', padding: '13px 24px', borderRadius: 10, border: '1px solid #1e2d4a', color: '#f1f5f9', fontWeight: 600, fontSize: 15 },
};
