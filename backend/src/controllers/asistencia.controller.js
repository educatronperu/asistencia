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

// ✅ REGISTRAR ASISTENCIA MANUAL
const registrarAsistenciaManual = async (req, res) => {
  const { persona_id, tipo, usar_hora_inicio } = req.body;

  try {
    let horaFinal = 'NOW()'; // por defecto

    if (usar_hora_inicio) {
      // Obtener la hora_inicio desde configuracion_tardanza
      const result = await pool.query(`
        SELECT ct.hora_inicio
        FROM matricula m
        JOIN grado_seccion gs ON m.grado_seccion_id = gs.id
        JOIN configuracion_tardanza ct ON ct.grado_seccion_id = gs.id
        WHERE m.persona_id = $1 AND m.estado = TRUE
      `, [persona_id]);

      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'No se encontró la hora de inicio configurada.' });
      }

      horaFinal = `'${result.rows[0].hora_inicio}'`;
    }

    await pool.query(`
      INSERT INTO asistencia (persona_id, fecha, hora, tipo)
      VALUES ($1, CURRENT_DATE, ${horaFinal}, $2)
    `, [persona_id, tipo]);

    res.json({ message: 'Asistencia registrada con éxito.' });

  } catch (error) {
    console.error('Error al registrar asistencia manual:', error);
    res.status(500).json({ message: 'Error al registrar asistencia.' });
  }
};

module.exports = { buscarEstudiantes, registrarAsistencia, registrarAsistenciaManual };