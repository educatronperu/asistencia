/*const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ruta para login
router.post('/', async (req, res) => {
  const { usuario, clave } = req.body;

  try {
    const result = await pool.query(
      `SELECT p.id, p.nombres, p.apellidos, p.usuario, p.foto, r.nombre AS rol, p.rol_id
       FROM persona p
       JOIN rol r ON p.rol_id = r.id
       WHERE p.usuario = $1 AND p.password = $2 AND p.estado = TRUE`,
      [usuario, clave]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Devuelve los datos mínimos para usar en frontend
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
*/
const express = require('express');
const router = express.Router();
const pool = require('../db');
const crypto = require('crypto');

// Ruta para login
router.post('/', async (req, res) => {
  const { usuario, clave } = req.body;

  try {
    const result = await pool.query(
      `SELECT p.id, p.nombres, p.apellidos, p.usuario, p.foto, r.nombre AS rol, p.rol_id
       FROM persona p
       JOIN rol r ON p.rol_id = r.id
       WHERE p.usuario = $1 AND p.password = $2 AND p.estado = TRUE`,
      [usuario, clave]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const persona = result.rows[0];

    // Consultar los permisos del rol
    const permisosQuery = `
    SELECT p.ruta
    FROM rol_permiso rp
    JOIN permiso p ON rp.permiso_id = p.id
    WHERE rp.rol_id = $1
    `;
    const permisosResult = await pool.query(permisosQuery, [persona.rol_id]);
    const permisos = permisosResult.rows.map(p => p.ruta);

    persona.permisos = permisos;

    // Devuelve los datos mínimos para usar en frontend
    //res.json(result.rows[0]);
    res.json(persona);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta para solicitar recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
  const { usuario } = req.body;

  try {
    // Verificar si el usuario existe
    const userResult = await pool.query(
      'SELECT id, nombres, apellidos, email FROM persona WHERE usuario = $1 AND estado = TRUE',
      [usuario]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];
    
    // Generar código de recuperación de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Guardar código en base de datos (necesitarás crear esta tabla)
    await pool.query(
      `INSERT INTO password_reset_codes (user_id, reset_code, expires_at, created_at) 
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET reset_code = $2, expires_at = $3, created_at = NOW()`,
      [user.id, resetCode, expirationTime]
    );

    // En producción aquí enviarías el código por email
    // Por ahora devolvemos el código para pruebas
    console.log(`Código de recuperación para ${usuario}: ${resetCode}`);
    
    res.json({ 
      message: 'Código de recuperación enviado',
      // En producción NO incluir el código en la respuesta
      code: resetCode // Solo para desarrollo/pruebas
    });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta para verificar código y cambiar contraseña
router.post('/reset-password', async (req, res) => {
  const { usuario, resetCode, newPassword } = req.body;

  try {
    // Verificar código de recuperación
    const codeResult = await pool.query(
      `SELECT prc.user_id, prc.expires_at, p.usuario 
       FROM password_reset_codes prc
       JOIN persona p ON prc.user_id = p.id
       WHERE p.usuario = $1 AND prc.reset_code = $2 AND prc.expires_at > NOW()`,
      [usuario, resetCode]
    );

    if (codeResult.rows.length === 0) {
      return res.status(400).json({ message: 'Código inválido o expirado' });
    }

    const userId = codeResult.rows[0].user_id;

    // Actualizar contraseña
    await pool.query(
      'UPDATE persona SET password = $1 WHERE id = $2',
      [newPassword, userId]
    );

    // Eliminar código usado
    await pool.query(
      'DELETE FROM password_reset_codes WHERE user_id = $1',
      [userId]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });

  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;