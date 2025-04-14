const express = require('express');
const router = express.Router();
const plancuentasController = require('../controllers/plancuentasController');

router.get('/', plancuentasController.getPlanCuentas);
router.get('/:codigo', plancuentasController.getPlanCuentasPorCodigo);
router.post('/', plancuentasController.createPlanCuenta);
//router.post('/masivo', plancuentasController.createProductosMasivo);
router.patch('/:codigo', plancuentasController.actualizarPlanCuenta);

module.exports = router;