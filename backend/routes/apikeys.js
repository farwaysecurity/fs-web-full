const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db');

router.get('/', (req, res) => {
  const rows = all('SELECT id, name, key, active, last_used, created_at FROM api_keys ORDER BY created_at DESC');
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const key = `AK-${uuidv4().replace(/-/g, '').toUpperCase()}`;
  const result = run('INSERT INTO api_keys (name, key) VALUES (?, ?)', [name, key]);
  res.status(201).json({ id: result.lastInsertRowid, name, key });
});

router.patch('/:id/toggle', (req, res) => {
  const current = get('SELECT active FROM api_keys WHERE id = ?', [req.params.id]);
  if (!current) return res.status(404).json({ error: 'Not found' });
  run('UPDATE api_keys SET active = ? WHERE id = ?', [current.active ? 0 : 1, req.params.id]);
  res.json({ success: true, active: !current.active });
});

router.delete('/:id', (req, res) => {
  run('DELETE FROM api_keys WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
