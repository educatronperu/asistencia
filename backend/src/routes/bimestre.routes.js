const express = require('express');
const router = express.Router();
const bimestreController = require('../controllers/bimestre.controller');

router.get('/', bimestreController.getBimestres);
router.post('/', bimestreController.createBimestre);
router.put('/:id', bimestreController.updateBimestre);
router.delete('/:id', bimestreController.deleteBimestre);

module.exports = router;
