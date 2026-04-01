const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'admin.db');

let db;

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS malware (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      hash_md5 TEXT UNIQUE,
      hash_sha256 TEXT,
      type TEXT,
      severity TEXT,
      description TEXT,
      source TEXT,
      heuristic_patterns TEXT DEFAULT '[]',
      detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      owner_name TEXT NOT NULL,
      owner_email TEXT NOT NULL,
      plan TEXT,
      status TEXT DEFAULT 'active',
      expires_at DATETIME,
      platform TEXT DEFAULT 'desktop',
      device_limit INTEGER DEFAULT 1,
      mobile_features TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      key TEXT UNIQUE NOT NULL,
      active INTEGER DEFAULT 1,
      last_used DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS license_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_key TEXT NOT NULL,
      ip_address TEXT,
      machine_id TEXT,
      software_version TEXT,
      platform TEXT,
      result TEXT,
      country TEXT,
      country_code TEXT,
      city TEXT,
      region TEXT,
      latitude REAL,
      longitude REAL,
      isp TEXT,
      checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS download_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product TEXT NOT NULL,
      version TEXT NOT NULL,
      description TEXT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      size INTEGER DEFAULT 0,
      platform TEXT,
      active INTEGER DEFAULT 1,
      download_count INTEGER DEFAULT 0,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product TEXT NOT NULL,
      version TEXT,
      ip_address TEXT,
      country TEXT,
      country_code TEXT,
      city TEXT,
      region TEXT,
      platform TEXT,
      user_agent TEXT,
      bytes_sent INTEGER DEFAULT 0,
      downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate: add geo + isp columns to license_usage if missing
  const luCols = db.exec("PRAGMA table_info(license_usage)");
  const luColNames = luCols[0]?.values.map(r => r[1]) || [];
  const luNew = { country: 'TEXT', country_code: 'TEXT', city: 'TEXT', region: 'TEXT', latitude: 'REAL', longitude: 'REAL', isp: 'TEXT' };
  for (const [col, type] of Object.entries(luNew)) {
    if (!luColNames.includes(col)) db.run(`ALTER TABLE license_usage ADD COLUMN ${col} ${type}`);
  }

  // Migrate: add heuristic_patterns to malware if missing
  const mCols = db.exec("PRAGMA table_info(malware)");
  const mColNames = mCols[0]?.values.map(r => r[1]) || [];
  if (!mColNames.includes('heuristic_patterns')) {
    db.run(`ALTER TABLE malware ADD COLUMN heuristic_patterns TEXT DEFAULT '[]'`);
  }

  // Migrate: add mobile license columns if missing
  const lCols = db.exec("PRAGMA table_info(licenses)");
  const lColNames = lCols[0]?.values.map(r => r[1]) || [];
  const lNew = { platform: 'TEXT DEFAULT \'desktop\'', device_limit: 'INTEGER DEFAULT 1', mobile_features: 'TEXT DEFAULT \'[]\'', notes: 'TEXT' };
  for (const [col, type] of Object.entries(lNew)) {
    if (!lColNames.includes(col)) db.run(`ALTER TABLE licenses ADD COLUMN ${col} ${type}`);
  }

  save();
  return db;
}

function save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function run(sql, params = []) {
  db.run(sql, params);
  save();
  const result = db.exec('SELECT last_insert_rowid() as id');
  return { lastInsertRowid: result[0]?.values[0][0] };
}

function get(sql, params = []) {
  const result = db.exec(sql, params);
  if (!result.length || !result[0].values.length) return undefined;
  const cols = result[0].columns;
  const vals = result[0].values[0];
  return Object.fromEntries(cols.map((c, i) => [c, vals[i]]));
}

function all(sql, params = []) {
  const result = db.exec(sql, params);
  if (!result.length) return [];
  const cols = result[0].columns;
  return result[0].values.map(vals => Object.fromEntries(cols.map((c, i) => [c, vals[i]])));
}

module.exports = { initDb, run, get, all, save };
