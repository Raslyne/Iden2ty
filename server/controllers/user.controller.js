// server/controllers/user.controller.js
const pool = require('../config/db');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs'); // <--- IMPORTANTE: Asegúrate de tener esta línea

/**
 * @desc   Obtener todos los usuarios de una organización específica.
 * @route  GET /api/v1/users/my-organization-users
 * @access Privado (ej. 'Administrador' de la organización, 'Supervisor')
 */
exports.getUsersForMyOrganization = asyncHandler(async (req, res) => {
    const requestingUser = req.user; // Provisto por el middleware 'protect'

    if (!requestingUser.id_organizacion) {
        return res.status(400).json({ success: false, message: 'El usuario solicitante no está asociado a una organización.' });
    }

    const query = `
        SELECT 
            id_usuarios, 
            nombre_usuario, 
            apellido_paterno, 
            apellido_materno, 
            correo_electronico, 
            rol_usuario, 
            segmento_usuario, 
            status_usuario,
            telefono_usuario 
        FROM Usuarios 
        WHERE id_organizacion = $1
        ORDER BY nombre_usuario ASC, apellido_paterno ASC;
    `;
    const { rows } = await pool.query(query, [requestingUser.id_organizacion]);
    
    res.status(200).json({ success: true, count: rows.length, usuarios: rows });
});


/**
 * @desc   Actualizar el estado de un usuario específico dentro de la misma organización.
 * @route  PUT /api/v1/users/:userIdToUpdate/status
 * @access Privado (ej. 'Administrador' de la organización)
 */
exports.updateUserStatus = asyncHandler(async (req, res) => {
    const { userIdToUpdate } = req.params;
    const { status_usuario } = req.body;
    const requestingUser = req.user;

    const validStatuses = ['Habilitado', 'Inhabilitado', 'Espera'];
    if (!status_usuario || !validStatuses.includes(status_usuario)) {
        return res.status(400).json({ success: false, message: `Estatus inválido. Valores permitidos: ${validStatuses.join(', ')}.` });
    }

    if (requestingUser.id_usuarios === userIdToUpdate) {
        return res.status(403).json({ success: false, message: 'No puedes modificar tu propio estado directamente.' });
    }

    const userToModifyQuery = await pool.query(
        'SELECT id_organizacion, status_usuario FROM Usuarios WHERE id_usuarios = $1',
        [userIdToUpdate]
    );

    if (userToModifyQuery.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario a modificar no encontrado.' });
    }
    const userToModifyOrgId = userToModifyQuery.rows[0].id_organizacion;

    if (requestingUser.id_organizacion !== userToModifyOrgId) {
        // Asumiendo que solo usuarios de la misma organización pueden modificar,
        // y la autorización de rol específico (ej. 'Administrador') se maneja en las rutas.
        return res.status(403).json({ success: false, message: 'No autorizado para modificar usuarios de otra organización.' });
    }

    const updateQuery = 'UPDATE Usuarios SET status_usuario = $1 WHERE id_usuarios = $2 RETURNING id_usuarios, status_usuario, nombre_usuario;';
    const { rows } = await pool.query(updateQuery, [status_usuario, userIdToUpdate]);
    
    res.status(200).json({ 
        success: true, 
        message: `Estatus del usuario '${rows[0].nombre_usuario}' actualizado a '${rows[0].status_usuario}'.`,
        usuario: { id_usuarios: rows[0].id_usuarios, status_usuario: rows[0].status_usuario }
    });
});

/**
 * @desc   Eliminar un usuario específico dentro de la misma organización.
 * @route  DELETE /api/v1/users/:userIdToDelete
 * @access Privado (ej. 'Administrador' de la organización)
 */
