const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');
const { geoLookup } = require('../geo');

// Public: track a download (called by website "Download" button)
// POST /api/downloads/track
router.post('/track', async (req, res) => {
  const { product = 'Farway AntiVirus', version, platform } = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || null;

  const geo = await geoLookup(ip);

  run(
    `INSERT INTO downloads (product, version, ip_address, country, country_code, city, region, platform, user_agent)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [product, version || null, ip, geo.country, geo.country_code, geo.city, geo.region, platform || null, userAgent]
  );

  res.json({ success: true });
});

// Admin: get download stats summary
// GET /api/downloads/stats
router.get('/stats', (req, res) => {
  const total = get('SELECT COUNT(*) as count FROM downloads').count;
  const today = get("SELECT COUNT(*) as count FROM downloads WHERE date(downloaded_at) = date('now')").count;
  const thisWeek = get("SELECT COUNT(*) as count FROM downloads WHERE downloaded_at >= datetime('now', '-7 days')").count;
  const thisMonth = get("SELECT COUNT(*) as count FROM downloads WHERE downloaded_at >= datetime('now', '-30 days')").count;

  const byProduct = all(`
    SELECT product, COUNT(*) as count
    FROM downloads GROUP BY product ORDER BY count DESC
  `);

  const byCountry = all(`
    SELECT country, country_code, COUNT(*) as count
    FROM downloads WHERE country IS NOT NULL
    GROUP BY country ORDER BY count DESC LIMIT 20
  `);

  const byDay = all(`
    SELECT date(downloaded_at) as day, COUNT(*) as count
    FROM downloads
    WHERE downloaded_at >= datetime('now', '-30 days')
    GROUP BY day ORDER BY day ASC
  `);

  const byPlatform = all(`
    SELECT platform, COUNT(*) as count
    FROM downloads WHERE platform IS NOT NULL
    GROUP BY platform ORDER BY count DESC
  `);

  res.json({ total, today, thisWeek, thisMonth, byProduct, byCountry, byDay, byPlatform });
});

// Admin: raw download log
// GET /api/downloads
router.get('/', (req, res) => {
  const { page = 1, limit = 30, product, country } = req.query;
  let where = 'WHERE 1=1';
  const params = [];
  if (product) { where += ' AND product = ?'; params.push(product); }
  if (country) { where += ' AND country = ?'; params.push(country); }

  const total = get(`SELECT COUNT(*) as count FROM downloads ${where}`, params).count;
  const offset = (Number(page) - 1) * Number(limit);
  const rows = all(
    `SELECT * FROM downloads ${where} ORDER BY downloaded_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );
  res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
});

module.exports = router;
