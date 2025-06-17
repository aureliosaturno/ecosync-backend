const express = require('express');
const router = express.Router();
const crypto = require('crypto');

module.exports = (db) => {
  function generateCredentials() {
    const user = 'user_' + crypto.randomBytes(3).toString('hex');
    const pass = crypto.randomBytes(4).toString('hex');
    return { user, pass };
  }

  router.get('/register', (req, res) => {
    const deviceId = req.query.device_id;
    if (!deviceId) return res.status(400).send('Device ID required');

    db.get("SELECT * FROM devices WHERE id = ?", [deviceId], (err, row) => {
      if (row) {
        return res.json({ username: row.username, password: row.password });
      } else {
        const { user, pass } = generateCredentials();
        db.run("INSERT INTO devices (id, username, password) VALUES (?, ?, ?)",
          [deviceId, user, pass], (err) => {
            return res.json({ username: user, password: pass });
        });
      }
    });
  });

  router.get('/login', (req, res) => {
    res.render('login');
  });

  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM devices WHERE username = ? AND password = ?", [username, password], (err, row) => {
      if (row) {
        req.session.device_id = row.id;
        res.redirect('/dashboard');
      } else {
        res.redirect('/login');
      }
    });
  });

  router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
  });

  return router;
};
