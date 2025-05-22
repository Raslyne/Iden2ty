// server/controllers/auth.controller.js
const pool = require('../config/db'); // Importar el pool configurado
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.loginUser = async (req, res) => {
    const { correo_electronico, password_usuario } = req.body;

    if (!correo_electronico || !password_usuario) {
        return res.status(400).json({ 
            success: false, 
            message: 'El correo electrónico y la contraseña son obligatorios.' 
        });
    }

    try {
        const userQuery = `
            SELECT 
                u.id_usuarios,
                u.nombre_usuario,
                u.apellido_paterno,
                u.apellido_materno,
                u.correo_electronico,
                u.password_hash,
                u.status_usuario,
                u.id_organizacion,
                u.rol_usuario,
                u.segmento_usuario,
                o.status_organizacion,
                o.nombre_organizacion 
            FROM Usuarios u
            JOIN Organizaciones o ON u.id_organizacion = o.id_organizacion
            WHERE u.correo_electronico = $1;
        `;
        const { rows } = await pool.query(userQuery, [correo_electronico.toLowerCase()]); // Normalizar email a minúsculas

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Credenciales inválidas.' }); // Mensaje genérico
        }

        const usuario = rows[0];

        const passwordIsValid = await bcrypt.compare(password_usuario, usuario.password_hash);
        if (!passwordIsValid) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' }); // Mensaje genérico
        }

        if (usuario.status_organizacion !== 'Activa') {
            return res.status(403).json({ 
                success: false, 
                message: 'La organización asociada a este usuario no está activa. Contacte al administrador.' 
            });
        }

        if (usuario.status_usuario !== 'Habilitado') {
            let userMessage = 'Usuario no habilitado.';
            if (usuario.status_usuario === 'Inhabilitado') {
                userMessage = 'Su cuenta de usuario ha sido inhabilitada. Contacte al administrador.';
            } else if (usuario.status_usuario === 'Espera') {
                userMessage = 'Su cuenta de usuario está pendiente de activación. Contacte al administrador.';
            }
            return res.status(403).json({ success: false, message: userMessage });
        }

        // Login Exitoso
        const tokenPayload = {
            id_usuarios: usuario.id_usuarios,
            correo_electronico: usuario.correo_electronico,
            rol_usuario: usuario.rol_usuario,
            id_organizacion: usuario.id_organizacion
        };

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("Error: JWT_SECRET no está definido en las variables de entorno.");
            return res.status(500).json({ success: false, message: 'Error de configuración del servidor.' });
        }
        
        const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

        res.status(200).json({
            success: true,
            message: 'Login exitoso.',
            token: token,
            usuario: {
                id_usuarios: usuario.id_usuarios,
                nombre_usuario: usuario.nombre_usuario,
                apellido_paterno: usuario.apellido_paterno,
                apellido_materno: usuario.apellido_materno,
                correo_electronico: usuario.correo_electronico,
                rol_usuario: usuario.rol_usuario,
                segmento_usuario: usuario.segmento_usuario,
                organizacion: {
                    id_organizacion: usuario.id_organizacion,
                    nombre_organizacion: usuario.nombre_organizacion,
                    status: usuario.status_organizacion
                }
            }
        });

    } catch (error) {
        console.error('Error en el proceso de login:', error);
        // Loggear el error de forma más detallada en un sistema de logging en producción
        // if (error.message && error.message.includes("Invalid salt version")) { ... } // Manejo específico si aún es necesario
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

// Aquí podrías añadir más funciones controladoras para autenticación:
// exports.registerUser = async (req, res) => { ... };
// exports.forgotPassword = async (req, res) => { ... };
// exports.resetPassword = async (req, res) => { ... };