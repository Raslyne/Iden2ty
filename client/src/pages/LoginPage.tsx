// src/pages/LoginPage.tsx
import React, { useState } from 'react'; // Añadimos useState
import { Form, Input, Button, Typography, Row, Col, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import '../styles/LoginPage.css'; // Crearemos este archivo CSS a continuación

const { Text, Link: AntLink } = Typography; // Renombramos Link para evitar conflicto con react-router-dom si se usara

const LoginPage: React.FC = () => {
    const onFinish = (values: any) => {
        console.log('Valores del formulario: ', values);
        // Aquí manejarías la lógica de inicio de sesión
    };

    return (
        <Row className="login-page-container" align="middle" justify="center">
        {/* Columna Izquierda: Formulario de Login */}
        <Col xs={24} sm={24} md={12} lg={10} xl={8} className="login-form-section">
            <div className="login-form-wrapper">
            <div className="login-logo-area">
                <img src="../../public/images/logo_iden2ty.png" alt="Iden2ty Logo" className="login-logo-image" />
            </div>

            <Form
                name="login_form"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
                requiredMark={false}
            >
                <Form.Item
                name="email"
                label="Email"
                rules={[
                    { required: true, message: 'Por favor, ingresa tu email.' },
                    { type: 'email', message: 'El email ingresado no es válido.' },
                ]}
                >
                <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" size="large" />
                </Form.Item>

                <Form.Item
                name="password"
                label="Contraseña"
                rules={[{ required: true, message: 'Por favor, ingresa tu contraseña.' }]}
                >
                <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Contraseña" size="large" />
                </Form.Item>

                <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button" block size="large">
                    Iniciar Sesión
                </Button>
                </Form.Item>
            </Form>
            <div className="signup-prompt">
                <Text>¿Aún no has dado de alta tu organización? </Text>
                <AntLink href="#contact" className="contact-link">Contáctanos</AntLink>
            </div>
            </div>
        </Col>

        {/* Columna Derecha: Banner */}
        <Col xs={0} sm={0} md={12} lg={14} xl={16} className="login-banner-section">
            {/* Puedes usar una etiqueta img si tienes una URL o un componente si es un SVG complejo */}
            <img src="../../public/images/004_lorem.jpg" alt="Login Banner" className="login-banner-image" />
            {/* He usado un placeholder. Reemplaza 'login-banner-placeholder.svg' con la ruta a tu imagen.
                Si no tienes una imagen, puedes comentar la línea de arriba y la sección se mostrará con su color de fondo.
                Podemos crear un SVG simple como placeholder si lo necesitas. */}
        </Col>
        </Row>
    );
};

export default LoginPage;