exports.deleteUser = asyncHandler(async (req, res) => {
    console.log('--- [BE] Controlador deleteUser alcanzado ---'); // DEBUG
    const { userIdToDelete } = req.params;
    const requestingUser = req.user;

    console.log(`[BE] Solicitud para eliminar usuario ID: ${userIdToDelete} por usuario ID: ${requestingUser.id_usuarios} con rol: ${requestingUser.rol_usuario}`); // DEBUG

    if (requestingUser.id_usuarios === userIdToDelete) {
        console.log('[BE] Intento de auto-eliminación. Devolviendo 400.'); // DEBUG
        return res.status(400).json({ success: false, message: 'No puedes eliminar tu propia cuenta.' });
    }

    console.log('[BE] Buscando usuario a eliminar en la BD...'); // DEBUG
    const userToDeleteQuery = await pool.query('SELECT * FROM Usuarios WHERE id_usuarios = $1', [userIdToDelete]);

    if (userToDeleteQuery.rows.length === 0) {
        console.log('[BE] Usuario a eliminar no encontrado. Devolviendo 404.'); // DEBUG
        return res.status(404).json({ success: false, message: 'Usuario a eliminar no encontrado.' });
    }
    const targetUser = userToDeleteQuery.rows[0];
    console.log(`[BE] Usuario encontrado: ID ${targetUser.id_usuarios}, Rol ${targetUser.rol_usuario}. Verificando permisos...`); // DEBUG

    // Lógica de Permisos para Eliminar
    let canProceedToDelete = false;
    if (requestingUser.rol_usuario === 'SuperAdmin') {
        if (targetUser.rol_usuario === 'SuperAdmin') {
            console.log('[BE] SuperAdmin intentando eliminar a otro SuperAdmin. Devolviendo 403.'); // DEBUG
            return res.status(403).json({ success: false, message: 'Un SuperAdmin no puede eliminar a otro SuperAdmin.' });
        }
        console.log('[BE] Permiso SuperAdmin: OK para eliminar non-SuperAdmin.'); // DEBUG
        canProceedToDelete = true;
    } else if (requestingUser.rol_usuario === 'Administrador') {
        if (targetUser.rol_usuario === 'SuperAdmin' || targetUser.rol_usuario === 'Administrador') {
            console.log('[BE] Administrador intentando eliminar SuperAdmin u otro Administrador. Devolviendo 403.'); // DEBUG
            return res.status(403).json({ success: false, message: 'Un Administrador no puede eliminar SuperAdmins ni otros Administradores.' });
        }
        console.log('[BE] Permiso Administrador: OK para eliminar rol inferior.'); // DEBUG
        canProceedToDelete = true;
    } else {
        // Esta rama es para otros roles (Supervisor, Analista, etc.)
        // El middleware `authorize` en la ruta ya debería haberlos bloqueado.
        // Si llegan aquí, es una capa extra de seguridad.
        console.log(`[BE] Rol no autorizado (${requestingUser.rol_usuario}) intentando eliminar. Devolviendo 403.`); // DEBUG
        return res.status(403).json({ success: false, message: 'No tienes permisos para eliminar este usuario.' });
    }

    if (!canProceedToDelete) {
        // Este caso no debería ocurrir si la lógica anterior es completa, pero por si acaso.
        console.log('[BE] Error lógico en permisos, canProceedToDelete es false inesperadamente. Devolviendo 403.'); // DEBUG
        return res.status(403).json({ success: false, message: 'No se pudo determinar el permiso para eliminar (error lógico).' });
    }

    console.log(`[BE] Verificación de permisos completada. Intentando eliminar de la BD usuario ID: ${userIdToDelete}`); // DEBUG
    const deleteResult = await pool.query('DELETE FROM Usuarios WHERE id_usuarios = $1', [userIdToDelete]);
    console.log('[BE] Resultado de la operación DELETE en BD. Filas afectadas (rowCount):', deleteResult.rowCount); // DEBUG

    if (deleteResult.rowCount > 0) {
        console.log('[BE] Usuario eliminado exitosamente de la BD. Devolviendo 200.'); // DEBUG
        res.status(200).json({ success: true, message: `Usuario '${targetUser.nombre_usuario}' eliminado exitosamente.` });
    } else {
        // Esto podría suceder si el usuario fue eliminado entre la comprobación y la ejecución del DELETE,
        // o si hay algún trigger/regla de BD que previene la eliminación sin arrojar error SQL.
        console.log('[BE] El DELETE en BD no afectó filas (rowCount === 0). Devolviendo 500.'); // DEBUG
        res.status(500).json({ success: false, message: 'El usuario no pudo ser eliminado de la base de datos (posiblemente ya no existía o hubo un problema no reportado).' });
    }
});

/**
 * @desc   Crear un nuevo usuario dentro de la organización del solicitante.
 * @route  POST /api/v1/users/create (o la ruta definida en user.routes.js)
 * @access Privado (ej. 'Administrador' de la organización)
 */
