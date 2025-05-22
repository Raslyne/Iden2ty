// client/src/utils/axiosInstance.ts
import axios from 'axios'; // Solo importa 'axios' por defecto

// Para las variables de entorno con Vite:
// 1. Crea un archivo '.env' en la raíz de tu carpeta 'client' (si no existe)
// 2. Dentro de '.env', añade: VITE_API_URL=http://localhost:3000/api/v1 (o tu URL de backend)
// 3. Asegúrate que tu archivo 'client/src/vite-env.d.ts' (o similar) declara ImportMetaEnv

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const axiosInstance = axios.create({
    baseURL: baseURL,
});

// Interceptor para añadir el token JWT a cada petición
axiosInstance.interceptors.request.use(
    (config) => { // <--- No hay anotación de tipo explícita aquí para 'config'
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
    },
    (error) => { // <--- No hay anotación de tipo explícita aquí para 'error'
        return Promise.reject(error);
    }
);

// Opcional: Interceptor de respuestas para manejo global de errores
axiosInstance.interceptors.response.use(
    (response) => response, // <--- No hay anotación de tipo explícita aquí para 'response'
    (error) => { // <--- No hay anotación de tipo explícita aquí para 'error'
        if (error.response && error.response.status === 401) {
            console.error("Interceptor: Error 401 - No autorizado.");
            // Considera una lógica de logout más robusta aquí
            // Ejemplo:
            // localStorage.removeItem('authToken');
            // localStorage.removeItem('authUser');
            // if (!window.location.pathname.includes('/login')) {
            //    window.location.href = '/login';
            // }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;