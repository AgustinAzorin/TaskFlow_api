const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const transporter = require('../utils/mailer');
const { verificarToken, autorizacionPorRol } = require('../middlewares/auth');

// Obtener todas las tareas
router.get('/', verificarToken, async (req, res) => {
  try {
    const { id: userId, rol } = req.user;

    const query = `
      SELECT 
        t."Tarea_ID",
        t."Tarea_Nombre",
        t."Tarea_Descripcion",
        t."Estado",
        t."Prioridad",
        t."Fecha_Limite",
        t."Tarea_Fecha_Creacion",
        t."Fecha_Finalizacion",
        u."Usuario_Nombre" AS responsable_nombre,
        p."Proyecto_Nombre" AS proyecto_nombre
      FROM "Tarea" t
      LEFT JOIN "Usuario" u ON t."Responsable" = u."Usuario_ID"
      LEFT JOIN "Proyecto" p ON t."Proyecto_ID" = p."Proyecto_ID"
      ${rol === 'admin' ? '' : 'WHERE t."Responsable" = $1'}
    `;

    const valores = rol === 'admin' ? [] : [userId];
    const resultado = await pool.query(query, valores);

    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('❌ Error al obtener tareas:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener tareas' });
  }
});

// Crear una tarea
router.post('/', verificarToken, autorizacionPorRol('admin'), async (req, res) => {
  const {
    nombre,
    descripcion,
    estado,
    prioridad,
    responsable,
    proyecto_id,
    fecha_limite
  } = req.body;

  const tareaCreada = resultado.rows[0];

await pool.query(`
    INSERT INTO "Accion" ("Usuario_ID", "Accion_Descripcion", "Fecha", "Entidad_afectada")
    VALUES ($1, $2, CURRENT_DATE, 'Tarea')
  `, [
    req.user.id,
    `Asignó la tarea "${tareaCreada.Tarea_Nombre}" al usuario ID ${responsable}`
  ]);
  


  if (!nombre || !responsable || !proyecto_id || !estado || !prioridad) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
  }

  try {
    const insertarTarea = `
      INSERT INTO "Tarea" (
        "Tarea_Nombre", "Tarea_Descripcion", "Estado", "Prioridad",
        "Responsable", "Proyecto_ID", "Fecha_Limite", "Tarea_Fecha_Creacion"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)
      RETURNING *
    `;
    const valores = [
      nombre,
      descripcion || null,
      estado,
      prioridad,
      responsable,
      proyecto_id,
      fecha_limite
    ];
    const resultado = await pool.query(insertarTarea, valores);
    const tareaCreada = resultado.rows[0];

    // Obtener datos del responsable para enviar mail
    const userQuery = 'SELECT "Email", "Usuario_Nombre" FROM "Usuario" WHERE "Usuario_ID" = $1';
    const usuario = await pool.query(userQuery, [responsable]);
    const { Email, Usuario_Nombre } = usuario.rows[0];

    await transporter.sendMail({
      from: `"TaskFlow App" <${process.env.EMAIL_USER}>`,
      to: Email,
      subject: 'Nueva tarea asignada',
      text: `Hola ${Usuario_Nombre}, se te ha asignado la tarea "${nombre}".`
    });

    res.status(201).json(tareaCreada);
  } catch (error) {
    console.error('❌ Error al crear tarea:', error.message);
    res.status(500).json({ mensaje: 'Error al crear tarea' });
  }
});

module.exports = router;
