// src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom'; // <--- Importar Routes y Route
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage'; // <--- Crearemos este componente pronto
import './styles/global.css';

const App: React.FC = () => {
  return (
    <div className="app-background">
      <Routes> {/* <--- Definir el contenedor de rutas */}
        <Route path="/" element={<HomePage />} /> {/* <--- Ruta para HomePage */}
        <Route path="/login" element={<LoginPage />} /> {/* <--- Ruta para LoginPage */}
      </Routes>
    </div>
  );
};

export default App;