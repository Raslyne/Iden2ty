import React, { useEffect, useState } from 'react';
import {
    Typography,
    Space,
    Button,
    Popconfirm,
    Radio,
    message,
    Card,
    Alert,
    Descriptions,
} from 'antd';
import {
    UserOutlined,
    BankOutlined,
    RetweetOutlined,
    InfoCircleTwoTone,
} from '@ant-design/icons';
import FormularioPersonaFisica from './FormularioPersonaFisica';
import FormularioPersonaMoral from './FormularioPersonaMoral';
import { useAuth } from '../../context/AuthContext'; // Ajusta si es necesario

const { Title, Text } = Typography;

type OrganizationType = 'Física' | 'Moral';

const OrganizacionDashboard: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [selectedOrgType, setSelectedOrgType] = useState<OrganizationType | undefined>(undefined);
    const [datosOrganizacion, setDatosOrganizacion] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("[OrganizacionDashboard useEffect] Estado actual:");
        console.log("  isLoading:", isLoading);
        console.log("  isAuthenticated:", isAuthenticated);
        console.log("  user:", user);

        if (isLoading) return;

        if (!user || !user.organizacion?.id_organizacion) {
            console.warn("[OrganizacionDashboard useEffect] Usuario no autenticado o datos de usuario no disponibles.");
            return;
        }

        const idOrganizacion = user.organizacion.id_organizacion;

        console.log("Consultando organización con ID:", idOrganizacion);

        fetch(`http://localhost:3000/api/v1/organizaciones/mi-organizacion/${idOrganizacion}`)
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    console.error("Error al obtener organización:", data);
                    return;
                }

                console.log("Organización encontrada:", data);
                setSelectedOrgType(data.tipo);
                setDatosOrganizacion(data);
            })
            .catch((err) => {
                console.error("Fallo en el fetch:", err);
            })
            .finally(() => setLoading(false));
    }, [user, isLoading]);

    const handleFormularioFisicaSubmit = async (values: any) => {
        try {
            const payload = {
                id_organizacion: user.organizacion.id_organizacion,
                ...values
            };

            console.log("📦 Payload enviado al backend:", payload);

            const res = await fetch('http://localhost:3000/api/v1/organizaciones/fisica', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                message.success('✅ Persona Física registrada con éxito');
                setSelectedOrgType('Física');
                setDatosOrganizacion({ tipo: 'Física', datos: payload, documentos: {} });
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        } catch (error: any) {
            console.error("❌ Error al registrar persona física:", error);
            message.error(`Error: ${error.message}`);
        }
    };


    const handleFormularioMoralSubmit = async (values: any) => {
        try {
            const payload = {
                id_organizacion: user.organizacion.id_organizacion,
                ...values
            };
            const res = await fetch('http://localhost:3000/api/v1/organizaciones/moral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                message.success('Persona Moral registrada con éxito');
                setSelectedOrgType('Moral');
                setDatosOrganizacion({ tipo: 'Moral', datos: payload, documentos: {} });
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        } catch (error: any) {
            message.error(`Error: ${error.message}`);
        }
    };

    const renderDocumentos = () => {
        const documentos = datosOrganizacion?.documentos;
        if (!documentos) return <Text type="secondary">No hay documentos disponibles.</Text>;

        return (
            <Descriptions column={1} size="small" bordered>
                {documentos.ruta_dni_representante && (
                    <Descriptions.Item label="DNI del Representante">
                        <a href={documentos.ruta_dni_representante} target="_blank" rel="noopener noreferrer">Ver documento</a>
                    </Descriptions.Item>
                )}
                {documentos.ruta_comprobante_domicilio && (
                    <Descriptions.Item label="Comprobante de Domicilio">
                        <a href={documentos.ruta_comprobante_domicilio} target="_blank" rel="noopener noreferrer">Ver documento</a>
                    </Descriptions.Item>
                )}
                {documentos.ruta_constancia_situacion_fiscal && (
                    <Descriptions.Item label="Constancia Situación Fiscal">
                        <a href={documentos.ruta_constancia_situacion_fiscal} target="_blank" rel="noopener noreferrer">Ver documento</a>
                    </Descriptions.Item>
                )}
                {documentos.ruta_acta_constitutiva && (
                    <Descriptions.Item label="Acta Constitutiva">
                        <a href={documentos.ruta_acta_constitutiva} target="_blank" rel="noopener noreferrer">Ver documento</a>
                    </Descriptions.Item>
                )}
            </Descriptions>
        );
    };

    return (
        <div style={{ width: '100%', minHeight: '100vh', padding: '20px', backgroundColor: '#f0f2f5' }}>
            <Title level={2} style={{ textAlign: 'center', color: '#1D3557' }}>
                Gestión de Organización
            </Title>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {!loading && datosOrganizacion ? (
                    <>
                        <Alert
                            message={
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Space align="center">
                                        <InfoCircleTwoTone twoToneColor="#1890ff" style={{ fontSize: '20px' }} />
                                        <Text>
                                            Tipo de organización: <Text strong>{selectedOrgType}</Text>
                                        </Text>
                                    </Space>
                                    <Popconfirm
                                        title="¿Estás seguro de cambiar el tipo de organización?"
                                        okText="Sí, cambiar"
                                        cancelText="No"
                                        onConfirm={() => {
                                            setSelectedOrgType(undefined);
                                            setDatosOrganizacion(null);
                                        }}
                                        placement="left"
                                    >
                                        <Button type="link" icon={<RetweetOutlined />}>Cambiar tipo</Button>
                                    </Popconfirm>
                                </div>
                            }
                            type="info"
                            showIcon
                        />
                        <Card title="Documentos de la Organización" style={{ marginTop: 24 }}>
                            {renderDocumentos()}
                        </Card>
                    </>
                ) : (
                    <>
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
                                    <Radio.Button value="Física">
                                        <UserOutlined style={{ marginRight: 8 }} />
                                        Persona Física
                                    </Radio.Button>
                                    <Radio.Button value="Moral">
                                        <BankOutlined style={{ marginRight: 8 }} />
                                        Persona Moral
                                    </Radio.Button>
                                </Radio.Group>
                            </Card>
                        )}

                        {selectedOrgType === 'Física' && (
                            <div style={{ marginTop: 24, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                                <FormularioPersonaFisica onFinish={handleFormularioFisicaSubmit} />
                            </div>
                        )}

                        {selectedOrgType === 'Moral' && (
                            <div style={{ marginTop: 24, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                                <FormularioPersonaMoral onFinish={handleFormularioMoralSubmit} />
                            </div>
                        )}
                    </>
                )}
            </Space>
        </div>
    );
};

export default OrganizacionDashboard;
