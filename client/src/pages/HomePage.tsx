// src/pages/HomePage.tsx
import React from 'react';
import { Button, Space, Typography } from 'antd';
import { MenuOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // <--- Importar useNavigate
import '../styles/HomePage.css';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
    const navigate = useNavigate(); // <--- Hook para la navegación

    const handleLoginClick = () => {
        navigate('/login'); // <--- Navegar a la ruta /login
    };

    return (
        <div className="homepage-layout">
        <header className="top-bar">
            <div className="logo-area">
            <img src="../../public/images/logo_iden2ty.png" alt="Iden2ty Logo" className="logo-image" />
            </div>
            <div className="actions-area">
            <Space>
                <Button
                type="primary"
                ghost
                className="login-button"
                onClick={handleLoginClick} // <--- Manejador de clic
                >
                Iniciar Sesión
                </Button>
                <Button type="text" icon={<MenuOutlined className="menu-icon" />} />
            </Space>
            </div>
        </header>

        <main className="main-page-content">
            <div className="hero-content-area">
            <Title level={1} className="main-title">
                Iden2ty, la plataforma de <br /> gestión de encuestados
            </Title>
            <Paragraph className="subtitle">
                Con Iden2ty for Market Research, su organización logrará simplificar la gestión de encuestados,
                incentivos y proyectos de investigación.
            </Paragraph>
            <Button
                type="primary"
                size="large"
                icon={<SendOutlined />}
                className="contact-button"
            >
                Contáctenos
            </Button>
            </div>
        </main>
        </div>
    );
};

export default HomePage;