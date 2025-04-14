const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');

router.get('/', rolesController.getAllRoles);
router.get('/:id', rolesController.getRolById);
router.post('/', rolesController.createRol);
router.post('/masivo', rolesController.createMultipleRoles);
router.delete('/masivo', rolesController.deleteMultipleRoles);
router.delete('/:id', rolesController.deleteRol);
router.put('/masivo', rolesController.updateMultipleRoles);
router.put('/:id', rolesController.updateRol);
router.patch('/masivo', rolesController.patchMultipleRoles);
router.patch('/:id', rolesController.patchRol);

module.exports = router;
