const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDb, run, get, all } = require('./db');

const app = express();
const PORT = 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'farway-secret-key-change-in-prod';

app.use(cors());
app.use(express.json());

// ─── JWT Auth middleware (admin panel) ───────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── Admin signup (JWT protected — only existing admins can create new ones) ──
app.post('/api/admins', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  const exists = get('SELECT id FROM admins WHERE username = ?', [username]);
  if (exists) return res.status(409).json({ error: 'Username already taken' });
  const hashed = bcrypt.hashSync(password, 10);
  const result = run('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashed]);
  res.status(201).json({ id: result.lastInsertRowid, username });
});

// ─── Admin login ─────────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const admin = get('SELECT * FROM admins WHERE username = ?', [username]);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, username: admin.username });
});

// ─── Public download tracking (no auth) ──────────────────────────────────────
const downloadsRouter = require('./routes/downloads');
app.post('/api/downloads/track', downloadsRouter);

// ─── Files router handles its own auth internally ────────────────────────────
app.use('/api/files', require('./routes/files'));

// ─── Admin routes (JWT protected) ────────────────────────────────────────────
app.use('/api/malware',    auth, require('./routes/malware'));
app.use('/api/licenses',   auth, require('./routes/licenses'));
app.use('/api/apikeys',    auth, require('./routes/apikeys'));
app.use('/api/usage',      auth, require('./routes/usage'));
app.use('/api/downloads',  auth, downloadsRouter);
// files router already mounted above with internal auth
app.use('/api/sync',      auth, require('./routes/sync'));

app.get('/api/stats', auth, (req, res) => {
  const totalMalware    = get('SELECT COUNT(*) as count FROM malware').count;
  const criticalMalware = get("SELECT COUNT(*) as count FROM malware WHERE severity='critical'").count;
  const totalLicenses   = get('SELECT COUNT(*) as count FROM licenses').count;
  const activeLicenses  = get("SELECT COUNT(*) as count FROM licenses WHERE status='active'").count;
  const totalDownloads  = get('SELECT COUNT(*) as count FROM downloads').count;
  const todayDownloads  = get("SELECT COUNT(*) as count FROM downloads WHERE date(downloaded_at) = date('now')").count;
  const totalChecks     = get('SELECT COUNT(*) as count FROM license_usage').count;
  const uniqueUsers     = get('SELECT COUNT(DISTINCT ip_address) as count FROM license_usage').count;
  res.json({ totalMalware, criticalMalware, totalLicenses, activeLicenses, totalDownloads, todayDownloads, totalChecks, uniqueUsers });
});

// Geo breakdown for usage logs (admin)
app.get('/api/geo/usage', auth, (req, res) => {
  const byCountry = all(`
    SELECT country, country_code, COUNT(*) as count
    FROM license_usage WHERE country IS NOT NULL
    GROUP BY country ORDER BY count DESC LIMIT 30
  `);
  const byCity = all(`
    SELECT city, country, COUNT(*) as count
    FROM license_usage WHERE city IS NOT NULL
    GROUP BY city, country ORDER BY count DESC LIMIT 20
  `);
  const recentGeo = all(`
    SELECT DISTINCT ip_address, country, country_code, city, region, isp, latitude, longitude,
           MAX(checked_at) as last_seen
    FROM license_usage WHERE country IS NOT NULL
    GROUP BY ip_address ORDER BY last_seen DESC LIMIT 50
  `);
  res.json({ byCountry, byCity, recentGeo });
});

// ─── Public API (API key protected) ──────────────────────────────────────────
app.use('/api/v1', require('./routes/api'));

// ─── Website routes ───────────────────────────────────────────────────────────
app.use('/api/contact',  require('./routes/contact'));
app.use('/api/products', require('./routes/products'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ─── Init DB & start ──────────────────────────────────────────────────────────
initDb().then(() => {
  const adminExists = get('SELECT id FROM admins WHERE username = ?', ['admin']);
  if (!adminExists) {
    const hashed = bcrypt.hashSync('admin123', 10);
    run('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', hashed]);
    console.log('Default admin created: admin / admin123');
  }

  const avApiKey = 'AK-D3154D9410144BA9AD8A49821F0BEF09';
  const keyExists = get('SELECT id FROM api_keys WHERE key = ?', [avApiKey]);
  if (!keyExists) {
    run('INSERT INTO api_keys (name, key, active) VALUES (?, ?, 1)', ['Farway Antivirus Client', avApiKey]);
    console.log('Farway Antivirus API key seeded.');
  }

  app.listen(PORT, () => console.log(`Farway Security backend running on http://localhost:${PORT}`));
});
