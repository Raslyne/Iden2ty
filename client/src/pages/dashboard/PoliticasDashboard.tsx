// client/src/pages/dashboard/PoliticasDashboard.tsx
import React from 'react';
import { Tabs, Typography } from 'antd';
import {
    ControlOutlined,
    DollarCircleOutlined,
    ApartmentOutlined,
    FileDoneOutlined
} from '@ant-design/icons';

// Importar los nuevos componentes de sección
import RolesPermisosFuncionesSection from './RolesPermisosFuncionesSection';
import LimitesRecompensasSection from './LimitesRecompensasSection';
import SegmentacionSection from './SegmentacionSection';
import CriteriosAprobacionSection from './CriteriosAprobacionSection';

const { Title } = Typography;
const { TabPane } = Tabs;

const PoliticasDashboard: React.FC = () => {
    return (
        <div style={{ background: '#fff', padding: '24px', minHeight: 'calc(100vh - 112px)' /* Ajusta según tu layout */ }}>
            <Title level={2} style={{ marginBottom: '24px' }}>
                Políticas y Configuración
            </Title>
            <Tabs tabPosition="left" defaultActiveKey="1"> {/* Puedes cambiar defaultActiveKey según necesites */}
                <TabPane
                    tab={<span><ControlOutlined /> Roles, Permisos y Funciones</span>}
                    key="1"
                >
                    <RolesPermisosFuncionesSection />
                </TabPane>

                <TabPane
                    tab={<span><DollarCircleOutlined /> Límites de Recompensas</span>}
                    key="2"
                >
                    <LimitesRecompensasSection />
                </TabPane>

                <TabPane
                    tab={<span><ApartmentOutlined /> Segmentación</span>}
                    key="3"
                >
                    <SegmentacionSection />
                </TabPane>

                <TabPane
                    tab={<span><FileDoneOutlined /> Criterios de Aprobación</span>}
                    key="4"
                >
                    <CriteriosAprobacionSection />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default PoliticasDashboard;