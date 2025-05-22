// server/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
console.log('DEBUG: typeof authController:', typeof authController); // <--- NUEVO CONSOLE.LOG
console.log('DEBUG: authController:', authController);             // <--- NUEVO CONSOLE.LOG
console.log('DEBUG: typeof authController.loginUser:', typeof authController.loginUser); // <--- NUEVO CONSOLE.LOG

// POST /api/auth/login
router.post('/login', authController.loginUser);

// Aquí podrías añadir más rutas de autenticación:
// router.post('/register', authController.registerUser);
// router.post('/forgot-password', authController.forgotPassword);
// router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;