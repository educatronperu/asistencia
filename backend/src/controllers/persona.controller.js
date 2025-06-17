const pool = require('../db');

// Listar personas activas
const listarPersonas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, r.nombre AS rol
      FROM persona p
      JOIN rol r ON p.rol_id = r.id
      WHERE p.estado = true
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener personas:', error);
    res.status(500).json({ error: 'Error al obtener personas' });
  }
};

// Crear nueva persona
const createPersona = async (req, res) => {
  try {
    const {
      dni,
      apellidos,
      nombres,
      direccion,
      fecha_nacimiento,
      usuario,
      clave,
      foto,
      rol_id
    } = req.body;

    const result = await pool.query(
      `INSERT INTO persona (
        dni, apellidos, nombres, direccion, fecha_nacimiento,
        usuario, password, foto, rol_id, estado
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true) RETURNING *`,
      [dni, apellidos, nombres, direccion, fecha_nacimiento, usuario, clave, foto, rol_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear persona:', error);
    res.status(500).json({ error: 'Error al crear persona' });
  }
};

// Actualizar persona
const updatePersona = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      dni,
      apellidos,
      nombres,
      direccion,
      fecha_nacimiento,
      usuario,
      clave,
      foto,
      rol_id
    } = req.body;

    const result = await pool.query(
      `UPDATE persona SET
        dni = $1,
        apellidos = $2,
        nombres = $3,
        direccion = $4,
        fecha_nacimiento = $5,
        usuario = $6,
        password = $7,
        foto = $8,
        rol_id = $9
      WHERE id = $10 RETURNING *`,
      [dni, apellidos, nombres, direccion, fecha_nacimiento, usuario, clave, foto, rol_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar persona:', error);
    res.status(500).json({ error: 'Error al actualizar persona' });
  }
};

// Eliminar lógica (desactivar persona)
const deletePersona = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE persona SET estado = false WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }

    res.json({ mensaje: 'Persona desactivada correctamente' });
  } catch (error) {
    console.error('Error al eliminar persona:', error);
    res.status(500).json({ error: 'Error al eliminar persona' });
  }
};

module.exports = {
  listarPersonas,
  createPersona,
  updatePersona,
  deletePersona
};
