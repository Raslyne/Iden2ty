// server/config/db.js
const { Pool } = require('pg');
// No necesitamos require('dotenv').config() aquí si ya está en el index.js principal
// y se carga antes de que este módulo sea requerido la primera vez.
// Sin embargo, por robustez, si este módulo pudiera ser requerido antes,
// o para asegurar que siempre estén disponibles las variables, puedes incluirlo.
// require('dotenv').config({ path: '../.env' }); // Asumiendo que .env está en la raíz de server/

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10), // Asegurar que el puerto sea un número
    // Opciones adicionales recomendadas para un pool en producción:
    max: 20, // Número máximo de clientes en el pool
    idleTimeoutMillis: 30000, // Cuánto tiempo un cliente puede estar inactivo antes de ser cerrado
    connectionTimeoutMillis: 2000, // Cuánto tiempo esperar por una conexión antes de fallar
});

// Opcional: Probar la conexión al iniciar
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error al adquirir cliente de la base de datos', err.stack);
        // Podrías querer terminar la aplicación si la conexión a la BD es crítica al inicio
        // process.exit(1); 
    } else {
        console.log('Conexión exitosa a la base de datos PostgreSQL.');
        if (client) client.release(); // Liberar el cliente inmediatamente después de la prueba
    }
});

module.exports = pool;