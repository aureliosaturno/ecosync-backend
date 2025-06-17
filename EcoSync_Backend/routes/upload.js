const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

module.exports = (db) => {
  const makeFolder = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  };

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const { device_id } = req.body;
      const folder = path.join(__dirname, '..', 'uploads', device_id, file.fieldname);
      makeFolder(folder);
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage });

  router.post('/photo', upload.single('photo'), (req, res) => {
    const { device_id } = req.body;
    db.run("INSERT INTO photos (device_id, filename) VALUES (?, ?)", [device_id, req.file.filename]);
    res.sendStatus(200);
  });

  router.post('/audio', upload.single('audio'), (req, res) => {
    const { device_id } = req.body;
    db.run("INSERT INTO audios (device_id, filename) VALUES (?, ?)", [device_id, req.file.filename]);
    res.sendStatus(200);
  });

  router.post('/location', (req, res) => {
    const { device_id, latitude, longitude } = req.body;
    db.run("INSERT INTO locations (device_id, latitude, longitude) VALUES (?, ?, ?)", [device_id, latitude, longitude]);
    res.sendStatus(200);
  });

  router.post('/usagelog', (req, res) => {
    const { device_id, app_name, duration } = req.body;
    db.run("INSERT INTO usagelogs (device_id, app_name, duration) VALUES (?, ?, ?)", [device_id, app_name, duration]);
    res.sendStatus(200);
  });

  return router;
};
