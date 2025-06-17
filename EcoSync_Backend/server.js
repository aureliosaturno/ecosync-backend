const express = require('express');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Banco de dados
const db = new sqlite3.Database('./database.db');

// Sessão
app.use(session({
  secret: 'ecosync_secret',
  resave: false,
  saveUninitialized: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Criação de tabelas
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    username TEXT,
    password TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT,
    filename TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS audios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT,
    filename TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT,
    latitude TEXT,
    longitude TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS usagelogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT,
    app_name TEXT,
    duration TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Rotas principais
const authRoutes = require('./routes/auth')(db);
const uploadRoutes = require('./routes/upload')(db);
const dashboardRoutes = require('./routes/dashboard')(db);

app.use('/', authRoutes);
app.use('/upload', uploadRoutes);
app.use('/dashboard', dashboardRoutes);

// Início
app.listen(port, () => {
  console.log(`EcoSync backend rodando em http://localhost:${port}`);
});
