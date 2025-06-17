const pool = require('../db');

// Obtener todos los roles
const getRoles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rol');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener roles' });
  }
};

// Crear un nuevo rol
const createRol = async (req, res) => {
  const { nombre } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO rol (nombre, estado) VALUES ($1, 1) RETURNING *',
      [nombre]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear rol' });
  }
};

module.exports = {
  getRoles,
  createRol,
};