const express = require('express');
const router = express.Router();
const { get, all } = require('../db');

// GET /api/usage — raw logs with filters
router.get('/', (req, res) => {
  const { license_key, result, platform, country, date_from, date_to, page = 1, limit = 30 } = req.query;
  let where = 'WHERE 1=1';
  const params = [];

  if (license_key) { where += ' AND license_key LIKE ?';  params.push(`%${license_key}%`); }
  if (result)      { where += ' AND result = ?';           params.push(result); }
  if (platform)    { where += ' AND platform = ?';         params.push(platform); }
  if (country)     { where += ' AND country LIKE ?';       params.push(`%${country}%`); }
  if (date_from)   { where += ' AND date(checked_at) >= ?'; params.push(date_from); }
  if (date_to)     { where += ' AND date(checked_at) <= ?'; params.push(date_to); }

  const total  = get(`SELECT COUNT(*) as count FROM license_usage ${where}`, params).count;
  const offset = (Number(page) - 1) * Number(limit);
  const rows   = all(
    `SELECT id, license_key, ip_address, machine_id, software_version, platform, result,
            country, country_code, city, region, isp, checked_at
     FROM license_usage ${where} ORDER BY checked_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );
  res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
});

// GET /api/usage/summary — per-license aggregation
router.get('/summary', (req, res) => {
  const rows = all(`
    SELECT
      lu.license_key,
      l.owner_name  AS holder_name,
      l.plan,
      l.status,
      COUNT(*)                                                    AS total_checks,
      SUM(CASE WHEN lu.result = 'valid'   THEN 1 ELSE 0 END)     AS valid_checks,
      SUM(CASE WHEN lu.result != 'valid'  THEN 1 ELSE 0 END)     AS failed_checks,
      MAX(lu.checked_at)                                          AS last_seen,
      COUNT(DISTINCT lu.machine_id)                               AS unique_machines,
      COUNT(DISTINCT lu.ip_address)                               AS unique_ips,
      COUNT(DISTINCT lu.country)                                  AS unique_countries,
      COUNT(DISTINCT lu.platform)                                 AS unique_platforms
    FROM license_usage lu
    LEFT JOIN licenses l ON l.key = lu.license_key
    GROUP BY lu.license_key
    ORDER BY last_seen DESC
  `);
  res.json(rows);
});

// GET /api/usage/analytics — time-series + breakdowns
router.get('/analytics', (req, res) => {
  const { days = 30 } = req.query;

  // Daily checks for the last N days
  const daily = all(`
    SELECT date(checked_at) AS day,
           COUNT(*) AS total,
           SUM(CASE WHEN result = 'valid'   THEN 1 ELSE 0 END) AS valid,
           SUM(CASE WHEN result = 'expired' THEN 1 ELSE 0 END) AS expired,
           SUM(CASE WHEN result = 'revoked' THEN 1 ELSE 0 END) AS revoked,
           SUM(CASE WHEN result = 'not_found' THEN 1 ELSE 0 END) AS not_found
    FROM license_usage
    WHERE checked_at >= date('now', ?)
    GROUP BY day ORDER BY day ASC
  `, [`-${days} days`]);

  // Result breakdown (all time)
  const byResult = all(`
    SELECT result, COUNT(*) AS count
    FROM license_usage GROUP BY result ORDER BY count DESC
  `);

  // Platform breakdown
  const byPlatform = all(`
    SELECT COALESCE(platform, 'unknown') AS platform, COUNT(*) AS count
    FROM license_usage GROUP BY platform ORDER BY count DESC
  `);

  // Version breakdown
  const byVersion = all(`
    SELECT COALESCE(software_version, 'unknown') AS version, COUNT(*) AS count
    FROM license_usage GROUP BY version ORDER BY count DESC LIMIT 10
  `);

  // Hourly distribution (0-23)
  const byHour = all(`
    SELECT CAST(strftime('%H', checked_at) AS INTEGER) AS hour, COUNT(*) AS count
    FROM license_usage GROUP BY hour ORDER BY hour ASC
  `);

  // Top 10 most active licenses
  const topLicenses = all(`
    SELECT lu.license_key, l.owner_name, l.plan, COUNT(*) AS checks
    FROM license_usage lu
    LEFT JOIN licenses l ON l.key = lu.license_key
    GROUP BY lu.license_key ORDER BY checks DESC LIMIT 10
  `);

  // Overall totals
  const totals = get(`
    SELECT COUNT(*) AS total,
           COUNT(DISTINCT license_key) AS unique_keys,
           COUNT(DISTINCT ip_address)  AS unique_ips,
           COUNT(DISTINCT machine_id)  AS unique_machines,
           COUNT(DISTINCT country)     AS unique_countries
    FROM license_usage
  `);

  res.json({ daily, byResult, byPlatform, byVersion, byHour, topLicenses, totals });
});

// GET /api/usage/platforms — per-platform breakdown
router.get('/platforms', (req, res) => {
  const summary = all(`
    SELECT
      COALESCE(platform, 'unknown') AS platform,
      COUNT(*)                      AS total_checks,
      COUNT(DISTINCT license_key)   AS unique_licenses,
      COUNT(DISTINCT ip_address)    AS unique_ips,
      COUNT(DISTINCT machine_id)    AS unique_machines,
      SUM(CASE WHEN result = 'valid'   THEN 1 ELSE 0 END) AS valid,
      SUM(CASE WHEN result != 'valid'  THEN 1 ELSE 0 END) AS failed,
      MAX(checked_at)               AS last_seen
    FROM license_usage
    GROUP BY platform ORDER BY total_checks DESC
  `);

  // Daily trend per platform (last 14 days)
  const trend = all(`
    SELECT date(checked_at) AS day,
           COALESCE(platform, 'unknown') AS platform,
           COUNT(*) AS count
    FROM license_usage
    WHERE checked_at >= date('now', '-14 days')
    GROUP BY day, platform ORDER BY day ASC
  `);

  res.json({ summary, trend });
});

// GET /api/usage/:key — per-license detail logs
router.get('/:key', (req, res) => {
  const rows = all(
    `SELECT id, license_key, ip_address, machine_id, software_version, platform, result,
            country, country_code, city, region, isp, checked_at
     FROM license_usage WHERE license_key = ? ORDER BY checked_at DESC LIMIT 200`,
    [req.params.key]
  );
  res.json(rows);
});

module.exports = router;
