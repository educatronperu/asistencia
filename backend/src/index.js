const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Servir frontend
app.use('/', express.static(path.join(__dirname, '../../frontend')));

// Rutas API
const rolRoutes = require('./routes/rol.routes');
const personaRoutes = require('./routes/persona.routes');
const loginRoutes = require('./routes/login');
const bimestreRoutes = require('./routes/bimestre.routes');
const asistenciaRoutes = require('./routes/asistencia.routes');

app.use('/api/roles', rolRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/bimestres', bimestreRoutes);
app.use('/api/asistencia', asistenciaRoutes);

// Ruta test
app.get('/hora', async (req, res) => {
  const pool = require('./db');
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Servidor funcionando – hora en DB: ${result.rows[0].now}`);
  } catch (err) {
    res.status(500).send('Error de conexión a la base de datos');
  }
});

// Esta ruta debe ir al final:
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dashboard.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});