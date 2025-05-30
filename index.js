// npm i express
// npm install pg

// importaciones //
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const usuarioRoutes = require('./app/routes/usuarioRoute');
const path = require('path');
const proyectoRoutes = require('./app/routes/proyectoRoute');
const { verificarToken, autorizacionPorRol } = require('./app/middlewares/auth');
const tareaRoutes = require('./app/routes/tareaRoute');
const actividadRoutes = require('./app/routes/actividadRoute');
// importaciones //

const app = express();
const port = process.env.PORT || 3000;

// CORS configurado
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://taskflow-api-a3ur.onrender.com',
    'https://taskflow-rnlr.onrender.com',
    'https://taskflow-rnlr.onrender.com/usuarios'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.static('public'));
// Rutas //
app.get('/', (req, res) => res.send('API de TaskFlow funcionando 🚀'));
app.use('/usuarios', usuarioRoutes);
app.use('/proyectos', proyectoRoutes);
app.use('/tareas', tareaRoutes);
app.use('/acciones', actividadRoutes);
// Rutas //

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port} o en producción`);
});