exports.createUserInOrganization = asyncHandler(async (req, res) => {
    const {
        correo_electronico,
        password_usuario,     // Contraseña en texto plano del formulario
        nombre_usuario,
        apellido_paterno,
        apellido_materno,
        telefono_usuario,
        rol_usuario,
        segmento_usuario,
        status_usuario // Ej: 'Habilitado' o 'Espera', debe ser enviado desde el frontend
    } = req.body;

    const requestingUser = req.user; // Del middleware 'protect'

    // Solo un Superadmin puede crear otro Superadmin
    if (rol_usuario === 'Superadmin' && requestingUser.rol_usuario !== 'Superadmin') {
        return res.status(403).json({
            success: false,
            message: 'Solo un Superadmin puede crear otro Superadmin.',
        });
    }
    // Validación de campos requeridos (puedes usar express-validator para validaciones más robustas)
    if (!correo_electronico || !password_usuario || !nombre_usuario || !apellido_paterno || !rol_usuario || !status_usuario || !segmento_usuario) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos (correo, contraseña, nombre, apellido paterno, rol, segmento, estatus).' });
    }
    // Validar longitud de contraseña
    if (password_usuario.length < 8) {
        return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    if (!requestingUser.id_organizacion) {
        return res.status(400).json({ success: false, message: 'El usuario administrador no está asociado a una organización para crear nuevos usuarios.' });
    }

    // Verificar si el correo ya existe en la base de datos
    const userExists = await pool.query('SELECT id_usuarios FROM Usuarios WHERE correo_electronico = $1', [correo_electronico.toLowerCase()]);
    if (userExists.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado.' });
    }

    // Hashear la contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password_usuario, salt);

    const insertQuery = `
        INSERT INTO Usuarios (
            id_organizacion, 
            nombre_usuario, 
            apellido_paterno, 
            apellido_materno,
            correo_electronico, 
            rol_usuario, 
            segmento_usuario, 
            status_usuario,
            password_hash -- Columna para la contraseña hasheada
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) -- $9 es para password_hash
        RETURNING id_usuarios, nombre_usuario, correo_electronico, rol_usuario, status_usuario, segmento_usuario;
    `;

    const values = [
        requestingUser.id_organizacion,
        nombre_usuario,
        apellido_paterno,
        apellido_materno || null, // Guardar NULL si no se proporciona y la DB lo permite
        correo_electronico.toLowerCase(), // Guardar correo en minúsculas para consistencia
        rol_usuario,
        segmento_usuario || null,   // Guardar NULL si no se proporciona
        status_usuario,             // Ej: 'Habilitado' o 'Espera' del frontend
        passwordHash                // La contraseña ya hasheada
    ];

    const { rows } = await pool.query(insertQuery, values);

    if (rows.length === 0) {
        // Esto sería inesperado si la inserción no lanzó un error SQL antes
        return res.status(500).json({ success: false, message: 'Error interno: No se pudo crear el usuario después de la inserción.' });
    }

    // Considera no devolver toda la información del usuario aquí, solo lo esencial o un mensaje de éxito.
    // El frontend puede volver a llamar a fetchUsers para actualizar la lista.
    res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente.',
        usuario: rows[0], // Devuelve los datos del usuario recién creado (sin la contraseña)
    });
});

/**
 * @desc     Actualizar un usuario específico.
 * @route    PUT /api/v1/users/:userIdToUpdate
 * @access   Privado ('Administrador', 'SuperAdmin')
 */
