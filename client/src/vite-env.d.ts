// client/src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string; // <-- AÑADE ESTA LÍNEA
    // Aquí puedes añadir otras variables de entorno VITE_ que uses
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}