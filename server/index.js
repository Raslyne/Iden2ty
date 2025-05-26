// server/index.js
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');

// --- IMPORTAR RUTAS ---
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes.js'); // <--- AÑADE ESTA LÍNEA
const organizacionRoutes = require('./routes/organizacion.routes');
const segmentoRoutes = require('./routes/segmento.routes'); // Ajusta la ruta al archivo

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' })); 

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// --- RUTAS API ---
app.use('/api/v1/auth', authRoutes); // Prefijo para rutas de autenticación
app.use('/api/v1/users', userRoutes); // <--- AÑADE ESTA LÍNEA (prefijo para rutas de usuarios)
app.use('/api/v1/organizaciones', organizacionRoutes);
app.use('/api/v1/segmentos', segmentoRoutes); // Monta las rutas de segmentos

app.get('/api/test', (req, res) => {
    res.json({ message: '¡API de Iden2ty funcionando correctamente!' });
});

// --- MANEJO DE RUTAS NO ENCONTRADAS (404) ---
app.all('*', (req, res, next) => {
    // Crear un error y pasarlo al manejador global de errores
    const error = new Error(`No se puede encontrar ${req.originalUrl} en este servidor.`);
    error.statusCode = 404;
    error.status = 'fail'; // Opcional, para categorizar
    next(error); // Pasa el error al siguiente middleware (el manejador global)
});

// --- MANEJADOR DE ERRORES GLOBAL ---
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'; // 'error' para errores de servidor, 'fail' para errores de cliente no manejados

    // En desarrollo, envía más detalles del error
    if (process.env.NODE_ENV === 'development') {
        console.error("ERROR GLOBAL CAPTURADO:", err);
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }

    // En producción, envía un mensaje de error genérico y loguea el error real
    console.error("ERROR GLOBAL CAPTURADO (PROD):", err); // Loguea el error para tus registros de servidor
    // Si es un error operacional conocido y confiable, puedes enviar err.message
    if (err.isOperational) { // Añade esta propiedad a tus errores operacionales customizados
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // Para errores desconocidos o de programación, no filtrar detalles al cliente
    return res.status(500).json({
        status: 'error',
        message: 'Algo salió muy mal en el servidor.'
    });
});

// Captura de la instancia del servidor para cierre grácil
const server = app.listen(PORT, () => { // <--- MODIFICADO para capturar 'server'
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Cierre grácil (como lo tenías, pero usando la variable 'server')
process.on('SIGTERM', () => {
    console.info('Señal SIGTERM recibida. Cerrando servidor http.');
    server.close(() => { 
        console.log('Servidor http cerrado.');
        // Si el pool se importa en db.js, necesitarías exportar una función para cerrarlo desde allí
        // O si 'pool' es una instancia global importada aquí directamente, podrías cerrarlo.
        // Por ahora, si 'pool' no está en este scope, omitimos su cierre directo aquí.
        // Ejemplo si pool estuviera disponible:
        /*
        if (typeof pool !== 'undefined' && pool.end) { // Verifica si pool existe y tiene método end
            pool.end(() => {
                console.log('Pool de base de datos cerrado.');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
        */
        console.log('Cerrando proceso.');
        process.exit(0);
    });
});