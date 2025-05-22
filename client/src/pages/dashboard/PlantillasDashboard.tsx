// client/src/pages/dashboard/PlantillasDashboard.tsx
import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const PlantillasDashboard: React.FC = () => {
    return (
        <div>
            <Title level={3}>Administración de Plantillas</Title>
            <Paragraph>
                Aquí podrás crear y gestionar tus plantillas.
            </Paragraph>
        </div>
    );
};

export default PlantillasDashboard;