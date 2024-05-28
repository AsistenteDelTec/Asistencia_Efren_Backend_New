const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');

dotenv.config();
const app = express();

const port = process.env.PORT || 3000;

const routerApi = require('./routes');

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Añade cualquier otro origen que uses
    credentials: true
  }));
app.use(express.json());

// Configurar sesión para Passport usando AUTH_SECRET del .env
app.use(session({
  secret: process.env.AUTH_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('backend is on');
});

routerApi(app);

app.listen(port, () => {
  console.log("Port ==> ", port);
});
