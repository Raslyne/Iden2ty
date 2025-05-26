// src/pages/dashboard/FormularioPersonaMoral.tsx
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
    IdcardOutlined,
    BankOutlined,
    InfoCircleOutlined,
    SaveOutlined,
    AuditOutlined,    // Icono para Documentos
    ContactsOutlined,  // Icono para Contacto
    GiftOutlined,      // Icono para Recompensas
    GlobalOutlined,    // Icono para Página Web / País
    BookOutlined,      // Icono para Régimen Fiscal / Acta / Registro Público
    SolutionOutlined,  // Icono para Representante Legal
    NumberOutlined,    // Icono para No. Notaría
    HomeOutlined,      // Icono para Ciudad/Estado
    BuildOutlined,     // Icono para Información Fiscal de la Empresa
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface FormularioPersonaMoralProps {
    onFinish?: (values: any) => void;
    initialValues?: any;
}

const FormularioPersonaMoral: React.FC<FormularioPersonaMoralProps> = ({
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
            // Simulación de rutas de archivos subidos
            dni_representante_file: '/uploads/dni_simulado.pdf',
            comprobante_domicilio_file: '/uploads/comprobante_simulado.pdf',
            constancia_situacion_fiscal_file: '/uploads/situacion_simulada.pdf',
            acta_constitutiva_file: '/uploads/acta_simulada.pdf'
        };

        console.log('✔️ Valores del formulario Persona Moral procesados:', processedValues);

        if (onFinish) {
            onFinish(processedValues);
        }

        message.success('Formulario guardado con éxito!');
    };

    const uploadProps = {
        name: 'file',
        action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload', // URL de ejemplo para carga
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
    
    const commonInputStyle: React.CSSProperties = {}; // Estilos comunes si se necesitan

    return (
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
                    color: '#1D3557',
                }}
            >
                Registro de Persona Moral
            </Title>

            <Tabs tabPosition="left" defaultActiveKey="1" style={{ minHeight: '700px' /* Ajusta según sea necesario */ }}>
                <TabPane
                    tab={<span><BuildOutlined /> Información Fiscal</span>}
                    key="1"
                >
                    <Title level={4} style={{ marginBottom: '24px', color: '#457B9D' }}>Datos Fiscales de la Empresa</Title>
                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={16}>
                            <Form.Item
                                name="razon_social"
                                label="Razón Social"
                                rules={[{ required: true, message: 'Por favor, ingresa la razón social.' }]}
                            >
                                <Input placeholder="Nombre legal completo de la empresa" style={commonInputStyle} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="rfc_empresa"
                                label="RFC de la Empresa"
                                rules={[
                                    { required: true, message: 'Por favor, ingresa el RFC de la empresa.' },
                                    { len: 12, message: 'El RFC de persona moral debe tener 12 caracteres.' }
                                ]}
                            >
                                <Input prefix={<IdcardOutlined />} placeholder="RFC (12 caracteres)" style={commonInputStyle} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="nombre_comercial"
                                label="Nombre Comercial (Opcional)"
                            >
                                <Input placeholder="Nombre con el que se conoce a la empresa" style={commonInputStyle} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="pagina_web"
                                label="Página Web (Opcional)"
                                rules={[{ type: 'url', message: 'Por favor, ingresa una URL válida.' }]}
                            >
                                <Input prefix={<GlobalOutlined />} placeholder="https://www.ejemplo.com" style={commonInputStyle} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="fecha_registro_empresa"
                                label="Fecha de Registro"
                                rules={[{ required: true, message: 'Por favor, selecciona la fecha de registro.' }]}
                            >
                                <DatePicker style={{ width: '100%' }} placeholder="Selecciona fecha" format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="clabe_empresa"
                                label="CLABE Interbancaria (Opcional)"
                                rules={[
                                    { len: 18, message: 'La CLABE debe tener 18 dígitos.' },
                                    { pattern: /^[0-9]+$/, message: 'La CLABE solo debe contener números.' },
                                ]}
                            >
                                <Input prefix={<BankOutlined />} placeholder="18 dígitos" style={commonInputStyle} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="banco_empresa"
                                label="Banco (Opcional)"
                            >
                                <Input placeholder="Nombre del banco" style={commonInputStyle} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="regimen_fiscal_empresa"
                                label="Régimen Fiscal"
                                rules={[{ required: true, message: 'Por favor, selecciona el régimen fiscal.' }]}
                            >
                                <Select placeholder="Selecciona régimen" allowClear style={commonInputStyle}>
                                    <Option value="601">General de Ley Personas Morales</Option>
                                    <Option value="603">Personas Morales con Fines no Lucrativos</Option>
                                    <Option value="626">Régimen Simplificado de Confianza (RESICO PM)</Option>
                                    {/* ... otros regímenes para PM ... */}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="numero_notaria"
                                label="No. de Notaría (Opcional)"
                            >
                                <Input prefix={<NumberOutlined />} placeholder="Número de notaría" style={commonInputStyle} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={16}>
                            <Form.Item
                                name="registro_publico"
                                label="Datos de Registro Público (Opcional)"
                            >
                                <Input prefix={<BookOutlined />} placeholder="Folio Mercantil, etc." style={commonInputStyle} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="pais_empresa"
                                label="País"
                                initialValue="México"
                                rules={[{ required: true, message: 'Por favor, ingresa el país.' }]}
                            >
                                <Input prefix={<GlobalOutlined />} placeholder="País de la empresa" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="estado_empresa"
                                label="Estado"
                                rules={[{ required: true, message: 'Por favor, ingresa el estado.' }]}
                            >
                                <Input prefix={<HomeOutlined />} placeholder="Estado" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="ciudad_empresa"
                                label="Ciudad"
                                rules={[{ required: true, message: 'Por favor, ingresa la ciudad.' }]}
                            >
                                <Input prefix={<HomeOutlined />} placeholder="Ciudad" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                    </Row>
                </TabPane>

                <TabPane
                    tab={<span><SolutionOutlined /> Representante Legal</span>}
                    key="2"
                >
                    <Title level={4} style={{ marginBottom: '24px', color: '#457B9D' }}>Datos del Representante Legal</Title>
                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="nombre_representante"
                                label="Nombre(s)"
                                rules={[{ required: true, message: 'Por favor, ingresa el nombre del representante.' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Nombre(s)" style={commonInputStyle}/>
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
                                rules={[{ required: true, message: 'Por favor, selecciona la fecha de nacimiento.' }]}
                            >
                                <DatePicker style={{ width: '100%' }} placeholder="Selecciona fecha" format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="tipo_documento_representante"
                                label="Tipo de Documento Oficial"
                                rules={[{ required: true, message: 'Por favor, selecciona el tipo de documento.' }]}
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
                                label="Número de Documento Oficial"
                                rules={[{ required: true, message: 'Ingresa el número de documento.' }]}
                            >
                                <Input prefix={<IdcardOutlined />} placeholder="Número del documento" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="fecha_expiracion_documento_representante"
                                label="Expiración del Documento (Opc.)"
                            >
                                <DatePicker style={{ width: '100%'}} placeholder="Selecciona fecha" format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="rfc_representante"
                                label="RFC del Representante"
                                rules={[
                                    { required: true, message: 'Por favor, ingresa el RFC del representante.' },
                                    { len: 13, message: 'El RFC de persona física debe tener 13 caracteres.' }
                                ]}
                            >
                                <Input prefix={<IdcardOutlined />} placeholder="RFC (13 caracteres)" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="curp_representante"
                                label="CURP del Representante"
                                rules={[
                                    { required: true, message: 'Por favor, ingresa la CURP del representante.' },
                                    { pattern: /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/, message: 'Formato de CURP inválido.'}
                                ]}
                            >
                                <Input prefix={<IdcardOutlined />} placeholder="CURP (18 caracteres)" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="dni_representante_legal_file" // Campo específico para el DNI en esta sección
                        label={
                            <span>
                                DNI del Representante Legal (Archivo)&nbsp;
                                <Tooltip title="Sube el anverso y reverso de la identificación del representante.">
                                    <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                </Tooltip>
                            </span>
                        }
                        rules={[{ required: true, message: 'Por favor, sube la identificación del representante.' }]}
                        extra="INE/IFE, Pasaporte, etc. (PDF, JPG, PNG)"
                    >
                        <Upload {...uploadProps} accept=".pdf,.jpg,.jpeg,.png">
                            <Button icon={<UploadOutlined />}>Seleccionar Archivo</Button>
                        </Upload>
                    </Form.Item>
                </TabPane>

                <TabPane
                    tab={<span><ContactsOutlined /> Contacto de la Empresa</span>}
                    key="3"
                >
                    <Title level={4} style={{ marginBottom: '24px', color: '#457B9D' }}>Datos de Contacto</Title>
                    <Row gutter={24}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="correo_electronico_empresa"
                                label="Correo Electrónico de la Empresa"
                                rules={[
                                    { required: true, message: 'Por favor, ingresa el correo electrónico.' },
                                    { type: 'email', message: 'El formato del correo no es válido.' },
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="contacto@empresa.com" style={commonInputStyle}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="numero_telefonico_empresa"
                                label="Número Telefónico de la Empresa"
                                rules={[
                                    { required: true, message: 'Por favor, ingresa el número telefónico.'},
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
                    key="4"
                >
                    <Title level={4} style={{ marginBottom: '24px', color: '#457B9D' }}>Programa de Recompensas</Title>
                    <Paragraph style={{ fontStyle: 'italic', color: '#6c757d' }}>
                        Esta sección se encuentra en desarrollo. ¡Próximamente más detalles!
                    </Paragraph>
                </TabPane>

                <TabPane
                    tab={<span><AuditOutlined /> Documentos de la Empresa</span>}
                    key="5"
                >
                    <Title level={4} style={{ marginBottom: '24px', color: '#457B9D' }}>Carga de Documentación Requerida</Title>
                     <Row gutter={16}> {/* Usar gutter más pequeño si hay muchos campos de upload */}
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="constancia_situacion_fiscal_empresa_file"
                                label={
                                    <span>
                                        Constancia de Situación Fiscal (Empresa)&nbsp;
                                        <Tooltip title="Emitida por el SAT, asegúrate que sea reciente.">
                                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                        </Tooltip>
                                    </span>
                                }
                                rules={[{ required: true, message: 'Sube la constancia de situación fiscal de la empresa.' }]}
                                extra="PDF, JPG, PNG."
                            >
                                <Upload {...uploadProps} accept=".pdf,.jpg,.jpeg,.png">
                                    <Button icon={<UploadOutlined />}>Seleccionar Archivo</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="acta_constitutiva_file"
                                label={
                                    <span>
                                        Acta Constitutiva&nbsp;
                                        <Tooltip title="Documento que acredita la creación de la empresa.">
                                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                        </Tooltip>
                                    </span>
                                }
                                rules={[{ required: true, message: 'Sube el acta constitutiva.' }]}
                                extra="PDF escaneado."
                            >
                                <Upload {...uploadProps} accept=".pdf,.jpg,.jpeg,.png">
                                    <Button icon={<UploadOutlined />}>Seleccionar Archivo</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="documento_oficial_representante_legal_file" // Este campo coincide con tu lista
                                label={
                                    <span>
                                        Documento Oficial del Representante Legal (Copia)&nbsp;
                                        <Tooltip title="Copia de la identificación oficial del representante legal (INE, Pasaporte).">
                                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                        </Tooltip>
                                    </span>
                                }
                                rules={[{ required: true, message: 'Sube la identificación oficial del representante.'}]}
                                extra="PDF, JPG, PNG."
                            >
                                <Upload {...uploadProps} accept=".pdf,.jpg,.jpeg,.png">
                                    <Button icon={<UploadOutlined />}>Seleccionar Archivo</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="comprobante_domicilio_empresa_file"
                                label={
                                    <span>
                                        Comprobante de Domicilio (Empresa)&nbsp;
                                        <Tooltip title="No mayor a 3 meses (ej. CFE, agua, teléfono) a nombre de la empresa o con la dirección fiscal.">
                                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                        </Tooltip>
                                    </span>
                                }
                                rules={[{ required: true, message: 'Sube el comprobante de domicilio de la empresa.' }]}
                                extra="PDF, JPG, PNG. No mayor a 3 meses."
                            >
                                <Upload {...uploadProps} accept=".pdf,.jpg,.jpeg,.png">
                                    <Button icon={<UploadOutlined />}>Seleccionar Archivo</Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </TabPane>
            </Tabs>

            <Form.Item style={{ textAlign: 'right', marginTop: '32px', paddingRight: '0px' }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SaveOutlined />}
                    style={{
                        backgroundColor: '#E63946',
                        borderColor: '#E63946',
                        minWidth: '180px',
                    }}
                >
                    Guardar Información de Empresa
                </Button>
            </Form.Item>
        </Form>
    );
};

export default FormularioPersonaMoral;