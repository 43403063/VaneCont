const express = require('express');
const router = express.Router();
const transaccionesController = require('../controllers/transaccionesController');

router.post('/', transaccionesController.registrarTransaccion);
router.get('/all/:idEmpresa', transaccionesController.getTransacciones);
router.get('/:id', transaccionesController.getTransaccionPorId);
router.put('/:id', transaccionesController.actualizarTransaccion);

module.exports = router;