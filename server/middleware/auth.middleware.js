// server/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // Para manejo de errores async simplificado
// const pool = require('../config/db'); // Descomentar si decides cargar datos frescos del usuario desde la DB aquí

/**
 * @desc Middleware para proteger rutas. Verifica el token JWT y adjunta la información
 * esencial del usuario (del payload del token) a req.user.
 */
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // El payload de tu token (según auth.controller.js) es:
            // { id_usuarios, correo_electronico, rol_usuario, id_organizacion }
            // Estos son los datos que estarán disponibles en req.user para los controladores.
            req.user = {
                id_usuarios: decoded.id_usuarios,
                correo_electronico: decoded.correo_electronico,
                rol_usuario: decoded.rol_usuario,
                id_organizacion: decoded.id_organizacion,
            };

            // OPCIONAL: Si necesitaras datos más frescos o adicionales del usuario en CADA petición protegida:
            /*
            const userQuery = await pool.query(
                'SELECT id_usuarios, nombre_usuario, correo_electronico, rol_usuario, id_organizacion, status_usuario FROM Usuarios WHERE id_usuarios = $1 AND status_usuario = $2',
                [decoded.id_usuarios, 'Habilitado'] // Asegurarse que el usuario sigue habilitado
            );
            if (userQuery.rows.length === 0) {
                return res.status(401).json({ success: false, message: 'No autorizado, usuario no encontrado o no habilitado.' });
            }
            req.user = userQuery.rows[0];
            */

            next();
        } catch (error) {
            console.error('Error de autenticación en middleware (protect):', error.name, error.message);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ success: false, message: 'Token inválido o malformado.' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'El token ha expirado.' });
            }
            return res.status(401).json({ success: false, message: 'No autorizado.' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'No autorizado, no se proporcionó token.' });
    }
});

/**
 * @desc Middleware para autorizar basado en roles de usuario.
 * Se usa DESPUÉS del middleware `protect`.
 * @param {...string} roles - Lista de roles permitidos para acceder al recurso.
 */
exports.authorize = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user || !req.user.rol_usuario) {
            // Esto solo debería ocurrir si 'protect' no se ejecutó o falló en establecer req.user.rol_usuario
            return res.status(403).json({ success: false, message: 'Acceso denegado. No se pudo determinar el rol del usuario.' });
        }

        if (!rolesPermitidos.includes(req.user.rol_usuario)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado. El rol '${req.user.rol_usuario}' no tiene permiso para realizar esta acción.`
            });
        }
        next(); // El rol del usuario está en la lista de roles permitidos
    };
};