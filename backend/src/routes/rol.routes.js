const express = require('express');
const router = express.Router();
const { getRoles, createRol } = require('../controllers/rol.controller');

router.get('/', getRoles);
router.post('/', createRol);

module.exports = router;