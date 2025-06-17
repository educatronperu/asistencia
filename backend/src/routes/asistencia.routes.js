const express = require('express');
const router = express.Router();
const { buscarEstudiantes, registrarAsistencia } = require('../controllers/asistencia.controller');

router.get('/buscar', buscarEstudiantes);
router.post('/', registrarAsistencia);

module.exports = router;