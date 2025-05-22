// src/pages/dashboard/FormularioPersonaFisica.tsx
import React from 'react';
import {
    Form,
    Input,
    DatePicker,
    Select,
    Upload,
    Button,
    Row,
    Col,
    Typography,
    message,
    Tooltip,
    Tabs,
} from 'antd';
import {
    UploadOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined,
    IdcardOutlined,
    BankOutlined,
    InfoCircleOutlined,
    SaveOutlined,
    SolutionOutlined, // Icono para Información Fiscal
    AuditOutlined,    // Icono para Documentos
    TeamOutlined,     // Icono para Información Personal
    EnvironmentOutlined, // Icono para Dirección
    ContactsOutlined,  // Icono para Contacto
    GiftOutlined,      // Icono para Recompensas
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface FormularioPersonaFisicaProps {
    onFinish?: (values: any) => void;
    initialValues?: any;
}

const FormularioPersonaFisica: React.FC<FormularioPersonaFisicaProps> = ({
    onFinish,
    initialValues,
}) => {
    const [form] = Form.useForm();

    const onFormFinish = (values: any) => {
        const processedValues = {
            ...values,
            fecha_nacimiento_representante: values.fecha_nacimiento_representante
                ? values.fecha_nacimiento_representante.format('YYYY-MM-DD')
                : null,
            fecha_expiracion_documento_representante: values.fecha_expiracion_documento_representante
                ? values.fecha_expiracion_documento_representante.format('YYYY-MM-DD')
                : null,
        };
        console.log('Valores del formulario Persona Física procesados:', processedValues);
        if (onFinish) {
            onFinish(processedValues);
        }
        message.success('Formulario guardado con éxito!');
    };

    const uploadProps = {
        name: 'file',
        action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info: any) {
            if (info.file.status === 'done') {
                message.success(`${info.file.name} archivo subido exitosamente.`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} error al subir archivo.`);
            }
        },
        maxCount: 1,
    };

    const commonInputStyle: React.CSSProperties = {
        // Se mantiene vacío, usando los estilos por defecto de Ant Design
        // que son limpios y consistentes.
    };

    return (
        // El <Form> envuelve todo el componente Tabs.
        // Su padding de '24px' define el espacio interno alrededor de todo el contenido del formulario.
        <Form
            form={form}
            layout="vertical"
            onFinish={onFormFinish}
            initialValues={initialValues}
            style={{ width: '100%', background: '#fff', padding: '24px' }}
        >
            <Title
                level={2}
                style={{
                    textAlign: 'center',
                    marginBottom: '32px',
                    color: '#1D3557', // Azul oscuro corporativo
                }}
            >
                Registro de Persona Física
            </Title>

            <Tabs tabPosition="left" defaultActiveKey="1" style={{ minHeight: '600px' }}>
                <TabPane
                    tab={<span><SolutionOutlined /> Información Fiscal</span>}
                    key="1"
                >
                    <Title level={4} style={{ marginBottom: '24px', color: '#457B9D' }}>Detalles Fiscales</Title>
                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="rfc"
                                label="RFC"
                                rules={[
                                    { required: true, message: 'Por favor, ingresa el RFC.' },
                                    { len: 13, message: 'El RFC debe tener 13 caracteres para persona física.' }
                                ]}
                            >
                                <Input prefix={<IdcardOutlined />} placeholder="RFC con Homoclave" style={commonInputStyle} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="regimen_fiscal"
                                label="Régimen Fiscal"
                                rules={[{ required: true, message: 'Por favor, selecciona el régimen fiscal.' }]}
                            >
                                <Select placeholder="Selecciona régimen" allowClear style={commonInputStyle}>
                                    <Option value="605">Sueldos y Salarios e Ingresos Asimilados a Salarios</Option>
                                    <Option value="612">Personas Físicas con Actividades Empresariales y Profesionales</Option>
                                    <Option value="614">Ingresos por Plataformas Tecnológicas</Option>
                                    <Option value="626">Régimen Simplificado de Confianza (RESICO)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="clabe"
                                label="CLABE Interbancaria (Opcional)"
                                rules={[
                                    { len: 18, message: 'La CLABE debe tener 18 dígitos.' },
                                    { pattern: /^[0-9]+$/, message: 'La CLABE solo debe contener números.' },
                                ]}
                            >
                                <Input prefix={<BankOutlined />} placeholder="18 dígitos" style={commonInputStyle} />
                            </Form.Item>
                        </Col>
                    </Row>
                </TabPane>

                <TabPane
                    tab={<span><TeamOutlined /> Información Personal</span>}
                    key="2"
                >
                    <Title level={4} style={{ marginBottom: '24px', color: '#457B9D' }}>Datos Personales</Title>
                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="nombre_representante"
                                label="Nombre(s)"
                                rules={[{ required: true, message: 'Por favor, ingresa el nombre.' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Nombre(s) de la persona" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="apellido_paterno_representante"
                                label="Apellido Paterno"
                                rules={[{ required: true, message: 'Por favor, ingresa el apellido paterno.' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Apellido Paterno" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="apellido_materno_representante" label="Apellido Materno (Opcional)">
                                <Input prefix={<UserOutlined />} placeholder="Apellido Materno" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="fecha_nacimiento_representante"
                                label="Fecha de Nacimiento"
                                rules={[{ required: true, message: 'Por favor, selecciona la fecha.' }]}
                            >
                                <DatePicker style={{ width: '100%', ...commonInputStyle }} placeholder="Selecciona fecha" format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="estado_civil_representante" label="Estado Civil (Opcional)">
                                <Select placeholder="Selecciona estado civil" allowClear style={commonInputStyle}>
                                    <Option value="Soltero(a)">Soltero(a)</Option>
                                    <Option value="Casado(a)">Casado(a)</Option>
                                    <Option value="Divorciado(a)">Divorciado(a)</Option>
                                    <Option value="Viudo(a)">Viudo(a)</Option>
                                    <Option value="Union Libre">Unión Libre</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="curp_representante"
                                label="CURP"
                                rules={[
                                    { required: true, message: 'Por favor, ingresa la CURP.' },
                                    { pattern: /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/, message: 'Formato de CURP inválido.'}
                                ]}
                            >
                                <Input prefix={<IdcardOutlined />} placeholder="CURP de 18 caracteres" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="tipo_documento_representante"
                                label="Tipo de Documento de Identificación"
                                rules={[{ required: true, message: 'Por favor, selecciona el tipo.' }]}
                            >
                                <Select placeholder="Ej: INE, Pasaporte" allowClear style={commonInputStyle}>
                                    <Option value="INE">INE/IFE</Option>
                                    <Option value="Pasaporte">Pasaporte</Option>
                                    <Option value="Cedula Profesional">Cédula Profesional</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="numero_documento_representante"
                                label="Número de Documento"
                                rules={[{ required: true, message: 'Ingresa el número de documento.' }]}
                            >
                                <Input prefix={<IdcardOutlined />} placeholder="Número del documento" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="fecha_expiracion_documento_representante"
                                label="Expiración del Documento (Opc.)"
                            >
                                <DatePicker style={{ width: '100%', ...commonInputStyle}} placeholder="Selecciona fecha" format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="dni_representante_file"
                        label={
                            <span>
                                DNI / Identificación Oficial (Archivo)&nbsp;
                                <Tooltip title="Sube el anverso y reverso de tu identificación en un solo archivo PDF si es posible.">
                                    <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                </Tooltip>
                            </span>
                        }
                        rules={[{ required: true, message: 'Por favor, sube tu identificación.' }]}
                        extra="Sube aquí tu INE/IFE, Pasaporte, etc. (PDF, JPG, PNG)"
                    >
                        <Upload {...uploadProps} accept=".pdf,.jpg,.jpeg,.png">
                            <Button icon={<UploadOutlined />}>Seleccionar Archivo</Button>
                        </Upload>
                    </Form.Item>
                </TabPane>

                <TabPane
                    tab={<span><EnvironmentOutlined /> Dirección Fiscal</span>}
                    key="3"
                >
                    <Title level={4} style={{ marginBottom: '24px', color: '#457B9D' }}>Ubicación Fiscal</Title>
                     <Row gutter={24}>
                        <Col xs={24} sm={12} md={10}>
                            <Form.Item name="calle" label="Calle" rules={[{ required: true, message: 'Ingresa la calle.' }]}>
                                <Input prefix={<HomeOutlined />} placeholder="Nombre de la calle" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <Form.Item name="no_exterior" label="No. Exterior" rules={[{ required: true, message: 'Ingresa el No. Ext.' }]}>
                                <Input placeholder="No. Ext." style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <Form.Item name="no_interior" label="No. Interior">
                                <Input placeholder="No. Int." style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="codigo_postal" label="Código Postal" rules={[{ required: true, message: 'Ingresa el C.P.' }]}>
                                <Input prefix={<MailOutlined />} placeholder="C.P." style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="colonia" label="Colonia" rules={[{ required: true, message: 'Ingresa la colonia.' }]}>
                                <Input placeholder="Colonia" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="ciudad" label="Ciudad / Municipio" rules={[{ required: true, message: 'Ingresa la ciudad o municipio.' }]}>
                                <Input placeholder="Ciudad / Municipio" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="estado" label="Estado" rules={[{ required: true, message: 'Ingresa el estado.' }]}>
                                <Input placeholder="Estado" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="pais" label="País" initialValue="México" rules={[{ required: true, message: 'Ingresa el país.' }]}>
                                <Input placeholder="País" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                    </Row>
                </TabPane>

                <TabPane
                    tab={<span><ContactsOutlined /> Información de Contacto</span>}
                    key="4"
                >
                    <Title level={4} style={{ marginBottom: '24px', color: '#457B9D' }}>Datos de Contacto</Title>
                    <Row gutter={24}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="correo_electronico"
                                label="Correo Electrónico de Contacto"
                                rules={[
                                    { required: true, message: 'Por favor, ingresa el correo electrónico.' },
                                    { type: 'email', message: 'El formato del correo no es válido.' },
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="correo@ejemplo.com" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="numero_telefonico"
                                label="Número Telefónico de Contacto"
                                rules={[
                                    { pattern: /^[0-9+\-\s()ext.EXT]+$/, message: 'Número de teléfono inválido.' },
                                ]}
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="Ej. +52 55 1234 5678" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                    </Row>
                </TabPane>
                
                <TabPane
                    tab={<span><GiftOutlined /> Recompensas</span>}
                    key="5"
                >
                    <Title level={4} style={{ marginBottom: '24px', color: '#457B9D' }}>Programa de Recompensas</Title>
                    <Paragraph style={{ fontStyle: 'italic', color: '#6c757d' }}>
                        Esta sección se encuentra en desarrollo. ¡Próximamente más detalles sobre cómo podrás ser recompensado!
                    </Paragraph>
                </TabPane>

                <TabPane
                    tab={<span><AuditOutlined /> Documentos Adicionales</span>}
                    key="6"
                >
                    <Title level={4} style={{ marginBottom: '24px', color: '#457B9D' }}>Carga de Documentación</Title>
                     <Row gutter={24}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="comprobante_domicilio_file"
                                label={
                                    <span>
                                        Comprobante de Domicilio&nbsp;
                                        <Tooltip title="No mayor a 3 meses (ej. CFE, agua, teléfono).">
                                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                        </Tooltip>
                                    </span>
                                }
                                rules={[{ required: true, message: 'Sube el comprobante de domicilio.' }]}
                                extra="PDF, JPG, PNG. No mayor a 3 meses."
                            >
                                <Upload {...uploadProps} accept=".pdf,.jpg,.jpeg,.png">
                                    <Button icon={<UploadOutlined />}>Seleccionar Archivo</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="constancia_situacion_fiscal_file"
                                label={
                                    <span>
                                        Constancia de Situación Fiscal&nbsp;
                                        <Tooltip title="Emitida por el SAT, asegúrate que sea reciente.">
                                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                        </Tooltip>
                                    </span>
                                }
                                rules={[{ required: true, message: 'Sube la constancia de situación fiscal.' }]}
                                extra="PDF, JPG, PNG. Emitida por el SAT."
                            >
                                <Upload {...uploadProps} accept=".pdf,.jpg,.jpeg,.png">
                                    <Button icon={<UploadOutlined />}>Seleccionar Archivo</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </TabPane>
            </Tabs>

            {/* MODIFICACIÓN: Ajuste en paddingRight para alineación con el padding general del Form */}
            <Form.Item style={{ textAlign: 'right', marginTop: '32px', paddingRight: '0px' }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SaveOutlined />}
                    style={{
                        backgroundColor: '#E63946', // Un rojo coral para el botón de acción
                        borderColor: '#E63946',
                        minWidth: '180px',
                    }}
                >
                    Guardar Todo
                </Button>
            </Form.Item>
        </Form>
    );
};

export default FormularioPersonaFisica;