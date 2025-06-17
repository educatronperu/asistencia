const express = require('express');
const router = express.Router();
const personaController = require('../controllers/persona.controller');

// Listar personas
router.get('/', personaController.listarPersonas);

// Crear nueva persona
router.post('/', personaController.createPersona);

// Actualizar persona
router.put('/:id', personaController.updatePersona);

// Eliminar persona (lógica)
router.delete('/:id', personaController.deletePersona);

module.exports = router;