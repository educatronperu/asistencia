// backend/src/controllers/auth.controller.js
const pool = require('../db');

const login = async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const query = `
      SELECT p.id, p.nombres, p.apellidos, p.usuario, p.rol_id, r.nombre AS rol
      FROM persona p
      JOIN rol r ON p.rol_id = r.id
      WHERE p.usuario = $1 AND p.password = $2 AND p.estado = TRUE
    `;

    const result = await pool.query(query, [usuario, contrasena]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const persona = result.rows[0];

    // Buscar las rutas que puede acceder este rol
    const permisosQuery = `
        SELECT per.ruta
        FROM rol_permiso rp
        JOIN permiso per ON rp.permiso_id = per.id
        WHERE rp.rol_id = $1
    `;
    const permisosResult = await pool.query(permisosQuery, [persona.rol_id]);
    const permisos = permisosResult.rows.map(p => p.ruta);

    return res.json({
      ...persona,
      permisos
    });

  } catch (error) {
    console.error('Error al hacer login:', error.message);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = { login };
