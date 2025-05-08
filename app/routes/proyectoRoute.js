const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const { verificarToken, autorizacionPorRol } = require('../middlewares/auth');
const transporter = require('../utils/mailer');

// Obtener todos los proyectos
router.get('/', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM "Proyecto"');
    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('❌ Error al obtener proyectos:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener proyectos' });
  }
});

// Crear un nuevo proyecto con posibles integrantes
router.post('/', verificarToken, autorizacionPorRol('admin'), async (req, res) => {
  const { nombre, descripcion, usuario_id, integrantes } = req.body;
  // ya dentro del router.post
  const proyectoCreado = resultado.rows[0];

  // Registrar acción en tabla "Accion"
  await pool.query(`
  INSERT INTO "Accion" ("Usuario_ID", "Accion_Descripcion", "Fecha", "Entidad_afectada")
  VALUES ($1, $2, CURRENT_DATE, 'Proyecto')
  `, [
  usuario_id,
  `Creó el proyecto "${proyectoCreado.Proyecto_Nombre}"`
  ]);

  if (!nombre || !usuario_id) {
    return res.status(400).json({ mensaje: 'Faltan datos requeridos' });
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    // 1. Crear el proyecto
    const queryProyecto = `
      INSERT INTO "Proyecto" ("Proyecto_Nombre", "Proyecto_Descripcion", "Usuario_ID")
      VALUES ($1, $2, $3)
      RETURNING *`;
    const valores = [nombre, descripcion || null, usuario_id];
    const resultado = await cliente.query(queryProyecto, valores);
    const proyectoCreado = resultado.rows[0];

      // 2. Insertar en ProyectoUsuario si hay integrantes
        if (Array.isArray(integrantes) && integrantes.length > 0) {
          const insertQuery = `
            INSERT INTO "ProyectoUsuario" ("Usuario_ID", "Proyecto_ID")
            VALUES ${integrantes.map((_, i) => `($${i + 1}, ${proyectoCreado.Proyecto_ID})`).join(',')}
          `;
          await cliente.query(insertQuery, integrantes);
    
          // 3. Obtener datos de los usuarios para enviarles el mail
          const usuariosQuery = `
            SELECT "Usuario_Nombre", "Email"
            FROM "Usuario"
            WHERE "Usuario_ID" = ANY($1::int[])
          `;
          const resultadoUsuarios = await cliente.query(usuariosQuery, [integrantes]);
    
          for (const usuario of resultadoUsuarios.rows) {
            await transporter.sendMail({
              from: `"TaskFlow App" <${process.env.EMAIL_USER}>`,
              to: usuario.Email,
              subject: 'Nuevo proyecto asignado',
              text: `Hola ${usuario.Usuario_Nombre}, se te ha incluido en el proyecto "${proyectoCreado.Proyecto_Nombre}".`
            });
          }
        }  
    

    await cliente.query('COMMIT');
    res.status(201).json(proyectoCreado);
  } catch (error) {
    await cliente.query('ROLLBACK');
    console.error('❌ Error al crear proyecto:', error.message);
    res.status(500).json({ mensaje: 'Error al crear proyecto' });
  } finally {
    cliente.release();
  }
});


module.exports = router;
