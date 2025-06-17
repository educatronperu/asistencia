const pool = require('../db');

// Obtener todos los bimestres del periodo activo
exports.getBimestres = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*
      FROM bimestre b
      JOIN periodo p ON b.periodo_id = p.id
      WHERE p.estado = TRUE
      ORDER BY b.fecha_inicio
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los bimestres' });
  }
};

// Crear un nuevo bimestre en el periodo activo
exports.createBimestre = async (req, res) => {
  const { nombre, fecha_inicio, fecha_fin } = req.body;
  try {
    const periodo = await pool.query(`SELECT id FROM periodo WHERE estado = TRUE LIMIT 1`);
    if (periodo.rowCount === 0) {
      return res.status(400).json({ error: 'No hay periodo activo' });
    }
    const periodo_id = periodo.rows[0].id;

    const result = await pool.query(
      `INSERT INTO bimestre (periodo_id, nombre, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [periodo_id, nombre, fecha_inicio, fecha_fin]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el bimestre' });
  }
};

// Actualizar un bimestre
exports.updateBimestre = async (req, res) => {
  const { id } = req.params;
  const { nombre, fecha_inicio, fecha_fin } = req.body;
  try {
    const result = await pool.query(
      `UPDATE bimestre SET nombre = $1, fecha_inicio = $2, fecha_fin = $3
       WHERE id = $4 RETURNING *`,
      [nombre, fecha_inicio, fecha_fin, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el bimestre' });
  }
};

// Eliminar bimestre (elimina permanentemente)
exports.deleteBimestre = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM bimestre WHERE id = $1`, [id]);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el bimestre' });
  }
};
