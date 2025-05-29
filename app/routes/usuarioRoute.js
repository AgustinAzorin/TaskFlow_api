const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../utils/db');
const transporter = require('../utils/mailer');
const { verificarToken, autorizacionPorRol } = require('../middlewares/auth');
const JWT_SECRET = process.env.JWT_SECRET;

// 🔐 Ruta para obtener usuarios con búsqueda opcional
router.get('/', verificarToken, async (req, res) => {
  try {
    const filtro = req.query.buscar?.toLowerCase() || '';
    const consulta = filtro
      ? `
        SELECT 
          "Usuario_ID" AS id,
          "Usuario_Nombre" AS nombre,
          "Email" AS email,
          "Rol" AS rol,
          "Fecha_Creacion" AS fecha
        FROM "Usuario"
        WHERE LOWER("Usuario_Nombre") LIKE $1 OR LOWER("Email") LIKE $1
      `
      : `
        SELECT 
          "Usuario_ID" AS id,
          "Usuario_Nombre" AS nombre,
          "Email" AS email,
          "Rol" AS rol,
          "Fecha_Creacion" AS fecha
        FROM "Usuario"
      `;
    
    const valores = filtro ? [`%${filtro}%`] : [];
    const resultado = await pool.query(consulta, valores);
    res.json(resultado.rows);
  } catch (error) {
    console.error('❌ Error al buscar usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🧾 Crear nuevo usuario
router.post('/', async (req, res) => {
  const { nombre, email, contrasena, rol, fecha } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const query = `
      INSERT INTO "Usuario" ("Usuario_Nombre", "Email", "Contraseña", "Rol", "Fecha_Creacion")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const valores = [nombre, email, hashedPassword, rol, fecha];
    const resultado = await pool.query(query, valores);

    // Enviar correo de bienvenida
    await transporter.sendMail({
      from: `"TaskFlow App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '¡Registro exitoso!',
      text: `Hola ${nombre}, te registraste correctamente como ${rol}.`
    });

    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('❌ Error al insertar usuario:', err.message);
    res.status(500).send('Error al insertar usuario: ' + err.message);
  }
});

// 🔑 Login
router.post('/login', async (req, res) => {
  const { email, contrasena } = req.body;
  try {
    const resultado = await pool.query(
      'SELECT * FROM "Usuario" WHERE "Email" = $1',
      [email]
    );
    const usuario = resultado.rows[0];
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const esValida = await bcrypt.compare(contrasena, usuario['Contraseña']);
    if (!esValida) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: usuario.Usuario_ID, email: usuario.Email, rol: usuario.Rol },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.Usuario_ID,
        nombre: usuario.Usuario_Nombre,
        email: usuario.Email,
        rol: usuario.Rol
      }
    });
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
});

module.exports = router;
