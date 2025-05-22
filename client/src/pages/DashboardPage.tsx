// client/src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react'; // Añadido useEffect
import { Layout, Menu, Typography, Button, Avatar, Space, Dropdown, theme as antdTheme } from 'antd';
import type { MenuProps } from 'antd';
// IMPORTANTE: Añadir Outlet, useNavigate, useLocation
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; 
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined, 
    SettingOutlined,
    LogoutOutlined, 
    HomeOutlined,
    TeamOutlined,
    ContainerOutlined,
    DownOutlined,      
    KeyOutlined,       
    IdcardOutlined,    
    InfoCircleOutlined 
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext'; 
import logo from '../../public/images/logo_iden2ty_white.png'; 
import '../styles/DashboardPage.css'; 

const { Header, Sider, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const DashboardPage: React.FC = () => {
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    // selectedSiderKey ahora se derivará de la ruta
    const [selectedSiderKey, setSelectedSiderKey] = useState('inicio'); // Default a la sub-ruta 'inicio'
    
    const { token: { colorBgContainer, borderRadiusLG, colorTextSecondary, colorText, colorPrimary } } = antdTheme.useToken();

    const navigate = useNavigate(); // Hook para navegación
    const location = useLocation(); // Hook para obtener la ruta actual

    const siderBackgroundColor = '#263238';
    const headerBackgroundColor = colorBgContainer;
    const contentPageBackgroundColor = '#f0f2f5';

    // Mapeo de keys del menú a rutas relativas
    const menuRouteMapping: { [key: string]: string } = {
        '1': 'inicio',
        '2': 'organizacion',
        '3': 'plantillas',
        '4': 'usuarios',
        '5': 'configuracion',
    };
    
    // Mapeo inverso de rutas a keys del menú
    const routeMenuKeyMapping: { [key: string]: string } = Object.fromEntries(
        Object.entries(menuRouteMapping).map(([key, path]) => [path, key])
    );

    // Sincronizar el menú con la ruta actual
    useEffect(() => {
        const pathSegments = location.pathname.split('/').filter(Boolean); // ej: ['dashboard', 'usuarios']
        const currentSubPath = pathSegments.length > 1 ? pathSegments[1] : 'inicio'; // Default a 'inicio'
        const currentKey = routeMenuKeyMapping[currentSubPath] || '1'; // '1' es la key para 'inicio'
        setSelectedSiderKey(currentKey);
    }, [location.pathname, routeMenuKeyMapping]);


    const menuItemsSider = [
        // Las keys deben coincidir con las usadas en los mapeos si quieres una lógica compleja,
        // o simplemente puedes usar las rutas relativas como keys directamente.
        // Por simplicidad, mantendré tus keys '1' a '5' y usaré el mapeo.
        { key: '1', path: 'inicio', icon: <HomeOutlined />, label: 'Inicio' },
        { key: '2', path: 'organizacion', icon: <TeamOutlined />, label: 'Organización' },
        { key: '3', path: 'plantillas', icon: <ContainerOutlined />, label: 'Plantillas' },
        { key: '4', path: 'usuarios', icon: <UserOutlined />, label: 'Usuarios' }, 
        { key: '5', path: 'configuracion', icon: <SettingOutlined />, label: 'Configuración' },
    ];

    // Modificado para navegar
    const handleSiderMenuSelect = ({ key }: { key: string }) => {
        const targetPath = menuRouteMapping[key] || 'inicio';
        navigate(`/dashboard/${targetPath}`); // Navega a la sub-ruta
        // setSelectedSiderKey(key); // Ya no es necesario aquí, useEffect lo manejará
    };

    const handleUserMenuClick: MenuProps['onClick'] = (e) => {
        if (e.key === 'logout') {
            logout();
        } else if (e.key === 'changePassword') {
            console.log('Acción: Cambiar Contraseña (placeholder)');
        }
    };

    const getInitials = (): string => {
        if (!user) return 'U'; 
        const nameInitial = user.nombre_usuario?.[0]?.toUpperCase() || '';
        const lastNameInitial = user.apellido_paterno?.[0]?.toUpperCase() || '';
        if (nameInitial && lastNameInitial) return `${nameInitial}${lastNameInitial}`;
        if (nameInitial) return nameInitial;
        return 'U'; 
    };
    const userInitials = getInitials();

    const fullNameParts = [];
    if (user?.nombre_usuario) fullNameParts.push(user.nombre_usuario);
    if (user?.apellido_paterno) fullNameParts.push(user.apellido_paterno);
    if (user?.apellido_materno) fullNameParts.push(user.apellido_materno); 
    const displayName = fullNameParts.join(' ').trim() || 'Usuario';

    const userDropdownMenuItems: MenuProps['items'] = [
        {
            key: 'userInfoHeader', type: 'group', label: <Text strong>{displayName}</Text>,
            children: [
                { key: 'userRole', icon: <IdcardOutlined style={{ color: colorTextSecondary }} />, label: <Text type="secondary" style={{ fontSize: '12px' }}>Rol: {user?.rol_usuario || 'No definido'}</Text>, disabled: true, style: { cursor: 'default' } },
                { key: 'userEmail', label: <Text type="secondary" style={{ fontSize: '12px', paddingLeft: '26px' }}>{user?.correo_electronico || 'correo@ejemplo.com'}</Text>, disabled: true, style: { cursor: 'default' } },
                { key: 'userSegment', icon: <InfoCircleOutlined style={{ color: colorTextSecondary }} />, label: <Text type="secondary" style={{ fontSize: '12px' }}>Segmento: {user?.segmento_usuario || 'N/A'}</Text>, disabled: true, style: { cursor: 'default' } },
            ],
        },
        { type: 'divider' },
        { key: 'changePassword', icon: <KeyOutlined />, label: 'Cambiar contraseña' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Cerrar Sesión', danger: true },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={260}
                collapsedWidth={80} 
                style={{ background: siderBackgroundColor, height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}
                className={`custom-sider ${collapsed ? 'collapsed' : ''}`} 
            >
                <div className="logo-sider-header">
                    <img src={logo} alt="Iden2ty Logo" className="sider-logo-img" style={{ height: '80px' /* Ajustado previamente */ }}/>
                    {!collapsed && (
                        <Title level={4} className="sider-logo-text" style={{ color: 'rgba(255, 255, 255, 0.85)', margin: 0, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            Iden2ty
                        </Title>
                    )}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedSiderKey]} // Controlado por el estado derivado de la ruta
                    items={menuItemsSider.map(item => ({ // Solo pasamos las props que Menu espera
                        key: item.key,
                        icon: item.icon,
                        label: item.label,
                    }))}
                    onSelect={handleSiderMenuSelect}
                    className="custom-sider-menu" 
                    style={{ flexGrow: 1, background: 'transparent', borderRight: 0 }}
                />

                <div className="sider-footer">
                    {!collapsed && (
                        <Space direction="vertical" align="start" size="small" className="sider-footer-content">
                            <Text className="sider-footer-text" style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}> 
                                © {new Date().getFullYear()} Iden2ty.
                            </Text>
                            <Text className="sider-footer-text" style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
                                Todos los derechos reservados.
                            </Text>
                        </Space>
                    )}
                </div>
            </Sider>

            <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.25s cubic-bezier(0.645, 0.045, 0.355, 1)', background: contentPageBackgroundColor }}>
                <Header className="dashboard-header" style={{ padding: '0 24px', background: headerBackgroundColor, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)' }}>
                    <Space>
                        <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} className="sider-collapse-button" />
                        <Title level={4} style={{ margin: 0, color: colorText }} className="header-title">
                            {/* El título del Header ahora se basa en la ruta seleccionada */}
                            {menuItemsSider.find(item => item.key === selectedSiderKey)?.label || 'Dashboard'}
                        </Title>
                    </Space>
                    <Space align="center">
                        <Dropdown menu={{ items: userDropdownMenuItems, onClick: handleUserMenuClick }} trigger={['click']} overlayStyle={{ minWidth: '240px' }} >
                            <a onClick={(e) => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0 8px' }}>
                                <Space>
                                    <Avatar style={{ backgroundColor: colorPrimary, verticalAlign: 'middle' }} size="default" >
                                        {userInitials}
                                    </Avatar>
                                    <DownOutlined style={{ fontSize: '10px', color: colorTextSecondary }}/>
                                </Space>
                            </a>
                        </Dropdown>
                    </Space>
                </Header>
                <Content className="dashboard-content" style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                    {/* --- CAMBIO IMPORTANTE AQUÍ: Renderizar el Outlet --- */}
                    <Outlet /> 
                    {/* Ya no necesitas el contenido condicional basado en selectedSiderKey aquí */}
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardPage;