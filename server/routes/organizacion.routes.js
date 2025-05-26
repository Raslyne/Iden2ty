// server/routes/organizacion.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Crear Organización Física
router.post('/fisica', async (req, res) => {
    const client = await pool.connect();
    try {
        console.log('📥 Payload recibido para persona física:', req.body);

        const {
            id_organizacion,
            rfc,
            regimen_fiscal,
            clabe,
            nombre_representante,
            apellido_paterno_representante,
            apellido_materno_representante,
            fecha_nacimiento_representante,
            estado_civil_representante,
            curp_representante,
            tipo_documento_representante,
            numero_documento_representante,
            fecha_expiracion_documento_representante,
            dni_representante_file,
            calle,
            no_exterior,
            no_interior,
            colonia,
            codigo_postal,
            pais,
            ciudad,
            estado,
            correo_electronico,
            numero_telefonico,
            comprobante_domicilio_file,
            constancia_situacion_fiscal_file
        } = req.body;

        // Validar ID
        if (!id_organizacion) {
            throw new Error('El ID de la organización es obligatorio.');
        }

        await client.query('BEGIN');

        console.log('🔎 Verificando existencia de la organización...');
        const orgRes = await client.query(
            'SELECT * FROM Organizaciones WHERE id_organizacion = $1',
            [id_organizacion]
        );

        if (orgRes.rows.length === 0) {
            throw new Error('Organización no encontrada.');
        }

        console.log('✅ Organización encontrada');

        const existsRes = await client.query(
            'SELECT 1 FROM Persona_Fisica WHERE id_organizacion = $1',
            [id_organizacion]
        );

        if (existsRes.rows.length > 0) {
            throw new Error('Ya existe un registro de Persona Física para esta organización.');
        }

        console.log('📝 Actualizando tipo de organización...');
        await client.query(
            `UPDATE Organizaciones SET tipo_organizacion = 'Física' WHERE id_organizacion = $1`,
            [id_organizacion]
        );
        console.log('✅ Tipo de organización actualizado');

        console.log('🧾 Insertando datos en Persona_Fisica...');
        await client.query(
            `
            INSERT INTO Persona_Fisica (
                id_organizacion, rfc, regimen_fiscal, clabe,
                nombre_representante, apellido_paterno_representante, apellido_materno_representante,
                fecha_nacimiento_representante, estado_civil_representante, curp_representante,
                tipo_documento_representante, numero_documento_representante, fecha_expiracion_documento_representante,
                dni_representante,
                calle, no_exterior, no_interior, colonia, codigo_postal, pais, ciudad, estado,
                correo_electronico, numero_telefonico
            )
            VALUES (
                $1, $2, $3, $4,
                $5, $6, $7,
                $8, $9, $10,
                $11, $12, $13,
                $14,
                $15, $16, $17, $18, $19, $20, $21, $22,
                $23, $24
            )
            `,
            [
                id_organizacion, rfc, regimen_fiscal, clabe,
                nombre_representante, apellido_paterno_representante, apellido_materno_representante,
                fecha_nacimiento_representante, estado_civil_representante, curp_representante,
                tipo_documento_representante, numero_documento_representante, fecha_expiracion_documento_representante,
                dni_representante_file,
                calle, no_exterior, no_interior, colonia, codigo_postal, pais, ciudad, estado,
                correo_electronico, numero_telefonico
            ]
        );
        console.log('✅ Persona Física registrada');

        console.log('📂 Insertando documentos de organización...');
        await client.query(
            `
            INSERT INTO Documentos_Organizacion (
                id_organizacion,
                ruta_dni_representante,
                ruta_comprobante_domicilio,
                ruta_constancia_situacion_fiscal,
                fecha_ultima_actualizacion
            )
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            `,
            [id_organizacion, dni_representante_file, comprobante_domicilio_file, constancia_situacion_fiscal_file]
        );
        console.log('✅ Documentos insertados');

        await client.query('COMMIT');

        res.status(201).json({ success: true, message: 'Persona Física registrada correctamente.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error en registro de persona física:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
});

// Crear Organización Moral
router.post('/moral', async (req, res) => {
    const client = await pool.connect();
    try {
        console.log('📥 Payload recibido para persona moral:', req.body);

        const {
            id_organizacion,
            razon_social,
            rfc,
            nombre_comercial,
            website,
            clabe,
            banco,
            regimen_fiscal,
            no_notaria,
            registro_publico,
            pais,
            estado,
            ciudad,
            nombre_representante,
            apellido_paterno_representante,
            apellido_materno_representante,
            fecha_nacimiento_representante,
            tipo_documento_representante,
            numero_documento_representante,
            fecha_expiracion_documento_representante,
            rfc_representante,
            curp_representante,
            correo_electronico_representante,
            telefono_representante,
            // Simulamos las rutas
            dni_representante_file,
            comprobante_domicilio_file,
            constancia_situacion_fiscal_file,
            acta_constitutiva_file
        } = req.body;

        if (!id_organizacion) {
            throw new Error('El ID de la organización es obligatorio.');
        }

        await client.query('BEGIN');

        console.log('🔎 Verificando existencia de la organización...');
        const orgRes = await client.query(
            'SELECT * FROM Organizaciones WHERE id_organizacion = $1',
            [id_organizacion]
        );

        if (orgRes.rows.length === 0) {
            throw new Error('Organización no encontrada.');
        }
        console.log('✅ Organización encontrada');

        const existsRes = await client.query(
            'SELECT 1 FROM Persona_Moral WHERE id_organizacion = $1',
            [id_organizacion]
        );

        if (existsRes.rows.length > 0) {
            throw new Error('Ya existe un registro de Persona Moral para esta organización.');
        }

        console.log('📝 Actualizando tipo de organización...');
        await client.query(
            `UPDATE Organizaciones SET tipo_organizacion = 'Moral' WHERE id_organizacion = $1`,
            [id_organizacion]
        );
        console.log('✅ Tipo de organización actualizado');

        console.log('🧾 Insertando datos en Persona_Moral...');
        await client.query(
            `
            INSERT INTO Persona_Moral (
                id_organizacion,
                razon_social,
                rfc,
                nombre_comercial,
                website,
                clabe,
                banco,
                regimen_fiscal,
                no_notaria,
                registro_publico,
                pais,
                estado,
                ciudad,
                nombre_representante,
                apellido_paterno_representante,
                apellido_materno_representante,
                fecha_nacimiento_representante,
                tipo_documento_representante,
                numero_documento_representante,
                fecha_expiracion_documento_representante,
                rfc_representante,
                curp_representante,
                correo_electronico_representante,
                telefono_representante,
                dni_representante
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8,
                $9, $10, $11, $12, $13,
                $14, $15, $16, $17, $18, $19, $20,
                $21, $22, $23, $24, $25
            )
            `,
            [
                id_organizacion,
                razon_social,
                rfc,
                nombre_comercial,
                website,
                clabe,
                banco,
                regimen_fiscal,
                no_notaria,
                registro_publico,
                pais,
                estado,
                ciudad,
                nombre_representante,
                apellido_paterno_representante,
                apellido_materno_representante,
                fecha_nacimiento_representante,
                tipo_documento_representante,
                numero_documento_representante,
                fecha_expiracion_documento_representante,
                rfc_representante,
                curp_representante,
                correo_electronico_representante,
                telefono_representante,
                dni_representante_file // Aquí usamos la ruta simulada como valor de 'dni_representante'
            ]
        );
        console.log('✅ Persona Moral registrada');

        console.log('📂 Insertando documentos de organización...');
        await client.query(
            `
            INSERT INTO Documentos_Organizacion (
                id_organizacion,
                ruta_dni_representante,
                ruta_comprobante_domicilio,
                ruta_constancia_situacion_fiscal,
                ruta_acta_constitutiva,
                fecha_ultima_actualizacion
            )
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            `,
            [
                id_organizacion,
                dni_representante_file,
                comprobante_domicilio_file,
                constancia_situacion_fiscal_file,
                acta_constitutiva_file
            ]
        );
        console.log('✅ Documentos insertados');

        await client.query('COMMIT');

        res.status(201).json({ success: true, message: 'Persona Moral registrada correctamente.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error en registro de persona moral:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
});


router.get('/mi-organizacion/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar si existe la organización
        const orgQuery = `
            SELECT 
                o.id_organizacion,
                o.nombre_organizacion,
                o.tipo_organizacion,
                o.status_organizacion,
                pf.persona_fisica_id IS NOT NULL AS tiene_persona_fisica,
                pm.persona_moral_id IS NOT NULL AS tiene_persona_moral,
                d.ruta_dni_representante,
                d.ruta_comprobante_domicilio,
                d.ruta_constancia_situacion_fiscal,
                d.ruta_acta_constitutiva
            FROM Organizaciones o
            LEFT JOIN Persona_Fisica pf ON pf.id_organizacion = o.id_organizacion
            LEFT JOIN Persona_Moral pm ON pm.id_organizacion = o.id_organizacion
            LEFT JOIN Documentos_Organizacion d ON d.id_organizacion = o.id_organizacion
            WHERE o.id_organizacion = $1
        `;
        const result = await pool.query(orgQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: `Organización con ID ${id} no encontrada.`,
            });
        }

        const org = result.rows[0];
        const tipo = org.tipo_organizacion;
        const documentos = {
            ruta_dni_representante: org.ruta_dni_representante,
            ruta_comprobante_domicilio: org.ruta_comprobante_domicilio,
            ruta_constancia_situacion_fiscal: org.ruta_constancia_situacion_fiscal,
            ruta_acta_constitutiva: org.ruta_acta_constitutiva
        };

        return res.status(200).json({
            success: true,
            tipo,
            datos: org,
            documentos
        });
    } catch (error) {
        console.error('Error al consultar organización:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener información de la organización.'
        });
    }
});

module.exports = router;
