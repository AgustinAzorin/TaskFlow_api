const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const { verificarToken, autorizacionPorRol } = require('../middlewares/auth');

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
