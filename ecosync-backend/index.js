const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});
const upload = multer({ storage });

// Gerador simples de credenciais únicas
function generateCredentials() {
  const uid = Date.now().toString(36);
  const pass = Math.random().toString(36).slice(-8);
  return { uid, pass };
}

// Carrega banco JSON
function loadDB(file) {
  try {
    return JSON.parse(fs.readFileSync(`data/${file}.json`));
  } catch {
    return {};
  }
}
function saveDB(file, data) {
  fs.writeFileSync(`data/${file}.json`, JSON.stringify(data, null, 2));
}

// Transporter do Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ecosyncoficial@gmail.com",
    pass: "ovfw pgsd cqgg dvhg"
  }
});

// Cadastro de novo cliente
app.post("/register", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "E-mail obrigatório" });

  const db = loadDB("users");
  if (Object.values(db).some(user => user.email === email)) {
    return res.status(400).json({ error: "E-mail já utilizado" });
  }

  const { uid, pass } = generateCredentials();
  db[uid] = { email, password: pass };
  saveDB("users", db);

  const html = `<h2>Bem-vindo ao EcoSync</h2><p>Seu usuário: <b>${uid}</b><br>Senha: <b>${pass}</b></p>`;

  transporter.sendMail({
    from: "EcoSync <ecosyncoficial@gmail.com>",
    to: email,
    subject: "Seus dados de acesso - EcoSync",
    html
  }, (err) => {
    if (err) return res.status(500).json({ error: "Erro ao enviar e-mail" });
    res.json({ success: true, uid, pass });
  });
});

// Upload de arquivos (galeria, áudios, etc)
app.post("/upload/:uid", upload.single("file"), (req, res) => {
  const { uid } = req.params;
  const db = loadDB("users");
  if (!db[uid]) return res.status(401).json({ error: "Usuário inválido" });
  res.json({ file: `/uploads/${req.file.filename}` });
});

// Dados do usuário
app.get("/user/:uid", (req, res) => {
  const { uid } = req.params;
  const db = loadDB("users");
  if (!db[uid]) return res.status(404).json({ error: "Usuário não encontrado" });
  res.json({ email: db[uid].email });
});

app.listen(PORT, () => console.log("EcoSync backend rodando na porta", PORT));