// src/pages/dashboard/OrganizacionDashboard.tsx
import React, { useState } from 'react';
import {
    Typography,
    // Divider, // Ya no lo usamos directamente bajo el título principal
    Space,
    Button,
    Popconfirm,
    Radio,
    message,
    Card,
    Alert,
} from 'antd';
import {
    UserOutlined,
    BankOutlined,
    RetweetOutlined,
    InfoCircleTwoTone,
} from '@ant-design/icons';
import FormularioPersonaFisica from './FormularioPersonaFisica';
import FormularioPersonaMoral from './FormularioPersonaMoral'; // <-- 1. Importar el nuevo formulario

const { Title, Paragraph, Text } = Typography;

type OrganizationType = 'Física' | 'Moral';

const OrganizacionDashboard: React.FC = () => {
    const [selectedOrgType, setSelectedOrgType] = useState<OrganizationType | undefined>(undefined);

    const handleFormularioFisicaSubmit = (values: any) => {
        console.log('Datos recibidos del Formulario Persona Física:', values);
        message.success('Datos de Persona Física listos para ser procesados.');
    };

    // 2. Crear un manejador para el formulario de Persona Moral
    const handleFormularioMoralSubmit = (values: any) => {
        console.log('Datos recibidos del Formulario Persona Moral:', values);
        message.success('Datos de Persona Moral listos para ser procesados.');
    };

    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            boxSizing: 'border-box',
            margin: '0',
            padding: '20px',
            backgroundColor: '#f0f2f5',
        }}>
            <Title level={2} style={{
                marginBottom: 24,
                textAlign: 'center',
                color: '#1D3557',
            }}>
                Gestión de Organización
            </Title>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {!selectedOrgType && (
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 12,
                            boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                            padding: '40px',
                            textAlign: 'center',
                            background: '#fff',
                        }}
                    >
                        <Title level={3} style={{ marginBottom: 32, color: '#1D3557' }}>
                            Seleccione el Tipo de Organización
                        </Title>

                        <Radio.Group
                            buttonStyle="solid"
                            onChange={(e) => setSelectedOrgType(e.target.value)}
                            value={selectedOrgType}
                            style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}
                            size="large"
                        >
                            <Radio.Button
                                value="Física"
                                style={{
                                    padding: '12px 28px',
                                    height: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    borderRadius: 8,
                                    fontWeight: 500,
                                    fontSize: 16,
                                    lineHeight: '24px',
                                    boxShadow: '0 2px 0 rgba(0,0,0,0.043)'
                                }}
                            >
                                <UserOutlined style={{ fontSize: 18 }} />
                                Persona Física
                            </Radio.Button>

                            <Radio.Button
                                value="Moral"
                                style={{
                                    padding: '12px 28px',
                                    height: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    borderRadius: 8,
                                    fontWeight: 500,
                                    fontSize: 16,
                                    lineHeight: '24px',
                                    boxShadow: '0 2px 0 rgba(0,0,0,0.043)'
                                }}
                            >
                                <BankOutlined style={{ fontSize: 18 }} />
                                Persona Moral
                            </Radio.Button>
                        </Radio.Group>
                    </Card>
                )}

                {selectedOrgType && (
                    <Alert
                        message={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Space align="center">
                                    <InfoCircleTwoTone twoToneColor="#1890ff" style={{ fontSize: '20px' }} />
                                    <Text style={{ fontSize: '16px' }}>
                                        Tipo de organización actual: <Text strong style={{ color: '#0052cc', fontSize: '17px' }}>{selectedOrgType}</Text>
                                    </Text>
                                </Space>
                                <Popconfirm
                                    title="¿Estás seguro de cambiar el tipo de organización?"
                                    okText="Sí, cambiar"
                                    cancelText="No"
                                    onConfirm={() => setSelectedOrgType(undefined)}
                                    placement="left"
                                >
                                    <Button
                                        type="link"
                                        icon={<RetweetOutlined />}
                                        size="middle"
                                        style={{ fontWeight: 500 }}
                                    >
                                        Cambiar tipo
                                    </Button>
                                </Popconfirm>
                            </div>
                        }
                        type="info"
                        style={{ marginTop: '24px', borderRadius: '8px', border: '1px solid #91d5ff', background: '#e6f7ff' }}
                    />
                )}

                {selectedOrgType === 'Física' && (
                    <div style={{
                        marginTop: '24px',
                        borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                    }}>
                        <FormularioPersonaFisica onFinish={handleFormularioFisicaSubmit} />
                    </div>
                )}

                {/* 3. y 4. Renderizar FormularioPersonaMoral y aplicar estilo al contenedor */}
                {selectedOrgType === 'Moral' && (
                    <div style={{
                        marginTop: '24px',
                        borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        overflow: 'hidden', // Importante para que el boxShadow funcione bien con el contenido interno
                    }}>
                        <FormularioPersonaMoral onFinish={handleFormularioMoralSubmit} />
                    </div>
                )}
            </Space>
        </div>
    );
};

export default OrganizacionDashboard;