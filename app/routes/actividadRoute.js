const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const { verificarToken, autorizacionPorRol } = require('../middlewares/auth');

// Obtener el historial de actividades
router.get('/', verificarToken, autorizacionPorRol('admin'), async (req, res) => {
  try {
    const query = `
      SELECT 
        a."Accion_ID",
        a."Accion_Descripcion",
        a."Fecha",
        a."Entidad_afectada",
        u."Usuario_Nombre"
      FROM "Accion" a
      LEFT JOIN "Usuario" u ON a."Usuario_ID" = u."Usuario_ID"
      ORDER BY a."Fecha" DESC
    `;
    const resultado = await pool.query(query);
    res.status(200).json(resultado.rows);
  } catch (err) {
    console.error('❌ Error al obtener historial:', err.message);
    res.status(500).json({ mensaje: 'Error al obtener historial de acciones' });
  }
});

module.exports = router;
