// server/controllers/segmento.controller.js
const pool = require('../config/db');
const asyncHandler = require('express-async-handler');

/**
 * @desc   Obtener todos los segmentos de una organización específica.
 * @route  GET /api/v1/segmentos/organizacion/:orgId
 * @access Privado
 */
exports.getSegmentosByOrganizacionId = asyncHandler(async (req, res) => {
    const { orgId } = req.params;
    const requestingUser = req.user;

    // El middleware 'protect' ya establece req.user.
    // Lógica de autorización: SuperAdmin ve todo, otros roles solo su organización.
    if (requestingUser.rol_usuario !== 'SuperAdmin' && requestingUser.id_organizacion !== orgId) {
        return res.status(403).json({
            success: false,
            message: 'No está autorizado para acceder a los segmentos de esta organización.'
        });
    }

    const query = `
        SELECT 
            id_segmento, 
            nombre_segmento, 
            descripcion_segmento,
            id_organizacion,
            fecha_creacion
        FROM Segmentos_Organizacion 
        WHERE id_organizacion = $1
        ORDER BY nombre_segmento ASC;
    `;
    const { rows } = await pool.query(query, [orgId]);

    res.status(200).json({
        success: true,
        count: rows.length,
        segmentos: rows
    });
});

/**
 * @desc   Crear un nuevo segmento.
 * @route  POST /api/v1/segmentos
 * @access Privado (Controlado por middleware authorize(['SuperAdmin', 'Administrador']))
 */
exports.createSegmento = asyncHandler(async (req, res) => {
    const { nombre_segmento, descripcion_segmento, id_organizacion } = req.body;
    const requestingUser = req.user; // Establecido por 'protect'

    // El middleware 'authorize' ya ha verificado que requestingUser.rol_usuario es 'SuperAdmin' o 'Administrador'.

    // 1. Validación de datos de entrada
    if (!nombre_segmento || !id_organizacion) {
        return res.status(400).json({
            success: false,
            message: 'El nombre del segmento y el ID de la organización son requeridos.'
        });
    }

    // 2. Validación de Permisos Adicional (especificidad):
    //    Si el usuario es 'Administrador', solo puede crear segmentos para su propia organización.
    //    (SuperAdmin ya pasó esta condición gracias al middleware 'authorize' y la lógica de abajo)
    if (requestingUser.rol_usuario === 'Administrador' && requestingUser.id_organizacion !== id_organizacion) {
        return res.status(403).json({
            success: false,
            message: 'Los Administradores solo pueden crear segmentos para su propia organización.'
        });
    }

    // (Opcional pero recomendado) Verificar si la 'id_organizacion' proporcionada existe realmente
    const orgCheck = await pool.query('SELECT id_organizacion FROM Organizaciones WHERE id_organizacion = $1', [id_organizacion]);
    if (orgCheck.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: `La organización con ID ${id_organizacion} no existe.`
        });
    }

    // 3. Insertar en la base de datos
    try {
        const insertQuery = `
            INSERT INTO Segmentos_Organizacion (id_organizacion, nombre_segmento, descripcion_segmento)
            VALUES ($1, $2, $3)
            RETURNING id_segmento, nombre_segmento, descripcion_segmento, id_organizacion, fecha_creacion;
        `;
        const { rows } = await pool.query(insertQuery, [id_organizacion, nombre_segmento, descripcion_segmento || null]);

        res.status(201).json({
            success: true,
            message: 'Segmento creado exitosamente.',
            segmento: rows[0]
        });

    } catch (error) {
        if (error.code === '23505' && error.constraint === 'uq_organizacion_nombre_segmento') {
            return res.status(409).json({
                success: false,
                message: `Error: Ya existe un segmento con el nombre "${nombre_segmento}" para esta organización.`
            });
        }
        console.error("Error al crear segmento en la base de datos:", error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al intentar crear el segmento.'
        });
    }
});

// --- CONTROLADORES FUTUROS ---
/*
exports.updateSegmento = asyncHandler(async (req, res) => {
    // const { segmentoId } = req.params;
    // const { nombre_segmento, descripcion_segmento } = req.body;
    // const requestingUser = req.user;
    // 
    // 1. Obtener el segmento a actualizar para verificar su id_organizacion.
    // 2. Validar permisos:
    //    - Si es SuperAdmin, puede editar.
    //    - Si es Administrador, solo puede editar si el segmento pertenece a su requestingUser.id_organizacion.
    // 3. Actualizar en la BD.
});

exports.deleteSegmento = asyncHandler(async (req, res) => {
    // const { segmentoId } = req.params;
    // const requestingUser = req.user;
    //
    // 1. Obtener el segmento a eliminar para verificar su id_organizacion.
    // 2. Validar permisos (similar a updateSegmento o más restrictivo, ej. solo SuperAdmin).
    // 3. Eliminar de la BD.
});
*/