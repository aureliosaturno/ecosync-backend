const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const zipPhotos = require('../utils/zipPhotos');

module.exports = (db) => {
  router.get('/', (req, res) => {
    if (!req.session.device_id) return res.redirect('/login');
    res.redirect('/dashboard');
  });

  router.get('/dashboard', (req, res) => {
    const device_id = req.session.device_id;
    if (!device_id) return res.redirect('/login');

    const data = { photos: [], audios: [], locations: [], usagelogs: [] };
    const basePath = path.join(__dirname, '..', 'uploads', device_id);

    db.all("SELECT * FROM photos WHERE device_id = ?", [device_id], (err, photos) => {
      data.photos = photos;
      db.all("SELECT * FROM audios WHERE device_id = ?", [device_id], (err, audios) => {
        data.audios = audios;
        db.all("SELECT * FROM locations WHERE device_id = ?", [device_id], (err, locations) => {
          data.locations = locations;
          db.all("SELECT * FROM usagelogs WHERE device_id = ?", [device_id], (err, logs) => {
            data.usagelogs = logs;
            res.render('dashboard', { device_id, data });
          });
        });
      });
    });
  });

  router.get('/dashboard/download-zip', (req, res) => {
    if (!req.session.device_id) return res.redirect('/login');
    zipPhotos(req.session.device_id, res);
  });

  return router;
};
