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
        // MODIFICACIÓN: Actualizar la consulta SQL
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
                u.id_segmento, -- Nueva columna en lugar de segmento_usuario
                so.nombre_segmento, -- Nombre del segmento desde la tabla Segmentos_Organizacion
                o.status_organizacion,
                o.nombre_organizacion 
            FROM Usuarios u
            INNER JOIN Organizaciones o ON u.id_organizacion = o.id_organizacion
            LEFT JOIN Segmentos_Organizacion so ON u.id_segmento = so.id_segmento -- LEFT JOIN para obtener el nombre del segmento
            WHERE u.correo_electronico = $1;
        `;
        const { rows } = await pool.query(userQuery, [correo_electronico.toLowerCase()]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Credenciales inválidas.' });
        }

        const usuario = rows[0]; // El objeto 'usuario' ahora tendrá 'id_segmento' y 'nombre_segmento'

        const passwordIsValid = await bcrypt.compare(password_usuario, usuario.password_hash);
        if (!passwordIsValid) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
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

        const tokenPayload = {
            id_usuarios: usuario.id_usuarios,
            correo_electronico: usuario.correo_electronico,
            rol_usuario: usuario.rol_usuario,
            id_organizacion: usuario.id_organizacion
            // No incluimos el segmento en el token a menos que sea estrictamente necesario para la lógica de autorización del token.
        };

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("Error: JWT_SECRET no está definido en las variables de entorno.");
            return res.status(500).json({ success: false, message: 'Error de configuración del servidor.' });
        }
        
        const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

        // MODIFICACIÓN: Ajustar el objeto 'usuario' en la respuesta
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
                // Información del segmento
                segmento: usuario.id_segmento ? { // Si el usuario tiene un segmento asignado
                    id: usuario.id_segmento,
                    nombre: usuario.nombre_segmento 
                } : null, // Si no tiene segmento, se devuelve null
                organizacion: {
                    id_organizacion: usuario.id_organizacion,
                    nombre_organizacion: usuario.nombre_organizacion,
                    status: usuario.status_organizacion
                }
            }
        });

    } catch (error) {
        console.error('Error en el proceso de login:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

// ... (otros controladores de autenticación)