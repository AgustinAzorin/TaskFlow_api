const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const { verificarToken, autorizacionPorRol } = require('../middlewares/auth');

// Obtener todos los proyectos
router.get('/', verificarToken, async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT P.*, U."Usuario_Nombre" FROM "Proyecto" P JOIN "Usuario" U ON P."Usuario_ID" = U."Usuario_ID"'
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error al obtener proyectos:', err);
    res.status(500).json({ mensaje: 'Error al obtener proyectos', error: err.message });
  }
});

// Crear un nuevo proyecto
router.post('/', verificarToken, autorizacionPorRol(['admin']), async (req, res) => {
  const { nombre, descripcion } = req.body;
  const usuarioID = req.usuario.id;

  if (!nombre || !descripcion) {
    return res.status(400).json({ mensaje: 'Nombre y descripción son obligatorios' });
  }

  try {
    const query = `
      INSERT INTO "Proyecto" ("Proyecto_Nombre", "Proyecto_Descripcion", "Usuario_ID")
      VALUES ($1, $2, $3)
      RETURNING *`;

    const valores = [nombre, descripcion, usuarioID];

    const resultado = await pool.query(query, valores);
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error('Error al crear proyecto:', err.message);
    res.status(500).json({ mensaje: 'Error al crear proyecto', error: err.message });
  }
});

// Actualizar un proyecto
router.put('/:id', verificarToken, autorizacionPorRol(['admin']), async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  if (!nombre || !descripcion) {
    return res.status(400).json({ mensaje: 'Nombre y descripción son obligatorios' });
  }

  try {
    const query = `
      UPDATE "Proyecto"
      SET "Proyecto_Nombre" = $1, "Proyecto_Descripcion" = $2
      WHERE "Proyecto_ID" = $3
      RETURNING *`;

    const valores = [nombre, descripcion, id];
    const resultado = await pool.query(query, valores);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error al actualizar proyecto:', err.message);
    res.status(500).json({ mensaje: 'Error al actualizar proyecto', error: err.message });
  }
});

// Eliminar un proyecto
router.delete('/:id', verificarToken, autorizacionPorRol(['admin']), async (req, res) => {
  const { id } = req.params;

  try {
    const query = `DELETE FROM "Proyecto" WHERE "Proyecto_ID" = $1 RETURNING *`;
    const resultado = await pool.query(query, [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    res.json({ mensaje: 'Proyecto eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar proyecto:', err.message);
    res.status(500).json({ mensaje: 'Error al eliminar proyecto', error: err.message });
  }
});

module.exports = router;

