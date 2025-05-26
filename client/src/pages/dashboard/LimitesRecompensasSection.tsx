// client/src/pages/dashboard/LimitesRecompensasSection.tsx
import React from 'react';
import { Typography } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const LimitesRecompensasSection: React.FC = () => {
    return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <ExperimentOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '20px' }} />
            <Title level={4}>Límites de Recompensas</Title>
            <Paragraph>
                Esta sección se encuentra actualmente en desarrollo.
            </Paragraph>
            <Paragraph>
                Próximamente podrás configurar los límites y condiciones para las recompensas.
            </Paragraph>
        </div>
    );
};

export default LimitesRecompensasSection;