// npm i express
// npm install pg
require('dotenv').config(); // Se usa para sincronziar con el env
const express = require('express'); // Importa el paquete express
const { Pool } = require('pg'); // Importa el paquete postgresSQL
const cors = require('cors'); //Necesario para que el backend admita conexiones del frontend
const nodemailer = require('nodemailer'); // Importa el paquete paa enviar mails *fuegito*

// Configurá el transporte 
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Esto permite certificados autofirmados
  }
});


const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://taskflow-api-a3ur.onrender.com');
  next();
});

app.use(cors({
  origin: 'https://taskflow-api-a3ur.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.options('*', cors());

app.use(express.json()); // Necesario para leer los archivos JSON

console.log('Conectando a:', process.env.DATABASE_URL);
// Configurar conexión a PostgreSQL
const pool = new Pool({
   connectionString: process.env.DATABASE_URL,
   ssl: {
    rejectUnauthorized: false
  }
});

app.get('/', (req, res) => {
  res.send('API de TaskFlow funcionando 🚀');
});
// Ruta de prueba: obtener datos de la tabla "Usuario"
app.get('/usuarios', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM "Usuario"');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en la consulta:', err);
    res.status(500).send('Error en la consulta');
  }
});

//Crear un nuevo usuario
app.post('/usuarios', async (req, res) => {
  const { nombre, email, contrasena, rol, fecha } = req.body;
  console.log('Nuevo usuario recibido:', { nombre, email, contrasena, rol, fecha });


  try {
    const query = `
      INSERT INTO "Usuario" ("Usuario_Nombre", "Email", "Contraseña", "Rol", "Fecha_Creacion")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const valores = [nombre, email, contrasena, rol, fecha];

    const resultado = await pool.query(query, valores);

    // Enviar email de confirmación
    await transporter.sendMail({
      from: `"TaskFlow App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '¡Registro exitoso!',
      text: `Hola ${nombre}, te registraste correctamente como ${rol} en la app.`,
    });

    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('Error al insertar usuario:', err.message);
    res.status(500).send('Error al insertar usuario: ' + err.message);
  }
  
});




// Modificar un usuario
app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, contrasena, rol, fecha } = req.body;

  try {
    const query = `
      UPDATE "Usuario"
      SET "Usuario_Nombre" = $1,
          "Email" = $2,
          "Contraseña" = $3,
          "Rol" = $4,
          "Fecha_Creacion" = $5
      WHERE "Usuario_ID" = $6
      RETURNING *;
    `;
    const valores = [nombre, email, contrasena, rol, fecha, id];
    const resultado = await pool.query(query, valores);
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).send('Error al actualizar usuario');
  }
});

//Elimina un usuario
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Buscar al usuario antes de eliminarlo
    const result = await pool.query('SELECT "Email", "Usuario_Nombre", "Rol" FROM "Usuario" WHERE "Usuario_ID" = $1', [id]);
    const usuario = result.rows[0];


    if (!usuario) {
      return res.status(404).send('Usuario no encontrado');
    }

    const email = usuario.Email;
    const nombre = usuario.Usuario_Nombre;
    const rol = usuario.Rol;


    // 2. Eliminar el usuario
    await pool.query('DELETE FROM "Usuario" WHERE "Usuario_ID" = $1', [id]);

    // 3. Enviar correo de notificación
    await transporter.sendMail({
      from: `"TaskFlow App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Tu cuenta ha sido eliminada',
      text: `Hola ${nombre}, tu cuenta con rol ${rol} ha sido eliminada del sistema.`,
    });

    res.status(204).send(); // No Content
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).send('Error al eliminar usuario');
  }
});



// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port} o en producción`);
});
