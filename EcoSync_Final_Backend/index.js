
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uid = req.body.uid;
        const dir = path.join(__dirname, 'uploads', uid);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const generateUID = () => Math.random().toString(36).substring(2, 10);
const generatePassword = () => Math.random().toString(36).substring(2, 10);

app.post('/register', (req, res) => {
    const { email } = req.body;
    const uid = generateUID();
    const password = generatePassword();

    const userData = { uid, password, email };
    const usersPath = path.join(__dirname, 'users.json');
    let users = [];

    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath));
    }

    users.push(userData);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ecosyncoficial@gmail.com',
            pass: 'ovfw pgsd cqgg dvhg'
        }
    });

    const mailOptions = {
        from: 'EcoSync <ecosyncoficial@gmail.com>',
        to: email,
        subject: 'Acesso exclusivo ao painel EcoSync',
        text: `Seu painel EcoSync está pronto!

Login: ${uid}
Senha: ${password}

Acesse: https://SEU-SITE.com`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return res.status(500).send('Erro ao enviar e-mail');
        res.send({ uid, password });
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    res.send('Arquivo recebido com sucesso!');
});

app.get('/', (req, res) => {
    res.send('EcoSync backend online');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
