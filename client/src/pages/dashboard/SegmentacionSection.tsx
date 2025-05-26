// client/src/pages/dashboard/SegmentacionSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography,
    Switch,
    Button,
    Table,
    Modal,
    Form,
    Input,
    Space,
    Tooltip,
    message // Importar message de antd
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleFilled // Para el modal de confirmación de borrado
} from '@ant-design/icons';
import axiosInstance from '../../utils/axiosInstance'; // Tu instancia de Axios configurada
import { useAuth } from '../../context/AuthContext'; // Para obtener el id_organizacion

const { Title, Paragraph } = Typography;
const { confirm } = Modal;

// Interfaz para definir la estructura de un segmento (frontend)
interface SegmentoData {
    key: string; // Para la key de la tabla de Ant Design
    id: string;  // El ID real del segmento desde la BD
    nombre: string;
    // cantidadUsuarios sigue siendo un desafío si no viene de la API de segmentos. Por ahora, lo omitimos o ponemos 0.
    // cantidadUsuarios: number;
    descripcion?: string;
}

// Interfaz para los valores del formulario del modal
interface SegmentoFormValues {
    nombre: string;
    descripcion?: string;
}

const SegmentacionSection: React.FC = () => {
    const { user: loggedInUser } = useAuth(); // Obtener usuario logueado para id_organizacion

    const [segmentacionActiva, setSegmentacionActiva] = useState<boolean>(false);
    const [segmentos, setSegmentos] = useState<SegmentoData[]>([]);
    const [isSegmentoModalVisible, setIsSegmentoModalVisible] = useState<boolean>(false);
    const [editingSegmento, setEditingSegmento] = useState<SegmentoData | null>(null);
    const [segmentoForm] = Form.useForm<SegmentoFormValues>();
    const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false); // Para la tabla
    const [isSubmittingModal, setIsSubmittingModal] = useState<boolean>(false); // Para el modal

    // Función para cargar los segmentos de la organización actual
    const fetchSegmentsForCurrentOrg = useCallback(async () => {
        if (!loggedInUser?.organizacion?.id_organizacion) {
            setSegmentos([]);
            return;
        }
        setIsLoadingTable(true);
        try {
            const response = await axiosInstance.get(`/segmentos/organizacion/${loggedInUser.organizacion.id_organizacion}`);
            if (response.data && response.data.success && Array.isArray(response.data.segmentos)) {
                const fetchedSegments = response.data.segmentos.map((s: any) => ({
                    key: s.id_segmento, // Usar el ID real como key para la tabla
                    id: s.id_segmento,  // Guardar el ID real
                    nombre: s.nombre_segmento,
                    descripcion: s.descripcion_segmento,
                    // cantidadUsuarios: s.cantidad_usuarios || 0, // Si tu API lo devuelve
                }));
                setSegmentos(fetchedSegments);
            } else {
                message.error('No se pudieron cargar los segmentos o la respuesta no es válida.');
                setSegmentos([]);
            }
        } catch (error: any) {
            console.error("Error fetching segments:", error);
            message.error(error.response?.data?.message || 'Error de red al cargar segmentos.');
            setSegmentos([]);
        } finally {
            setIsLoadingTable(false);
        }
    }, [loggedInUser]);

    useEffect(() => {
        if (segmentacionActiva && loggedInUser?.organizacion?.id_organizacion) {
            fetchSegmentsForCurrentOrg();
        } else if (!segmentacionActiva) {
            setSegmentos([]); // Limpiar segmentos si se desactiva
        }
    }, [segmentacionActiva, loggedInUser, fetchSegmentsForCurrentOrg]);


    const handleSegmentacionSwitch = (checked: boolean) => {
        setSegmentacionActiva(checked);
    };

    const showSegmentoModal = (segmento?: SegmentoData) => {
        if (segmento) {
            setEditingSegmento(segmento);
            segmentoForm.setFieldsValue({
                nombre: segmento.nombre,
                descripcion: segmento.descripcion
            });
        } else {
            setEditingSegmento(null);
            segmentoForm.resetFields();
        }
        setIsSegmentoModalVisible(true);
    };

    const handleSegmentoModalCancel = () => {
        setIsSegmentoModalVisible(false);
        // No es necesario resetear el form aquí si se hace en showSegmentoModal y al cerrar con éxito
    };

    const handleSegmentoFormFinish = async (values: SegmentoFormValues) => {
        if (!loggedInUser?.organizacion?.id_organizacion) {
            message.error("No se pudo identificar la organización del usuario.");
            return;
        }
        setIsSubmittingModal(true);
        try {
            if (editingSegmento) {
                // --- MODO EDICIÓN ---
                const payload = {
                    nombre_segmento: values.nombre,
                    descripcion_segmento: values.descripcion || '', // Enviar string vacío si es undefined
                };
                await axiosInstance.put(`/segmentos/${editingSegmento.id}`, payload);
                message.success(`Segmento "${values.nombre}" actualizado exitosamente.`);
            } else {
                // --- MODO AGREGAR ---
                const payload = {
                    nombre_segmento: values.nombre,
                    descripcion_segmento: values.descripcion || '',
                    id_organizacion: loggedInUser.organizacion.id_organizacion,
                };
                // Asumimos que el endpoint POST es /api/v1/segmentos
                await axiosInstance.post('/segmentos', payload);
                message.success(`Segmento "${values.nombre}" agregado exitosamente.`);
            }
            setIsSegmentoModalVisible(false);
            segmentoForm.resetFields();
            setEditingSegmento(null);
            await fetchSegmentsForCurrentOrg(); // Recargar la lista de segmentos
        } catch (error: any) {
            console.error("Error submitting segment form:", error);
            message.error(error.response?.data?.message || 'Error al guardar el segmento.');
        } finally {
            setIsSubmittingModal(false);
        }
    };

    const handleDeleteSegmento = (segmento: SegmentoData) => {
        confirm({
            title: `¿Estás seguro de que quieres eliminar el segmento "${segmento.nombre}"?`,
            icon: <ExclamationCircleFilled />,
            content: 'Esta acción no se puede deshacer. Los usuarios asignados a este segmento podrían perder su asignación (dependiendo de la configuración de tu BD).',
            okText: 'Sí, eliminar',
            okType: 'danger',
            cancelText: 'No, cancelar',
            onOk: async () => {
                try {
                    // Asumimos que el endpoint DELETE es /api/v1/segmentos/:segmentoId
                    await axiosInstance.delete(`/segmentos/${segmento.id}`);
                    message.success(`Segmento "${segmento.nombre}" eliminado exitosamente.`);
                    await fetchSegmentsForCurrentOrg(); // Recargar la lista
                } catch (error: any) {
                    console.error("Error deleting segment:", error);
                    message.error(error.response?.data?.message || 'Error al eliminar el segmento.');
                }
            },
        });
    };

    const columnasSegmentos = [
        { title: 'Nombre del Segmento', dataIndex: 'nombre', key: 'nombre', sorter: (a: SegmentoData, b: SegmentoData) => a.nombre.localeCompare(b.nombre) },
        // { title: 'Cantidad de Usuarios', dataIndex: 'cantidadUsuarios', key: 'cantidadUsuarios' }, // Omitido por ahora
        { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion', ellipsis: true },
        {
            title: 'Acciones',
            key: 'acciones',
            width: 120,
            align: 'center' as const,
            render: (_: any, record: SegmentoData) => (
                <Space size="middle">
                    <Tooltip title="Editar">
                        <Button icon={<EditOutlined />} onClick={() => showSegmentoModal(record)} />
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteSegmento(record)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Title level={4} style={{ marginBottom: '16px' }}>Configuración de Segmentación de la Organización</Title>
            <Paragraph style={{ marginBottom: '20px' }}>
                ¿Su organización se encuentra dividida por segmentos o unidades de negocio que sean necesarias para el manejo y administración de las recompensas?
            </Paragraph>
            <Switch
                checkedChildren="Sí"
                unCheckedChildren="No"
                checked={segmentacionActiva}
                onChange={handleSegmentacionSwitch}
                style={{ marginBottom: '24px' }}
                disabled={!loggedInUser?.organizacion?.id_organizacion} // Deshabilitar si no hay org
            />

            {segmentacionActiva && loggedInUser?.organizacion?.id_organizacion && (
                <div>
                    <Paragraph style={{ marginTop: '16px', marginBottom: '16px' }}>
                        Gestione los segmentos de su organización.
                    </Paragraph>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showSegmentoModal()}
                        style={{ marginBottom: '24px' }}
                    >
                        Agregar Segmento
                    </Button>
                    <Table
                        columns={columnasSegmentos}
                        dataSource={segmentos}
                        loading={isLoadingTable}
                        bordered
                        title={() => <Title level={5}>Segmentos Existentes</Title>}
                        locale={{ emptyText: 'Aún no hay segmentos definidos para esta organización.' }}
                        rowKey="key" // Asegurar que rowKey usa el 'key' que definimos (que es el id_segmento)
                    />
                </div>
            )}
            {!loggedInUser?.organizacion?.id_organizacion && segmentacionActiva && (
                <Paragraph style={{ color: 'red' }}>
                    No se puede gestionar la segmentación porque no se ha identificado una organización para el usuario actual.
                </Paragraph>
            )}


            <Modal
                title={editingSegmento ? `Editar Segmento: ${editingSegmento.nombre}` : "Agregar Nuevo Segmento"}
                visible={isSegmentoModalVisible}
                onCancel={handleSegmentoModalCancel}
                confirmLoading={isSubmittingModal} // Indicador de carga en el botón OK
                footer={[
                    <Button key="back" onClick={handleSegmentoModalCancel} disabled={isSubmittingModal}>
                        Cancelar
                    </Button>,
                    <Button key="submit" type="primary" loading={isSubmittingModal} onClick={() => segmentoForm.submit()}>
                        {editingSegmento ? "Guardar Cambios" : "Agregar Segmento"}
                    </Button>,
                ]}
                destroyOnClose // Resetea el form y estado interno del Modal al cerrar
            >
                <Form
                    form={segmentoForm}
                    layout="vertical"
                    onFinish={handleSegmentoFormFinish}
                    name="segmento_form"
                >
                    <Form.Item
                        name="nombre"
                        label="Nombre del Segmento"
                        rules={[{ required: true, message: 'Por favor, ingrese el nombre del segmento.' }]}
                    >
                        <Input placeholder="Ej: Ventas Corporativas" />
                    </Form.Item>
                    <Form.Item
                        name="descripcion"
                        label="Descripción (Opcional)"
                    >
                        <Input.TextArea rows={3} placeholder="Describa brevemente el segmento" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default SegmentacionSection;