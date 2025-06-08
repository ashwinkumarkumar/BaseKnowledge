
const express = require('express');
const router = express.Router();
const db = require('./db');
const axios = require('axios');
const metascraper = require('metascraper')([
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-description')()
]);

// Add a new topic
router.post('/topics', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Topic name is required' });
  }
  const sql = 'INSERT INTO topics (name) VALUES (?)';
  db.run(sql, [name], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
});

router.get('/topics', (req, res) => {
  const sql = 'SELECT * FROM topics ORDER BY created_at DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching topics:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get recent topics (limit 5)
router.get('/topics/recent', (req, res) => {
  const sql = 'SELECT * FROM topics ORDER BY created_at DESC LIMIT 5';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Update a topic by id
router.put('/topics/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Topic name is required' });
  }
  const sql = 'UPDATE topics SET name = ? WHERE id = ?';
  db.run(sql, [name, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    res.json({ updated: true });
  });
});

// Delete a topic by id
router.delete('/topics/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM topics WHERE id = ?';
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    res.json({ deleted: true });
  });
});

// Links routes

// Add a new link
router.post('/links', (req, res) => {
  const { topic_id, name, url } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' });
  }
  const sql = 'INSERT INTO links (topic_id, name, url) VALUES (?, ?, ?)';
  db.run(sql, [topic_id || null, name, url], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
});

// Get all links or links by topic_id
router.get('/links', (req, res) => {
  const { topic_id } = req.query;
  let sql = 'SELECT * FROM links';
  const params = [];
  if (topic_id) {
    sql += ' WHERE topic_id = ?';
    params.push(topic_id);
  }
  sql += ' ORDER BY created_at DESC';
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Search links by name
router.get('/links/search', (req, res) => {
  const { q, topic_id } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }
  let sql = `
    SELECT * FROM links
    WHERE name LIKE ?
  `;
  const params = ['%' + q + '%'];
  if (topic_id) {
    sql += ' AND topic_id = ?';
    params.push(topic_id);
  }
  sql += ' ORDER BY created_at DESC';
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Update a link by id
router.put('/links/:id', (req, res) => {
  const { id } = req.params;
  const { topic_id, name, url } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' });
  }
  const sql = `
    UPDATE links
    SET topic_id = ?, name = ?, url = ?
    WHERE id = ?
  `;
  db.run(sql, [topic_id || null, name, url, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }
    res.json({ updated: true });
  });
});

// Delete a link by id
router.delete('/links/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM links WHERE id = ?';
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }
    res.json({ deleted: true });
  });
});

const { URL } = require('url');

// New route to fetch URL metadata
router.get('/url-metadata', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  try {
    // Validate URL
    new URL(url);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      },
      timeout: 10000,
      responseType: 'text'
    });

    if (response.status !== 200) {
      return res.status(500).json({ error: 'Failed to fetch URL' });
    }
    const html = response.data;
    const metadata = await metascraper({ html, url });
    res.json(metadata);
  } catch (error) {
    console.error('Error in /url-metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
