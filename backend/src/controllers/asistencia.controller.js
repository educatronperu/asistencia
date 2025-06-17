const pool = require('../db');

// Buscar estudiantes por nombre o apellido
const buscarEstudiantes = async (req, res) => {
  const q = req.query.query || '';
  const result = await pool.query(
    `SELECT p.id, p.nombres, p.apellidos, p.dni, r.nombre AS rol
     FROM persona p
     JOIN rol r ON p.rol_id = r.id
     WHERE p.estado = TRUE AND 
           (p.nombres ILIKE $1 OR p.apellidos ILIKE $1)
     ORDER BY p.apellidos LIMIT 20`,
    [`%${q}%`]
  );
  res.json(result.rows);
};

// Registrar asistencia
const registrarAsistencia = async (req, res) => {
  const { persona_id, tipo } = req.body;
  if (!['entrada', 'salida'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido' });
  }

  try {
    await pool.query(
      `INSERT INTO asistencia (persona_id, fecha, hora, tipo, fecha_carga)
       VALUES ($1, CURRENT_DATE, CURRENT_TIME, $2, NOW())`,
      [persona_id, tipo]
    );
    res.status(201).json({ message: 'Asistencia registrada' });
  } catch (err) {
    console.error('Error al registrar asistencia', err);
    res.status(500).json({ error: 'Error al registrar asistencia' });
  }
};

module.exports = { buscarEstudiantes, registrarAsistencia };