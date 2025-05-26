// client/src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/global.css';

// Importa los componentes para las secciones del Dashboard
// Ajusta las rutas si los guardaste en una subcarpeta como 'pages/dashboard/'
import InicioDashboard from './pages/dashboard/InicioDashboard'; // Ejemplo de ruta
import OrganizacionDashboard from './pages/dashboard/OrganizacionDashboard'; // Ejemplo de ruta
import PlantillasDashboard from './pages/dashboard/PlantillasDashboard'; // Ejemplo de ruta
import UsuariosDashboard from './pages/dashboard/UsuariosDashboard'; // Ejemplo de ruta
import ConfiguracionDashboard from './pages/dashboard/ConfiguracionDashboard'; // Ejemplo de ruta
import PoliticasDashboard from './pages/dashboard/PoliticasDashboard';

const App: React.FC = () => {
  return (
    <div className="app-background">
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
          {/* DashboardPage ahora actúa como un layout para rutas anidadas */}
          <Route path="/dashboard" element={<DashboardPage />}>
            {/* Ruta por defecto o "index" para el dashboard */}
            <Route index element={<InicioDashboard />} /> 
            {/* Otras sub-rutas del dashboard */}
            <Route path="inicio" element={<InicioDashboard />} />
            <Route path="organizacion" element={<OrganizacionDashboard />} />
            <Route path="plantillas" element={<PlantillasDashboard />} />
            <Route path="usuarios" element={<UsuariosDashboard />} />
            <Route path="configuracion" element={<ConfiguracionDashboard />} />
            <Route path="politicas" element={<PoliticasDashboard />} />
          </Route>
          {/* Puedes añadir más rutas protegidas aquí si las necesitas al mismo nivel que /dashboard */}
          {/* Ejemplo: <Route path="/profile" element={<ProfilePage />} /> */}
        </Route>
        
        {/* Opcional: Ruta para "No Encontrado" (404) */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </div>
  );
};

export default App;