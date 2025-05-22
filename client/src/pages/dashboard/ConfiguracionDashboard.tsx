// client/src/pages/dashboard/ConfiguracionDashboard.tsx
import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const ConfiguracionDashboard: React.FC = () => {
    return (
        <div>
            <Title level={3}>Configuración del Sistema</Title>
            <Paragraph>
                Ajustes y configuraciones generales.
            </Paragraph>
        </div>
    );
};

export default ConfiguracionDashboard;