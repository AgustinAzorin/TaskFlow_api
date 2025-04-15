// npm i express
// npm install pg
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Configurar conexión a PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Ruta de prueba: obtener datos de la tabla "Usuario"
app.get('/usuarios', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM "Usuario"'); // comillas si usaste mayúsculas
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en la consulta:', err);
    res.status(500).send('Error en la consulta');
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
