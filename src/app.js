const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socket = require('./config/socket'); // Importa el módulo de socket

dotenv.config();
const app = express();

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socket.init(server); // Inicializa socket.io

const routerApi = require('./routes');

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173/'],
  credentials: true
}));
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('backend is on');
});

routerApi(app);

server.listen(port, () => {
  console.log("Port ==> ", port);
});

module.exports = { app, server };
