// npm i express
// npm install pg
const express = require("express"); // Importar express
require("dotenv").config();
const { Pool } = require("pg"); // Importar pg
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// Configurar conexión a PostgreSQL. npm install dotenv
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Ruta de prueba
app.get("/Usuario", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM Usuario");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error obteniendo usuarios");
    }
  });
  
// Iniciar servidor
app.listen(port, () => {
  console.log("El servidor está corriendo en el puerto:", port);
});
