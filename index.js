// npm i express
// npm install pg
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const usuariosRoutes = require('./app/routes/usuarios');

const app = express();
const port = process.env.PORT || 3000;

// CORS configurado
app.use(cors({
  origin: ['http://localhost:3000', 'https://taskflow-api-a3ur.onrender.com', 'https://taskflow-rnlr.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

// Rutas
app.get('/', (req, res) => res.send('API de TaskFlow funcionando 🚀'));
app.use('/usuarios', usuariosRoutes);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port} o en producción`);
});