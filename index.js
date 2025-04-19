// npm i express
// npm install pg
require('dotenv').config(); // Se usa para sincronziar con el env
const express = require('express'); // Importa el paquete express
const { Pool } = require('pg'); // Importa el paquete postgresSQL
const cors = require('cors'); //Necesario para que el backend admita conexiones del frontend
const nodemailer = require('nodemailer'); // Importa el paquete paa enviar mails *fuegito*
const bcrypt = require('bcrypt'); //Importa el paquete para hashear
const saltRounds = 10;
const jwt = require('jsonwebtoken'); //Importa el paquete para los JWT
const JWT_SECRET = process.env.JWT_SECRET;

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

//Funcion para verificar el ,token
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ mensaje: 'Token faltante' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ mensaje: 'Token inválido o expirado' });

    req.user = user;
    next();
  });
}



const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://taskflow-api-a3ur.onrender.com');
  next();
});

app.use(cors({
  origin: ['http://localhost:3000', 'https://taskflow-api-a3ur.onrender.com', 'https://taskflow-rnlr.onrender.com'], // permití ambos orígenes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

app.use(express.json()); // Necesario para leer los archivos JSON
app.use(express.static('public'));


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
app.get('/usuarios', verificarToken, async (req, res) => {
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
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const query = `
      INSERT INTO "Usuario" ("Usuario_Nombre", "Email", "Contraseña", "Rol", "Fecha_Creacion")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const valores = [nombre, email, hashedPassword, rol, fecha];

    const resultado = await pool.query(query, valores);

    // Enviar email de confirmación con el hash
    await transporter.sendMail({
      from: `"TaskFlow App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '¡Registro exitoso!',
      text: `Hola ${nombre}, te registraste correctamente como ${rol} en la app.\n\nTu contraseña hasheada es:\n\n${hashedPassword}`
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

//Login
app.post('/login', async (req, res) => {
  const { email, contrasena } = req.body;

  try {
    const resultado = await pool.query(`SELECT * FROM "Usuario" WHERE "Email" = $1`, [email]);
    const usuario = resultado.rows[0];

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const esValida = await bcrypt.compare(contrasena, usuario.Contraseña);

    if (!esValida) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // ¡Todo ok!
    res.status(200).json({
      success: true,
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario.Usuario_ID,
        nombre: usuario.Usuario_Nombre,
        email: usuario.Email,
        rol: usuario.Rol,
      }
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
  const token = jwt.sign(
    {
      id: usuario.Usuario_ID,
      email: usuario.Email,
      rol: usuario.Rol
    },
    JWT_SECRET,
    { expiresIn: '1h' } // 1 hora de duración
  );
  
  res.status(200).json({
    success: true,
    mensaje: 'Inicio de sesión exitoso',
    token, // <- lo devolvés al cliente
    usuario: {
      id: usuario.Usuario_ID,
      nombre: usuario.Usuario_Nombre,
      email: usuario.Email,
      rol: usuario.Rol
    }
  });
});

app.listen(port, () => {
  console.log("Servidor corriendo en http://localhost:${port} o en producción");
});