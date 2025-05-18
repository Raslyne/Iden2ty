// client/src/pages/DashboardPage.tsx
import React from 'react';
import { Typography, Button } from 'antd';
import { useAuth } from '../context/AuthContext'; // Para acceder a datos del usuario o función logout

const { Title, Paragraph } = Typography;

const DashboardPage: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div style={{ padding: '20px' }}>
        <Title level={2}>Dashboard</Title>
        <Paragraph>
            ¡Bienvenido de nuevo, {user?.nombre_usuario || 'Usuario'}!
        </Paragraph>
        <Paragraph>
            Esta es tu página principal después de iniciar sesión.
        </Paragraph>
        <Paragraph>
            Correo: {user?.correo_electronico}
        </Paragraph>
        <Paragraph>
            Organización: {user?.organizacion?.nombre_organizacion} ({user?.organizacion?.status})
        </Paragraph>
        <Button type="primary" onClick={logout}>
            Cerrar Sesión
        </Button>
        </div>
    );
};

export default DashboardPage;