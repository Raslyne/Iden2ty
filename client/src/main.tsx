// client/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Tu componente App.tsx principal
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { App as AntdAppWrapper, ConfigProvider } from 'antd'; // Importa App de Ant Design con un alias

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ConfigProvider> {/* Opcional, pero buena práctica para temas/idiomas */}
          <AntdAppWrapper> {/* <--- ESTA ES LA ENVOLTURA CRUCIAL */}
            <App />          {/* Tu componente App.tsx aquí */}
          </AntdAppWrapper>
        </ConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);