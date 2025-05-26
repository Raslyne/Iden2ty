// client/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Form, Input, Button, Typography, Row, Col, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext'; // <--- Importa useAuth
import axios from 'axios';
// import { useNavigate } from 'react-router-dom'; // useNavigate ya está en AuthContext
import '../styles/LoginPage.css';
import { API_URL } from '../config';

const { Text, Link: AntLink } = Typography;

interface LoginFormData {
    email: string;
    password_usuario: string; // Ajusta si el backend espera 'password' o 'password_usuario'
    }

    const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth(); // <--- Obtén la función login del contexto
    // const navigate = useNavigate(); // No es necesario aquí si login() del contexto ya redirige

    const onFinish = async (values: LoginFormData) => {
        setLoading(true);
        try {
            // El backend espera 'correo_electronico' y 'password_usuario'
            const API_URL = import.meta.env.VITE_API_URL;

            const response = await axios.post(`${API_URL}/auth/login`, {
                correo_electronico: values.email,
                password_usuario: values.password_usuario,
            });

            if (response.data.success) {
                message.success('¡Inicio de sesión exitoso!');
                // La función login del AuthContext se encargará de:
                // 1. Guardar token y usuario en localStorage
                // 2. Actualizar el estado del contexto
                // 3. Configurar axios defaults
                // 4. Redirigir
                login(response.data.token, response.data.usuario);
            } else {
                // Aunque el backend debería devolver errores con status codes,
                // si siempre devuelve 200 con success: false, manejamos el mensaje aquí.
                message.error(response.data.message || 'Error en el inicio de sesión.');
            }
        } catch (error: any) {
            console.error('Error en el login:', error);
            if (axios.isAxiosError(error) && error.response) {
                // El backend respondió con un código de error (4xx, 5xx)
                message.error(error.response.data.message || 'Ocurrió un error. Inténtalo de nuevo.');
            } else {
                // Otro tipo de error (red, etc.)
                message.error('No se pudo conectar al servidor. Verifica tu conexión.');
            }
        } finally {
        setLoading(false);
        }
    };

    return (
        <Row className="login-page-container" align="middle" justify="center">
            <Col xs={24} sm={24} md={12} lg={10} xl={8} className="login-form-section">
                <div className="login-form-wrapper">
                <div className="login-logo-area">
                    <img src="/images/logo_iden2ty.png" alt="Iden2ty Logo" className="login-logo-image" />
                </div>

                <Form
                    name="login_form"
                    onFinish={onFinish}
                    layout="vertical"
                    requiredMark={false}
                >
                    <Form.Item
                    name="email" // Ant Design pasará esto como values.email
                    label="Email"
                    rules={[
                        { required: true, message: 'Por favor, ingresa tu email.' },
                        { type: 'email', message: 'El email ingresado no es válido.' },
                    ]}
                    >
                    <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
                    </Form.Item>

                    <Form.Item
                    name="password_usuario" // Cambiado para que coincida con lo que el backend espera (o lo que envías en la petición)
                                        // Si el campo en el backend es 'password', ajusta aquí o en la petición.
                                        // El backend espera `password_usuario` en el cuerpo.
                    label="Contraseña"
                    rules={[{ required: true, message: 'Por favor, ingresa tu contraseña.' }]}
                    >
                    <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" size="large" />
                    </Form.Item>

                    <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button" block size="large" loading={loading}>
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
            <Col xs={0} sm={0} md={12} lg={14} xl={16} className="login-banner-section">
                <img src="../../public/images/blue-geometric-fo3um3hn07elucmn.jpg" alt="Login Banner" className="login-banner-image" />
            </Col>
        </Row>
    );
};

export default LoginPage;