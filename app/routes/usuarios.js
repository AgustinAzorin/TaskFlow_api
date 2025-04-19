const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./app/utils/db');
const transporter = require('./app/utils/mailer');
const { verificarToken, autorizacionPorRol } = require('../middlewares/auth');
const JWT_SECRET = process.env.JWT_SECRET;

// Obtener usuarios
router.get('/', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM "Usuario"');
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error en la consulta:', err);
    res.status(500).send('Error en la consulta');
  }
});

// Crear usuario
router.post('/', async (req, res) => {
  const { nombre, email, contrasena, rol, fecha } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const query = `
      INSERT INTO "Usuario" ("Usuario_Nombre", "Email", "Contraseña", "Rol", "Fecha_Creacion")
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const valores = [nombre, email, hashedPassword, rol, fecha];
    const resultado = await pool.query(query, valores);

    await transporter.sendMail({
      from: `"TaskFlow App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '¡Registro exitoso!',
      text: `Hola ${nombre}, te registraste correctamente como ${rol}.`
    });

    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('Error al insertar usuario:', err.message);
    res.status(500).send('Error al insertar usuario: ' + err.message);
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, contrasena } = req.body;

  try {
    const resultado = await pool.query(`SELECT * FROM "Usuario" WHERE "Email" = $1`, [email]);
    const usuario = resultado.rows[0];

    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const esValida = await bcrypt.compare(contrasena, usuario.Contraseña);
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
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
});

module.exports = router;
