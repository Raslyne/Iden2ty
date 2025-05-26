// server/routes/segmento.routes.js
const express = require('express');
const router = express.Router();

const segmentoController = require('../controllers/segmento.controller');
// Importar ambos middlewares
const { protect, authorize } = require('../middleware/auth.middleware.js'); // Ajusta la ruta si es necesario

// Ruta para obtener segmentos por ID de organización
// Accesible por cualquier usuario logueado (protect), 
// la lógica de quién puede ver qué está en el controlador.
router.get(
    '/organizacion/:orgId',
    protect,
    segmentoController.getSegmentosByOrganizacionId
);

// Ruta para crear un nuevo segmento
// Solo accesible por 'SuperAdmin' y 'Administrador'
router.post(
    '/', // Corresponde a POST /api/v1/segmentos
    protect,                                  // 1. Verifica autenticación
    authorize('SuperAdmin', 'Administrador'), // 2. Verifica rol
    segmentoController.createSegmento
);

// EJEMPLOS PARA FUTURAS RUTAS PUT (actualizar) y DELETE (eliminar)
/*
router.put(
    '/:segmentoId',
    protect,
    authorize('SuperAdmin', 'Administrador'), // Solo estos roles pueden editar
    segmentoController.updateSegmento // Debes crear esta función en el controlador
);

router.delete(
    '/:segmentoId',
    protect,
    authorize('SuperAdmin'), // Quizás solo SuperAdmin puede eliminar, o también Administrador para su propia org.
    segmentoController.deleteSegmento // Debes crear esta función en el controlador
);
*/

module.exports = router;