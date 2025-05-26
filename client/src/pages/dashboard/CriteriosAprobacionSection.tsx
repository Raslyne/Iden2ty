// client/src/pages/dashboard/CriteriosAprobacionSection.tsx
import React from 'react';
import { Typography } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const CriteriosAprobacionSection: React.FC = () => {
    return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <ExperimentOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '20px' }} />
            <Title level={4}>Criterios de Aprobación</Title>
            <Paragraph>
                Esta sección se encuentra actualmente en desarrollo.
            </Paragraph>
            <Paragraph>
                Aquí podrás establecer los criterios para la aprobación de diferentes procesos.
            </Paragraph>
        </div>
    );
};

export default CriteriosAprobacionSection;