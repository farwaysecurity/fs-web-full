const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { run, get, all } = require('../db');
const { geoLookup } = require('../geo');

const JWT_SECRET = process.env.JWT_SECRET || 'farway-secret-key-change-in-prod';

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.exe', '.msi', '.zip', '.tar', '.gz', '.dmg', '.pkg', '.deb', '.rpm', '.appimage'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`File type ${ext} not allowed`));
  },
});

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ─── PUBLIC: list active files (website download buttons) ────────────────────
router.get('/public', (req, res) => {
  const rows = all(`
    SELECT id, product, version, description, platform, original_name, size, download_count
    FROM download_files WHERE active = 1 ORDER BY uploaded_at DESC
  `);
  res.json(rows);
});

// ─── PUBLIC: serve + track a file download ────────────────────────────────────
router.get('/:id/download', async (req, res) => {
  const row = get('SELECT * FROM download_files WHERE id = ? AND active = 1', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'File not found or inactive' });

  const filePath = path.join(UPLOADS_DIR, row.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing on server' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || null;
  const geo = await geoLookup(ip);

  run(
    `INSERT INTO downloads (product, version, ip_address, country, country_code, city, region, platform, user_agent)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [row.product, row.version, ip, geo.country, geo.country_code, geo.city, geo.region, row.platform, userAgent]
  );
  run('UPDATE download_files SET download_count = download_count + 1 WHERE id = ?', [row.id]);

  res.setHeader('Content-Disposition', `attachment; filename="${row.original_name}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', row.size);
  fs.createReadStream(filePath).pipe(res);
});

// ─── ADMIN routes below — all require JWT ────────────────────────────────────

router.get('/', auth, (req, res) => {
  const rows = all('SELECT * FROM download_files ORDER BY uploaded_at DESC');
  res.json(rows);
});

router.post('/', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { product, version, description, platform } = req.body;
  if (!product || !version) return res.status(400).json({ error: 'product and version are required' });

  const result = run(
    `INSERT INTO download_files (product, version, description, filename, original_name, size, platform)
     VALUES (?,?,?,?,?,?,?)`,
    [product, version, description || null, req.file.filename, req.file.originalname, req.file.size, platform || null]
  );
  res.status(201).json({ id: result.lastInsertRowid, filename: req.file.filename });
});

router.patch('/:id/toggle', auth, (req, res) => {
  const row = get('SELECT active FROM download_files WHERE id = ?', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  run('UPDATE download_files SET active = ? WHERE id = ?', [row.active ? 0 : 1, req.params.id]);
  res.json({ success: true, active: !row.active });
});

router.delete('/:id', auth, (req, res) => {
  const row = get('SELECT filename FROM download_files WHERE id = ?', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  const filePath = path.join(UPLOADS_DIR, row.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  run('DELETE FROM download_files WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
