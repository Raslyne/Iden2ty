// server/controllers/user.controller.js
const pool = require('../config/db');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

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

    // MODIFICACIÓN: Actualizar la consulta SQL
    const query = `
        SELECT 
            u.id_usuarios, 
            u.nombre_usuario, 
            u.apellido_paterno, 
            u.apellido_materno, 
            u.correo_electronico, 
            u.rol_usuario, 
            u.id_segmento,      -- Nueva columna
            so.nombre_segmento, -- Nombre del segmento
            u.status_usuario,
            u.telefono_usuario 
        FROM Usuarios u
        LEFT JOIN Segmentos_Organizacion so ON u.id_segmento = so.id_segmento -- Unir para obtener nombre del segmento
        WHERE u.id_organizacion = $1
        ORDER BY u.nombre_usuario ASC, u.apellido_paterno ASC;
    `;
    const { rows } = await pool.query(query, [requestingUser.id_organizacion]);
    
    // MODIFICACIÓN: Transformar la respuesta para incluir el objeto segmento
    const usuariosTransformados = rows.map(usuario => ({
        id_usuarios: usuario.id_usuarios,
        nombre_usuario: usuario.nombre_usuario,
        apellido_paterno: usuario.apellido_paterno,
        apellido_materno: usuario.apellido_materno,
        correo_electronico: usuario.correo_electronico,
        rol_usuario: usuario.rol_usuario,
        status_usuario: usuario.status_usuario,
        telefono_usuario: usuario.telefono_usuario,
        segmento: usuario.id_segmento ? {
            id: usuario.id_segmento,
            nombre: usuario.nombre_segmento
        } : null
    }));
    
    res.status(200).json({ success: true, count: usuariosTransformados.length, usuarios: usuariosTransformados });
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
        password_usuario,
        nombre_usuario,
        apellido_paterno,
        apellido_materno,
        telefono_usuario,
        rol_usuario,
        id_segmento,      // MODIFICACIÓN: Esperar id_segmento en lugar de segmento_usuario
        status_usuario
    } = req.body;

    const requestingUser = req.user;

    if (rol_usuario === 'Superadmin' && requestingUser.rol_usuario !== 'Superadmin') {
        return res.status(403).json({
            success: false,
            message: 'Solo un Superadmin puede crear otro Superadmin.',
        });
    }
    
    // MODIFICACIÓN: Ajustar validación de campos requeridos
    // Considerar si id_segmento es siempre obligatorio o puede ser null. 
    // Si puede ser null, quitarlo de esta validación estricta.
    // Por ahora, asumiré que puede ser opcional (null) y no lo pongo como estrictamente requerido aquí,
    // pero si lo es, debe incluirse: if (!id_segmento && id_segmento !== null) { ... }
    if (!correo_electronico || !password_usuario || !nombre_usuario || !apellido_paterno || !rol_usuario || !status_usuario) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos (correo, contraseña, nombre, apellido paterno, rol, estatus).' });
    }
    if (password_usuario.length < 8) {
        return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    if (!requestingUser.id_organizacion) {
        return res.status(400).json({ success: false, message: 'El usuario administrador no está asociado a una organización para crear nuevos usuarios.' });
    }

    // Opcional: Validar que id_segmento (si se proporciona) existe y pertenece a la organización
    if (id_segmento) {
        const segmentExists = await pool.query(
            'SELECT id_segmento FROM Segmentos_Organizacion WHERE id_segmento = $1 AND id_organizacion = $2',
            [id_segmento, requestingUser.id_organizacion]
        );
        if (segmentExists.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'El segmento seleccionado no es válido o no pertenece a esta organización.' });
        }
    }

    const userExists = await pool.query('SELECT id_usuarios FROM Usuarios WHERE correo_electronico = $1', [correo_electronico.toLowerCase()]);
    if (userExists.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password_usuario, salt);

    // MODIFICACIÓN: Actualizar la consulta de inserción y el RETURNING
    const insertQuery = `
        INSERT INTO Usuarios (
            id_organizacion, 
            nombre_usuario, 
            apellido_paterno, 
            apellido_materno,
            correo_electronico, 
            rol_usuario, 
            id_segmento,      -- Usar id_segmento
            status_usuario,
            password_hash,
            telefono_usuario  -- Asegurarse que teléfono está en el INSERT si se recibe
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id_usuarios, nombre_usuario, correo_electronico, rol_usuario, status_usuario, id_segmento, telefono_usuario, apellido_paterno, apellido_materno;
    `;

    const values = [
        requestingUser.id_organizacion,
        nombre_usuario,
        apellido_paterno,
        apellido_materno || null,
        correo_electronico.toLowerCase(),
        rol_usuario,
        id_segmento || null,      // Usar id_segmento, permitir null si es opcional
        status_usuario,
        passwordHash,
        telefono_usuario || null // Asegurar que teléfono_usuario está aquí
    ];

    const { rows } = await pool.query(insertQuery, values);
    const createdUserRaw = rows[0];

    // Para devolver el nombre del segmento consistentemente:
    let nombreSegmentoCreado = null;
    if (createdUserRaw.id_segmento) {
        const segmentoQuery = await pool.query('SELECT nombre_segmento FROM Segmentos_Organizacion WHERE id_segmento = $1', [createdUserRaw.id_segmento]);
        if (segmentoQuery.rows.length > 0) {
            nombreSegmentoCreado = segmentoQuery.rows[0].nombre_segmento;
        }
    }
    
    res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente.',
        usuario: {
            id_usuarios: createdUserRaw.id_usuarios,
            nombre_usuario: createdUserRaw.nombre_usuario,
            apellido_paterno: createdUserRaw.apellido_paterno,
            apellido_materno: createdUserRaw.apellido_materno,
            correo_electronico: createdUserRaw.correo_electronico,
            rol_usuario: createdUserRaw.rol_usuario,
            status_usuario: createdUserRaw.status_usuario,
            telefono_usuario: createdUserRaw.telefono_usuario,
            segmento: createdUserRaw.id_segmento ? {
                id: createdUserRaw.id_segmento,
                nombre: nombreSegmentoCreado
            } : null
        },
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
        id_segmento,      // MODIFICACIÓN: Esperar id_segmento
        status_usuario
    } = req.body;
    const requestingUser = req.user;

    const userQuery = await pool.query('SELECT * FROM Usuarios WHERE id_usuarios = $1', [userIdToUpdate]);
    if (userQuery.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Usuario a editar no encontrado.' });
    }
    const targetUser = userQuery.rows[0]; // Este 'targetUser' ya tiene el 'id_segmento' actual de la BD
    const isSelfEdit = requestingUser.id_usuarios === targetUser.id_usuarios;

    // ... (Lógica de permisos existente sin cambios)...
    if (requestingUser.rol_usuario === 'SuperAdmin') {
        if (!isSelfEdit && targetUser.rol_usuario === 'SuperAdmin') {
            return res.status(403).json({ success: false, message: 'Un SuperAdmin no puede editar los datos de otro SuperAdmin.' });
        }
    } else if (requestingUser.rol_usuario === 'Administrador') {
        if (isSelfEdit) {
            return res.status(403).json({ success: false, message: 'Los Administradores deben usar su página de perfil dedicada para editar sus propios datos (esta función no lo permite para Administradores editándose a sí mismos).' });
        }
        if (targetUser.rol_usuario === 'SuperAdmin' || targetUser.rol_usuario === 'Administrador') {
            return res.status(403).json({ success: false, message: 'Un Administrador no puede editar a SuperAdmins ni a otros Administradores.' });
        }
    } else {
        return res.status(403).json({ success: false, message: 'No tienes permisos para editar este usuario.' });
    }

    if (rol_usuario && rol_usuario !== targetUser.rol_usuario) {
        if (rol_usuario === 'SuperAdmin' && requestingUser.rol_usuario !== 'SuperAdmin') {
            return res.status(403).json({ success: false, message: 'Solo un SuperAdmin puede asignar el rol de SuperAdmin.' });
        }
        if (requestingUser.rol_usuario === 'Administrador' && (rol_usuario === 'SuperAdmin' || rol_usuario === 'Administrador')) {
            return res.status(403).json({ success: false, message: 'Un Administrador no puede asignar el rol de SuperAdmin o Administrador a otros usuarios.' });
        }
    }
    // Fin lógica de permisos

    // Opcional: Validar que id_segmento (si se proporciona y es diferente del actual) existe y pertenece a la organización
    // Si id_segmento es "" o undefined, significa que no se quiere cambiar. Si es null, se quiere quitar.
    if (id_segmento !== undefined && id_segmento !== targetUser.id_segmento) { // Solo validar si se intenta cambiar
        if (id_segmento !== null) { // Si es null, estamos quitando el segmento, no hay que validar existencia
            const segmentExists = await pool.query(
                'SELECT id_segmento FROM Segmentos_Organizacion WHERE id_segmento = $1 AND id_organizacion = $2',
                [id_segmento, targetUser.id_organizacion] // Usar id_organizacion del targetUser
            );
            if (segmentExists.rows.length === 0) {
                return res.status(400).json({ success: false, message: 'El segmento seleccionado no es válido o no pertenece a esta organización.' });
            }
        }
    }
    
    const currentValues = targetUser;
    const newValues = {
        nombre_usuario: nombre_usuario !== undefined ? nombre_usuario : currentValues.nombre_usuario,
        apellido_paterno: apellido_paterno !== undefined ? apellido_paterno : currentValues.apellido_paterno,
        apellido_materno: apellido_materno !== undefined ? apellido_materno : currentValues.apellido_materno,
        telefono_usuario: telefono_usuario !== undefined ? telefono_usuario : currentValues.telefono_usuario,
        rol_usuario: rol_usuario !== undefined ? rol_usuario : currentValues.rol_usuario,
        // MODIFICACIÓN: Usar id_segmento. Si se envía undefined, se mantiene el actual. Si se envía null, se borra.
        id_segmento: id_segmento !== undefined ? (id_segmento === "" ? null : id_segmento) : currentValues.id_segmento,
        status_usuario: status_usuario !== undefined ? status_usuario : currentValues.status_usuario,
    };

    // MODIFICACIÓN: Actualizar consulta UPDATE y RETURNING
    const updateQuery = `
        UPDATE Usuarios SET 
            nombre_usuario = $1, apellido_paterno = $2, apellido_materno = $3,
            telefono_usuario = $4, rol_usuario = $5, id_segmento = $6, status_usuario = $7
        WHERE id_usuarios = $8
        RETURNING *; -- Retornar todas las columnas del usuario actualizado
    `;
    const dbValues = [
        newValues.nombre_usuario,
        newValues.apellido_paterno,
        newValues.apellido_materno,
        newValues.telefono_usuario,
        newValues.rol_usuario,
        newValues.id_segmento, // Puede ser null para desasignar
        newValues.status_usuario,
        userIdToUpdate
    ];

    const { rows } = await pool.query(updateQuery, dbValues);
    const updatedUserRaw = rows[0];

    // Para devolver el nombre del segmento consistentemente:
    let nombreSegmentoActualizado = null;
    if (updatedUserRaw.id_segmento) {
        const segmentoQuery = await pool.query('SELECT nombre_segmento FROM Segmentos_Organizacion WHERE id_segmento = $1', [updatedUserRaw.id_segmento]);
        if (segmentoQuery.rows.length > 0) {
            nombreSegmentoActualizado = segmentoQuery.rows[0].nombre_segmento;
        }
    }

    res.status(200).json({
        success: true,
        message: 'Usuario actualizado con éxito.',
        usuario: { // Construir la respuesta de manera consistente
            id_usuarios: updatedUserRaw.id_usuarios,
            nombre_usuario: updatedUserRaw.nombre_usuario,
            apellido_paterno: updatedUserRaw.apellido_paterno,
            apellido_materno: updatedUserRaw.apellido_materno,
            correo_electronico: updatedUserRaw.correo_electronico, // Asegúrate que RETURNING * lo trajo
            rol_usuario: updatedUserRaw.rol_usuario,
            status_usuario: updatedUserRaw.status_usuario,
            telefono_usuario: updatedUserRaw.telefono_usuario,
            segmento: updatedUserRaw.id_segmento ? {
                id: updatedUserRaw.id_segmento,
                nombre: nombreSegmentoActualizado
            } : null
        }
    });
});

// --- Placeholder para futuras funciones ---
// exports.updateUserInOrganization = asyncHandler(async (req, res) => { /* ... */ });
// exports.getUserByIdInOrganization = asyncHandler(async (req, res) => { /* ... */ });