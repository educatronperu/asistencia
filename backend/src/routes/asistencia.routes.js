const express = require('express');
const router = express.Router();
const { 
    buscarEstudiantes, 
    registrarAsistencia, 
    registrarAsistenciaManual
 } = require('../controllers/asistencia.controller');

router.get('/buscar', buscarEstudiantes);
router.post('/', registrarAsistencia);
router.post('/manual', registrarAsistenciaManual);

module.exports = router;

router.get('/test', (req, res) => {
  res.json({ message: "Ruta activa" });
});