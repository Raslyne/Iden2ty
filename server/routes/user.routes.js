// server/routes/user.routes.js
const express = require('express');
const router = express.Router();
const {
    getUsersForMyOrganization,
    updateUserStatus,
    deleteUser,
    createUserInOrganization, // Futuro
    updateUser, // Futuro
} = require('../controllers/user.controller.js');
const { protect, authorize } = require('../middleware/auth.middleware.js');

// Todas las rutas definidas aquí tendrán el prefijo que les pongas en index.js (ej. /api/v1/users)

// GET /api/v1/users/my-organization-users
// Protegido: Cualquier usuario autenticado de una organización puede ver los usuarios de SU organización.
// Si quisieras restringir esto a roles específicos, añadirías authorize() aquí.
// Ejemplo: authorize('Administrador', 'Supervisor')
router.get(
    '/my-organization-users',
    protect,
    authorize('Administrador', 'SuperAdmin', 'Supervisor'),
    getUsersForMyOrganization
);

// PUT /api/v1/users/:userIdToUpdate/status
// Protegido y Autorizado: Solo Administradores (de su organización) pueden cambiar el estado.
router.put(
    '/:userIdToUpdate/status',
    protect,
    authorize('Administrador', 'SuperAdmin'), // Solo el rol 'Administrador' de la organización
    updateUserStatus
);

// Ruta para actualizar un usuario (edición completa)
// El path es /:userIdToUpdate para coincidir con req.params.userIdToUpdate en el controlador
router.put(
    '/:userIdToUpdate',
    protect,
    authorize('Administrador', 'SuperAdmin'), // Solo estos roles pueden intentar la acción
    updateUser
);

// DELETE /api/v1/users/:userIdToDelete
// Protegido y Autorizado: Solo Administradores (de su organización) pueden eliminar.
router.delete(
    '/:userIdToDelete', // Asegúrate que el controlador deleteUser espere req.params.userIdToDelete
    protect,
    authorize('Administrador', 'SuperAdmin'),
    deleteUser
);

router.post(
    '/create',
    protect,
    authorize('Administrador', 'SuperAdmin'), // Solo el rol 'Administrador' de la organización
    createUserInOrganization
);

// --- Rutas para futuras implementaciones CRUD ---
// POST /api/v1/users
// router.post('/', protect, authorize('Administrador'), createUserInOrganization);

// PUT /api/v1/users/:userIdToUpdate (para editar perfil completo)
// router.put('/:userIdToUpdate', protect, authorize('Administrador'), updateUserInOrganization);

// GET /api/v1/users/:userId (para ver detalles de un usuario específico)
// router.get('/:userId', protect, authorize('Administrador', 'Supervisor'), getUserByIdInOrganization);


module.exports = router;