exports.updateUser = asyncHandler(async (req, res) => {
    const { userIdToUpdate } = req.params;
    const {
        nombre_usuario,
        apellido_paterno,
        apellido_materno,
        telefono_usuario,
        rol_usuario,
        segmento_usuario,
        status_usuario
        // Nota: correo_electronico y password_usuario no se procesan para actualización aquí.
        // El correo es generalmente inmutable o requiere un proceso especial.
        // El cambio de contraseña requiere hashing y un manejo dedicado.
    } = req.body;
    const requestingUser = req.user;

    // 1. Obtener el usuario que se va a modificar
    const userQuery = await pool.query('SELECT * FROM Usuarios WHERE id_usuarios = $1', [userIdToUpdate]);
    if (userQuery.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario a editar no encontrado.' });
    }
    // --- USAREMOS 'targetUser' para referirnos al usuario que se está editando ---
    const targetUser = userQuery.rows[0];
    const isSelfEdit = requestingUser.id_usuarios === targetUser.id_usuarios;

    // 2. Lógica de Permisos para Editar
    if (requestingUser.rol_usuario === 'SuperAdmin') {
        if (!isSelfEdit && targetUser.rol_usuario === 'SuperAdmin') {
            return res.status(403).json({ success: false, message: 'Un SuperAdmin no puede editar los datos de otro SuperAdmin.' });
        }
        // SuperAdmin puede editarse a sí mismo o a cualquier non-SuperAdmin.
    } else if (requestingUser.rol_usuario === 'Administrador') {
        if (isSelfEdit) {
             return res.status(403).json({ success: false, message: 'Los Administradores deben usar su página de perfil dedicada para editar sus propios datos (esta función no lo permite para Administradores editándose a sí mismos).' });
        }
        if (targetUser.rol_usuario === 'SuperAdmin' || targetUser.rol_usuario === 'Administrador') {
            return res.status(403).json({ success: false, message: 'Un Administrador no puede editar a SuperAdmins ni a otros Administradores.' });
        }
    } else {
        // Otros roles no deberían llegar aquí debido al middleware `authorize` en las rutas.
        return res.status(403).json({ success: false, message: 'No tienes permisos para editar este usuario.' });
    }

    // 3. Validación de cambio de rol (si se proporciona rol_usuario en el body y es diferente)
    if (rol_usuario && rol_usuario !== targetUser.rol_usuario) {
        if (rol_usuario === 'SuperAdmin' && requestingUser.rol_usuario !== 'SuperAdmin') {
            return res.status(403).json({ success: false, message: 'Solo un SuperAdmin puede asignar el rol de SuperAdmin.' });
        }
        if (requestingUser.rol_usuario === 'Administrador' && (rol_usuario === 'SuperAdmin' || rol_usuario === 'Administrador')) {
             return res.status(403).json({ success: false, message: 'Un Administrador no puede asignar el rol de SuperAdmin o Administrador a otros usuarios.' });
        }
    }

    // 4. Construir objeto con campos a actualizar.
    // Si un campo no viene en req.body, se mantiene el valor actual de targetUser.
    // --- 'currentValues' es un alias para 'targetUser' para claridad al tomar valores existentes ---
    const currentValues = targetUser;
    const newValues = {
        nombre_usuario: nombre_usuario !== undefined ? nombre_usuario : currentValues.nombre_usuario,
        apellido_paterno: apellido_paterno !== undefined ? apellido_paterno : currentValues.apellido_paterno,
        apellido_materno: apellido_materno !== undefined ? apellido_materno : currentValues.apellido_materno,
        telefono_usuario: telefono_usuario !== undefined ? telefono_usuario : currentValues.telefono_usuario,
        rol_usuario: rol_usuario !== undefined ? rol_usuario : currentValues.rol_usuario, // Esta es una línea candidata a ser la 235
        segmento_usuario: segmento_usuario !== undefined ? segmento_usuario : currentValues.segmento_usuario,
        status_usuario: status_usuario !== undefined ? status_usuario : currentValues.status_usuario,
    };

    // 5. Ejecutar la actualización en la base de datos
    const updateQuery = `
        UPDATE Usuarios SET 
            nombre_usuario = $1, apellido_paterno = $2, apellido_materno = $3,
            telefono_usuario = $4, rol_usuario = $5, segmento_usuario = $6, status_usuario = $7
        WHERE id_usuarios = $8
        RETURNING id_usuarios, nombre_usuario, correo_electronico, rol_usuario, status_usuario, segmento_usuario, apellido_paterno, apellido_materno, telefono_usuario;
    `;
    const dbValues = [
        newValues.nombre_usuario,
        newValues.apellido_paterno,
        newValues.apellido_materno,
        newValues.telefono_usuario,
        newValues.rol_usuario,
        newValues.segmento_usuario,
        newValues.status_usuario,
        userIdToUpdate
    ];

    const { rows } = await pool.query(updateQuery, dbValues);

    if (rows.length === 0) {
        // Esto no debería suceder si el usuario se encontró inicialmente y no hubo error de SQL.
        return res.status(500).json({ success: false, message: 'Error interno: No se pudo actualizar el usuario después de la consulta.' });
    }

    res.status(200).json({
        success: true,
        message: 'Usuario actualizado con éxito.',
        usuario: rows[0] // Devuelve el usuario actualizado
    });
});

// --- Placeholder para futuras funciones ---
// exports.updateUserInOrganization = asyncHandler(async (req, res) => { /* ... */ });
// exports.getUserByIdInOrganization = asyncHandler(async (req, res) => { /* ... */ });