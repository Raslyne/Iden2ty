// client/src/pages/dashboard/InicioDashboard.tsx (o la ruta que elijas)
import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const InicioDashboard: React.FC = () => {
    return (
        <div>
            <Title level={3}>Página de Inicio del Dashboard</Title>
            <Paragraph>
                Aquí irá el contenido principal y resumen de la sección de Inicio.
            </Paragraph>
        </div>
    );
};

export default InicioDashboard;