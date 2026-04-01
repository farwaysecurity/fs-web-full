import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';

// Website
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import MalwareDB from './pages/admin/MalwareDB';
import Licenses from './pages/admin/Licenses';
import ApiKeys from './pages/admin/ApiKeys';
import Usage from './pages/admin/Usage';
import Downloads from './pages/admin/Downloads';

// ─── Admin sidebar layout ────────────────────────────────────────────────────
const s = {
  layout: { display: 'flex', minHeight: '100vh' },
  sidebar: { width: 220, background: '#161b22', borderRight: '1px solid #30363d', display: 'flex', flexDirection: 'column', padding: '24px 0' },
  logo: { padding: '0 20px 24px', fontSize: 16, fontWeight: 700, color: '#f85149', letterSpacing: 1 },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' },
  link: { padding: '10px 12px', borderRadius: 6, color: '#8b949e', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 },
  activeLink: { background: '#21262d', color: '#e2e8f0' },
  main: { flex: 1, overflow: 'auto' },
  topbar: { background: '#161b22', borderBottom: '1px solid #30363d', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoutBtn: { background: '#21262d', border: '1px solid #30363d', color: '#e2e8f0', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
};

function AdminLayout() {
  const navigate = useNavigate();
  const user = localStorage.getItem('username') || 'Admin';
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/admin/login');
  };
  const linkStyle = ({ isActive }) => ({ ...s.link, ...(isActive ? s.activeLink : {}) });

  return (
    <div style={s.layout}>
      <aside style={s.sidebar}>
        <div style={s.logo}>🛡 FarwayAdmin</div>
        <nav style={s.nav}>
          <NavLink to="/admin/dashboard" style={linkStyle}>📊 Dashboard</NavLink>
          <NavLink to="/admin/malware"   style={linkStyle}>🦠 Malware DB</NavLink>
          <NavLink to="/admin/licenses"  style={linkStyle}>🔑 Licenses</NavLink>
          <NavLink to="/admin/usage"     style={linkStyle}>📈 Usage</NavLink>
          <NavLink to="/admin/downloads" style={linkStyle}>📥 Downloads</NavLink>
          <NavLink to="/admin/apikeys"   style={linkStyle}>🔌 API Keys</NavLink>
        </nav>
        <div style={{ marginTop: 'auto', padding: '0 12px' }}>
          <NavLink to="/" style={{ ...s.link, borderTop: '1px solid #30363d', paddingTop: 16, marginTop: 8 }}>
            🌐 View Website
          </NavLink>
        </div>
      </aside>
      <div style={s.main}>
        <div style={s.topbar}>
          <span style={{ fontSize: 13, color: '#8b949e' }}>Logged in as <strong style={{ color: '#e2e8f0' }}>{user}</strong></span>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="malware"   element={<MalwareDB />} />
          <Route path="licenses"  element={<Licenses />} />
          <Route path="usage"     element={<Usage />} />
          <Route path="downloads" element={<Downloads />} />
          <Route path="apikeys"   element={<ApiKeys />} />
          <Route path="*"         element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/admin/login" />;
}

// ─── Website layout ──────────────────────────────────────────────────────────
function WebsiteLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/pricing"  element={<Pricing />} />
        <Route path="/about"    element={<About />} />
        <Route path="/contact"  element={<Contact />} />
      </Routes>
      <Footer />
    </>
  );
}

// ─── Root router ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/*" element={<PrivateRoute><AdminLayout /></PrivateRoute>} />
        <Route path="/*" element={<WebsiteLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
