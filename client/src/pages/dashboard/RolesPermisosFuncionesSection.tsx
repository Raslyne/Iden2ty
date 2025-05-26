// client/src/pages/dashboard/RolesPermisosFuncionesSection.tsx
import React from 'react';
import { Typography, List } from 'antd';
import {
    CopyOutlined,
    UserOutlined,
    ProjectOutlined,
    TeamOutlined,
    GiftOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const rolesSubItemsData = [ // Movido aquí, ya que es específico de esta sección
    { icon: <CopyOutlined />, text: 'Plantillas' },
    { icon: <UserOutlined />, text: 'Usuarios' },
    { icon: <ProjectOutlined />, text: 'Proyectos' },
    { icon: <TeamOutlined />, text: 'Encuestados' },
    { icon: <GiftOutlined />, text: 'Recompensas (Sub-item)' } // Aclarado nombre
];

const RolesPermisosFuncionesSection: React.FC = () => {
    return (
        <>
            <Title level={4} style={{ marginBottom: '16px' }}>Gestión de Roles, Permisos y Funciones</Title>
            <Paragraph>
                Define y administra los diferentes niveles de acceso y capacidades dentro del sistema.
            </Paragraph>
            <List
                itemLayout="horizontal"
                dataSource={rolesSubItemsData}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={item.icon}
                            title={<a href="#">{item.text}</a>} // Placeholder href
                            description={`Configurar y administrar ${item.text.toLowerCase()}.`}
                        />
                    </List.Item>
                )}
                style={{ marginTop: '20px' }}
            />
            {/* Futuro contenido o lógica específica para esta sección irá aquí */}
        </>
    );
};

export default RolesPermisosFuncionesSection;