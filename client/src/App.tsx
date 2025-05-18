// client/src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Esta es tu landing page pública
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; // Esta es la página después del login
import ProtectedRoute from './components/ProtectedRoute';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <div className="app-background">
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<HomePage />} /> {/* HomePage es la landing pública en la raíz */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
          {/* DashboardPage es la principal ruta protegida */}
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Puedes añadir más rutas protegidas aquí si las necesitas */}
          {/* Ejemplo: <Route path="/profile" element={<ProfilePage />} /> */}
        </Route>
        
        {/* Opcional: Ruta para "No Encontrado" (404) */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </div>
  );
};

export default App;