// server/index.js
require('dotenv').config(); // Cargar variables de entorno PRIMERO
const express = require('express');
const cors = require('cors');
// const pool = require('./config/db'); // Ya no se importa aquí directamente, se usa en controladores

// --- IMPORTAR RUTAS ---
const authRoutes = require('./routes/auth.routes');
console.log('DEBUG: typeof authRoutes:', typeof authRoutes); // <--- NUEVO CONSOLE.LOG
console.log('DEBUG: authRoutes:', authRoutes);
// const userRoutes = require('./routes/user.routes'); // Ejemplo para futuras rutas

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
// Opciones de CORS más específicas para producción (si es necesario)
// const corsOptions = {
//   origin: 'https://tu-dominio-frontend.com', // Reemplazar con tu dominio de frontend
//   optionsSuccessStatus: 200
// };
// app.use(cors(corsOptions));
app.use(cors()); // Para desarrollo, o si el backend y frontend están en el mismo dominio

app.use(express.json({ limit: '10kb' })); // Parsear JSON, con límite de tamaño de payload
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Parsear bodies URL-encoded

// Middleware de logging de peticiones (básico)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// --- RUTAS API ---
app.use('/api/auth', authRoutes); // Todas las rutas en auth.routes.js tendrán el prefijo /api/auth
// app.use('/api/users', userRoutes); // Ejemplo

// Ruta de Test (puede quedar o quitarse)
app.get('/api/test', (req, res) => {
    res.json({ message: '¡API de Iden2ty funcionando correctamente!' });
});

// --- MANEJO DE RUTAS NO ENCONTRADAS (404) ---
app.all('*', (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `No se puede encontrar ${req.originalUrl} en este servidor.`
    });
});

// --- MANEJADOR DE ERRORES GLOBAL ---
// (Este es un manejador de errores muy básico, puedes expandirlo)
// Express lo reconoce como manejador de errores por tener 4 argumentos.
app.use((err, req, res, next) => {
    console.error("ERROR GLOBAL:", err.stack);
    // Podrías tener lógica para diferentes tipos de errores aquí
    // if (err.name === 'UnauthorizedError') { // ej: error de jwt malformado
    //    return res.status(401).json({ success: false, message: 'Token inválido.' });
    // }
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor.'
    });
});


app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Opcional: Manejo de señales para cierre grácil (útil en producción con PM2, Docker, etc.)
process.on('SIGTERM', () => {
    console.info('Señal SIGTERM recibida. Cerrando servidor http.');
    server.close(() => { // `server` es la instancia retornada por app.listen()
        console.log('Servidor http cerrado.');
        // Cerrar pool de BD
        if (pool) {
            pool.end(() => {
                console.log('Pool de base de datos cerrado.');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    });
});
// Para que el cierre grácil funcione, necesitas capturar la instancia del servidor:
// const server = app.listen(PORT, () => { ... });
// Y el pool debe ser accesible en este scope si lo vas a cerrar aquí.
// Si el pool está en db.js, puedes exportar una función para cerrarlo.