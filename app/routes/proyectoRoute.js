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

// Crear un nuevo proyecto
router.post('/', verificarToken, autorizacionPorRol('admin'), async (req, res) => {
  const { nombre, descripcion, usuario_id } = req.body;

  if (!nombre || !usuario_id) {
    return res.status(400).json({ mensaje: 'Faltan datos requeridos' });
  }

  try {
    // Insertar el proyecto
    const queryProyecto = `
      INSERT INTO "Proyecto" ("Proyecto_Nombre", "Proyecto_Descripcion", "Usuario_ID")
      VALUES ($1, $2, $3)
      RETURNING *`;
    const valores = [nombre, descripcion || null, usuario_id];
    const resultado = await pool.query(queryProyecto, valores);
    const proyectoCreado = resultado.rows[0];

    // Registrar la acción
    const descripcionAccion = `Creó el proyecto: ${nombre}`;
    const queryAccion = `
      INSERT INTO "Accion" ("Usuario_ID", "Accion_Descripcion", "Fecha", "Entidad_afectada")
      VALUES ($1, $2, CURRENT_DATE, 'Proyecto')`;
    await pool.query(queryAccion, [usuario_id, descripcionAccion]);

    res.status(201).json(proyectoCreado);
  } catch (error) {
    console.error('❌ Error al crear proyecto:', error.message);
    res.status(500).json({ mensaje: 'Error al crear proyecto' });
  }
});

module.exports = router;
