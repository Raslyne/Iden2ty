// client/src/pages/dashboard/UsuariosDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Button,
    Table,
    Input,
    Space,
    Typography,
    Switch,
    Dropdown,
    Menu,
    message,
    Tag,
    Modal,
    Drawer,
    Form,
    Select,
} from 'antd';
import type { MenuProps } from 'antd';
import {
    PlusOutlined,
    DownloadOutlined,
    SearchOutlined,
    EllipsisOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleFilled,
    // UserOutlined as DefaultUserIcon // No se está usando, puedes eliminarlo si no es necesario
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
// MODIFICACIÓN: Asegúrate de que el tipo de `loggedInUser` (User) se importe o esté bien definido en AuthContext
import { useAuth } from '../../context/AuthContext'; // Asumiendo que exportas 'User'
import axiosInstance from '../../utils/axiosInstance';
import axios from 'axios';

const { Title } = Typography;
const { Search } = Input;
const { confirm } = Modal;
const { Option } = Select;

// Interfaz para los datos de usuario que se mostrarán en la tabla
interface UserData {
    key: string;
    id_usuarios: string;
    nombreCompleto: string;
    correo_electronico: string;
    rol_usuario: string;
    segmento_usuario?: string;
    status_usuario: 'Habilitado' | 'Inhabilitado' | 'Espera';
    nombre_usuario: string;
    apellido_paterno: string;
    apellido_materno?: string;
    telefono_usuario?: string; // <--- MODIFICACIÓN: Asegurar que este campo exista
}

// MODIFICACIÓN: Interfaz para los valores del formulario (antes CreateUserFormValues)
interface UserFormValues {
    correo_electronico: string;
    password_usuario?: string; // <--- MODIFICACIÓN: Hecho opcional para edición
    nombre_usuario: string;
    apellido_paterno: string;
    apellido_materno?: string;
    telefono_usuario?: string;
    rol_usuario: string;
    segmento_usuario: string;
    status_inicial: boolean;
}

// --- INICIO: NUEVAS CONSTANTES ---
// Lista de todos los roles que se pueden asignar o ver en el formulario
const TODOS_LOS_ROLES = ["SuperAdmin", "Administrador", "Supervisor", "Analista", "Reclutador"];
// Lista de segmentos ejemplo (ya la tenías, la centralizo aquí)
const segmentosEjemplo = ["IT", "Marketing", "Ventas", "Operaciones", "Recursos Humanos"];
// --- FIN: NUEVAS CONSTANTES ---

const UsuariosDashboard: React.FC = () => {
    // MODIFICACIÓN: Tipado explícito para loggedInUser si es necesario
    const { user: loggedInUser, token } = useAuth() as { user: LoggedInUserType | null, token: string | null };
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');

    // --- INICIO: MODIFICACIÓN Y ADICIÓN DE ESTADOS PARA EL DRAWER ---
    // ANTERIORMENTE: const [isAddUserDrawerVisible, setIsAddUserDrawerVisible] = useState<boolean>(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false); // MODIFICACIÓN: Renombrado

    // ANTERIORMENTE: const [isSubmittingNewUser, setIsSubmittingNewUser] = useState<boolean>(false);
    const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false); // MODIFICACIÓN: Renombrado

    // ANTERIORMENTE: const [addUserForm] = Form.useForm<CreateUserFormValues>();
    const [form] = Form.useForm<UserFormValues>(); // MODIFICACIÓN: Renombrado y usa UserFormValues

    const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add'); // NUEVO ESTADO: para modo add/edit
    const [editingUser, setEditingUser] = useState<UserData | null>(null); // NUEVO ESTADO: para guardar el usuario en edición
    // --- FIN: MODIFICACIÓN Y ADICIÓN DE ESTADOS PARA EL DRAWER ---

    const esAdminOrganizacion = ['Administrador', 'SuperAdmin'].includes(loggedInUser?.rol_usuario ?? '');

    const fetchUsers = useCallback(async () => {
        if (loggedInUser?.organizacion?.id_organizacion && token) {
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/users/my-organization-users`);
                if (response.data && response.data.success) {
                    const fetchedUsersFromApi = response.data.usuarios;
                    const formattedData: UserData[] = fetchedUsersFromApi.map((u: any) => ({ // MODIFICACIÓN: Tipado explícito
                        key: u.id_usuarios,
                        id_usuarios: u.id_usuarios,
                        nombreCompleto: `${u.nombre_usuario || ''} ${u.apellido_paterno || ''} ${u.apellido_materno || ''}`.trim(),
                        nombre_usuario: u.nombre_usuario,
                        apellido_paterno: u.apellido_paterno,
                        apellido_materno: u.apellido_materno,
                        correo_electronico: u.correo_electronico,
                        rol_usuario: u.rol_usuario,
                        segmento_usuario: u.segmento_usuario,
                        status_usuario: u.status_usuario,
                        telefono_usuario: u.telefono_usuario, // <--- MODIFICACIÓN: Asegurar que se obtiene y mapea
                    }));
                    setUsers(formattedData);
                } else {
                    message.error(response.data.message || 'Error al cargar los usuarios.');
                }
            } catch (err) {
                console.error("Error fetching users from API:", err);
                let errorMessage = 'Error de conexión al cargar los usuarios.';
                if (axios.isAxiosError(err) && err.response) {
                    errorMessage = err.response.data?.message || errorMessage;
                } else if (err instanceof Error) {
                    errorMessage = err.message;
                }
                message.error(errorMessage);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [loggedInUser, token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // --- INICIO: MODIFICACIÓN Y ADICIÓN DE FUNCIONES PARA EL DRAWER ---
    // ANTERIORMENTE: const onCloseAddUserDrawer = () => { ... setIsAddUserDrawerVisible(false); addUserForm.resetFields(); ... };
    const onCloseDrawer = () => { // MODIFICACIÓN: Renombrada y lógica extendida
        setIsDrawerVisible(false);
        form.resetFields();
        setEditingUser(null); // Limpiar usuario en edición
    };

    // ANTERIORMENTE: const showAddUserDrawer = () => { ... addUserForm.resetFields(); setIsAddUserDrawerVisible(true); ... };
    const showAddUserDrawer = () => { // MODIFICACIÓN: Adaptada para el nuevo flujo
        if (!esAdminOrganizacion) {
            message.error('No tienes permisos para agregar usuarios.');
            return;
        }
        setDrawerMode('add');
        setEditingUser(null);
        form.resetFields();
        form.setFieldsValue({ // Establecer valores por defecto para agregar
            status_inicial: true,
            rol_usuario: 'Analista', // O el rol por defecto que prefieras
            // segmento_usuario: segmentosEjemplo[0], // Opcional
        });
        setIsDrawerVisible(true);
    };

    // --- INICIO: NUEVA FUNCIÓN ---
    const showEditUserDrawer = (userToEdit: UserData) => {
        setDrawerMode('edit');
        setEditingUser(userToEdit);
        form.setFieldsValue({
            correo_electronico: userToEdit.correo_electronico,
            nombre_usuario: userToEdit.nombre_usuario,
            apellido_paterno: userToEdit.apellido_paterno,
            apellido_materno: userToEdit.apellido_materno || '',
            telefono_usuario: userToEdit.telefono_usuario || '',
            rol_usuario: userToEdit.rol_usuario,
            segmento_usuario: userToEdit.segmento_usuario || segmentosEjemplo[0], // Valor por defecto si no tiene
            status_inicial: userToEdit.status_usuario === 'Habilitado', // Mapear status_usuario a booleano
            password_usuario: '', // No mostrar contraseña actual; campo para nueva contraseña (opcional)
        });
        setIsDrawerVisible(true);
    };
    // --- FIN: NUEVA FUNCIÓN ---

    // ANTERIORMENTE: const handleCreateUserSubmit = async (values: CreateUserFormValues) => { ... };
    // MODIFICACIÓN: Se reemplaza por handleFormSubmit para manejar tanto creación como edición.
    const handleFormSubmit = async (values: UserFormValues) => {
        setIsSubmittingForm(true); // Usar el estado renombrado

        const commonPayload: any = { // Payload base, correo se añade/excluye después
            nombre_usuario: values.nombre_usuario,
            apellido_paterno: values.apellido_paterno,
            apellido_materno: values.apellido_materno || null,
            telefono_usuario: values.telefono_usuario || null,
            rol_usuario: values.rol_usuario,
            segmento_usuario: values.segmento_usuario,
            status_usuario: values.status_inicial ? 'Habilitado' : 'Espera',
        };

        try {
            if (drawerMode === 'add') {
                if (!values.password_usuario) { // Contraseña es requerida para nuevos usuarios
                    message.error('La contraseña es obligatoria para crear un nuevo usuario.');
                    setIsSubmittingForm(false);
                    return;
                }
                const createPayload = {
                    ...commonPayload,
                    correo_electronico: values.correo_electronico, // Correo para creación
                    password_usuario: values.password_usuario,
                };
                await axiosInstance.post('/users/create', createPayload);
                message.success('Usuario agregado exitosamente.');
            } else if (drawerMode === 'edit' && editingUser) {
                // Para edición, no se envía correo (PK, no editable) ni password_usuario a menos que se quiera cambiar
                // y el backend lo soporte (lo cual no hace el updateUser actual para password).
                const updatePayload = { ...commonPayload }; // No incluye correo por defecto

                if (values.password_usuario && values.password_usuario.length > 0) {
                     // Si el backend manejara cambio de contraseña, aquí se añadiría al payload.
                     // Por ahora, el backend `updateUser` no procesa `password_usuario`.
                    message.info('La funcionalidad de cambio de contraseña desde este formulario no está implementada en el backend. La contraseña no se ha modificado.');
                }
                await axiosInstance.put(`/users/${editingUser.id_usuarios}`, updatePayload);
                message.success('Usuario actualizado exitosamente.');
            }
            onCloseDrawer(); // Cierra y resetea el drawer
            await fetchUsers(); // Recargar la lista de usuarios
        } catch (error) {
            console.error(`Error al ${drawerMode === 'add' ? 'crear' : 'actualizar'} usuario:`, error);
            let errorMessage = `Error de conexión al ${drawerMode === 'add' ? 'crear' : 'actualizar'} el usuario.`;
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data?.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            message.error(errorMessage);
        } finally {
            setIsSubmittingForm(false); // Usar el estado renombrado
        }
    };
    // --- FIN: MODIFICACIÓN Y ADICIÓN DE FUNCIONES PARA EL DRAWER ---

    const handleDownloadCSV = () => { /* ... (sin cambios) ... */ };

    const handleStatusChange = async (userIdToUpdate: string, checked: boolean) => {
        // Esta función ya estaba corregida y funcionando para el switch de la tabla.
        if (userIdToUpdate === loggedInUser?.id_usuarios) {
            message.warning('No puedes cambiar tu propio estatus.');
            setTimeout(() => fetchUsers(), 50);
            return;
        }
        // La comprobación de esAdminOrganizacion aquí es una doble seguridad,
        // el switch ya debería estar deshabilitado por la lógica en `columns`.
        if (!esAdminOrganizacion) {
            message.error('No tienes permisos para cambiar el estatus de otros usuarios.');
            setTimeout(() => fetchUsers(), 50);
            return;
        }
        const newStatus = checked ? 'Habilitado' : 'Inhabilitado';
        const originalUsers = [...users];
        setUsers(prevUsers => prevUsers.map(u => u.id_usuarios === userIdToUpdate ? { ...u, status_usuario: newStatus } : u));
        try {
            await axiosInstance.put(`/users/${userIdToUpdate}/status`, { status_usuario: newStatus });
            message.success('Estatus actualizado correctamente.');
        } catch (error) {
            console.error('Error updating user status:', error);
            let errorMsg = 'Error al actualizar el estatus del usuario.';
            if (axios.isAxiosError(error) && error.response && error.response.data?.message) {
                errorMsg = error.response.data.message;
            }
            message.error(errorMsg);
            setUsers(originalUsers);
        }
    };

    // ANTERIORMENTE: const handleAdministrarUsuario = (userIdToAdmin: string) => { ... };
    // MODIFICACIÓN: Esta función ya no es necesaria, la lógica se mueve al menú de acciones.

    // MODIFICACIÓN: showDeleteConfirm ahora recibe el objeto UserData completo
    const showDeleteConfirm = (userToDelete: UserData) => {
        console.log('[FE] Iniciando showDeleteConfirm para:', userToDelete.nombreCompleto, userToDelete.id_usuarios); // DEBUG
        // Los permisos granulares ya se verificaron para (des)habilitar el botón de eliminar.
        // Esto es una verificación adicional general.
        if (userToDelete.id_usuarios === loggedInUser?.id_usuarios) {
            message.error('No puedes eliminar tu propia cuenta de usuario.');
            console.log('[FE] Intento de auto-eliminación bloqueado.'); // DEBUG
            return;
        }
        // Verifica si el loggedInUser tiene un rol que le permita eliminar en general (ya cubierto por canDeleteUser)
        // if (!canDeleteUser(loggedInUser, userToDelete)) {
        //     message.error('No tienes permisos para eliminar este usuario.');
        //     return;
        // }

        confirm({
            title: `¿Estás seguro de que quieres eliminar a ${userToDelete.nombreCompleto}?`,
            icon: <ExclamationCircleFilled />,
            content: 'Esta acción no se puede deshacer.',
            okText: 'Sí, eliminar',
            okType: 'danger',
            cancelText: 'No, cancelar',
            onOk: async () => {
                console.log('[FE] Confirmación de eliminación aceptada. Intentando borrar usuario ID:', userToDelete.id_usuarios); // DEBUG
                try {
                    const response = await axiosInstance.delete(`/users/${userToDelete.id_usuarios}`);
                    console.log('[FE] Respuesta del backend al eliminar:', response); // DEBUG
                    
                    if (response.data && response.data.success) {
                        message.success(`Usuario ${userToDelete.nombreCompleto} eliminado correctamente.`);
                        setUsers(prevUsers => prevUsers.filter(u => u.id_usuarios !== userToDelete.id_usuarios));
                        console.log('[FE] Usuario eliminado del estado local.'); // DEBUG
                    } else {
                        // El backend respondió pero no indicó éxito (ej. success: false o faltaba la bandera success)
                        message.error(response.data?.message || 'El backend no confirmó la eliminación o devolvió un error.');
                        console.log('[FE] El backend no confirmó la eliminación. Mensaje:', response.data?.message); // DEBUG
                    }
                } catch (error) {
                    console.error('[FE] Error durante la llamada axios.delete:', error); // DEBUG
                    if (axios.isAxiosError(error) && error.response) {
                        console.error('[FE] Datos del error de Axios:', error.response.data); // DEBUG
                        console.error('[FE] Estado del error de Axios:', error.response.status); // DEBUG
                        message.error(error.response.data?.message || `Error ${error.response.status}: No se pudo eliminar el usuario.`);
                    } else if (error instanceof Error) {
                        message.error(error.message || 'Ocurrió un error desconocido al intentar eliminar el usuario.');
                    } else {
                        message.error('Ocurrió un error desconocido al intentar eliminar el usuario.');
                    }
                }
            },
            onCancel: () => {
                console.log('[FE] Eliminación cancelada por el usuario.'); // DEBUG
            }
        });
    };

    // --- INICIO: NUEVAS FUNCIONES DE AYUDA PARA PERMISOS ---
    const canEditUser = (currentUser: LoggedInUserType | null, targetUser: UserData): boolean => {
        if (!currentUser) return false;
        const isSelf = currentUser.id_usuarios === targetUser.id_usuarios;

        if (currentUser.rol_usuario === 'SuperAdmin') {
            return isSelf || targetUser.rol_usuario !== 'SuperAdmin';
        }
        if (currentUser.rol_usuario === 'Administrador') {
            return !isSelf && targetUser.rol_usuario !== 'SuperAdmin' && targetUser.rol_usuario !== 'Administrador';
        }
        return false;
    };

    const canDeleteUser = (currentUser: LoggedInUserType | null, targetUser: UserData): boolean => {
        if (!currentUser || currentUser.id_usuarios === targetUser.id_usuarios) return false;

        if (currentUser.rol_usuario === 'SuperAdmin') {
            return targetUser.rol_usuario !== 'SuperAdmin';
        }
        if (currentUser.rol_usuario === 'Administrador') {
            return targetUser.rol_usuario !== 'SuperAdmin' && targetUser.rol_usuario !== 'Administrador';
        }
        return false;
    };
    // --- FIN: NUEVAS FUNCIONES DE AYUDA PARA PERMISOS ---

    const columns: ColumnsType<UserData> = [
        {
            title: 'Estatus', dataIndex: 'status_usuario', key: 'status_usuario', width: 120, align: 'center',
            // La lógica disabled ya estaba corregida en tu código anterior:
            render: (status, record) => (<Switch checked={status === 'Habilitado'} onChange={(c) => handleStatusChange(record.id_usuarios, c)} disabled={record.id_usuarios === loggedInUser?.id_usuarios || (status === 'Espera' && !esAdminOrganizacion) || (!esAdminOrganizacion && record.id_usuarios !== loggedInUser?.id_usuarios)} />),
        },
        { title: 'Nombre', dataIndex: 'nombreCompleto', key: 'nombreCompleto', sorter: (a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto), ellipsis: true },
        { title: 'Correo Electrónico', dataIndex: 'correo_electronico', key: 'correo_electronico', ellipsis: true },
        {
            title: 'Rol', dataIndex: 'rol_usuario', key: 'rol_usuario', width: 150,
            render: (rol) => { /* ... (sin cambios en el render del Rol) ... */
                if (!rol) return <Tag>N/A</Tag>;
                let color = 'default';
                const lcr = rol.toLowerCase();
                if (lcr === 'superadmin') color = 'gold';
                else if (lcr === 'administrador') color = 'volcano';
                else if (lcr === 'supervisor') color = 'purple';
                else if (lcr === 'analista') color = 'geekblue';
                else if (lcr === 'reclutador') color = 'cyan';
                return <Tag color={color}>{rol.toUpperCase()}</Tag>;
            }
        },
        { title: 'Segmento', dataIndex: 'segmento_usuario', key: 'segmento_usuario', width: 150, ellipsis: true, render: (s) => s || 'N/A' },
        // --- INICIO: MODIFICACIÓN COLUMNA DE ACCIONES ---
        ...(esAdminOrganizacion ? [{ // Esta condición general se mantiene
            title: 'Acciones', key: 'acciones', width: 100, align: 'center' as const,
            render: (_: any, record: UserData) => {
                // ANTERIORMENTE: const isCurrentUserLoggedIn = record.id_usuarios === loggedInUser?.id_usuarios;
                // ANTERIORMENTE: actionMenuItems eran estáticos y usaban isCurrentUserLoggedIn para disabled.

                const _canEditThisUser = canEditUser(loggedInUser, record);
                const _canDeleteThisUser = canDeleteUser(loggedInUser, record);

                const itemsForMenu: MenuProps['items'] = [];

                if (_canEditThisUser) {
                    itemsForMenu.push({
                        key: 'administrar',
                        icon: <EditOutlined />,
                        label: 'Administrar',
                    });
                }
                if (_canDeleteThisUser) {
                    itemsForMenu.push({
                        key: 'eliminar',
                        icon: <DeleteOutlined />,
                        label: 'Eliminar',
                        danger: true,
                    });
                }
                
                // Si no hay acciones, deshabilita el botón del dropdown.
                if (itemsForMenu.length === 0) {
                    return <Button type="text" icon={<EllipsisOutlined />} disabled />;
                }

                return (
                    <Dropdown
                        menu={{
                            items: itemsForMenu,
                            onClick: ({ key }) => {
                                if (key === 'administrar') {
                                    showEditUserDrawer(record); // Llamar a la función para editar
                                } else if (key === 'eliminar') {
                                    console.log('[FE] showDeleteConfirm se ejecutó'); // 🔍 Debug
                                    showDeleteConfirm(record); // Pasar el record completo
                                }
                            }
                        }}
                        trigger={['click']}
                    >
                        <Button type="text" icon={<EllipsisOutlined />} />
                    </Dropdown>
                );
            },
        }] : []),
        // --- FIN: MODIFICACIÓN COLUMNA DE ACCIONES ---
    ];

    const filteredUsers = users.filter(user => /* ... (sin cambios en la lógica de filtrado) ... */
        user.nombreCompleto?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.correo_electronico?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.rol_usuario?.toLowerCase().includes(searchText.toLowerCase()) ||
        (user.segmento_usuario && user.segmento_usuario.toLowerCase().includes(searchText.toLowerCase()))
    );

    const tableProps: TableProps<UserData> = { /* ... (sin cambios) ... */
        rowKey: 'key', /*columns,*/ dataSource: filteredUsers, loading, // columns se pasa abajo
        pagination: { pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'], position: ['bottomRight'] },
        scroll: { x: 800 }
    };

    // ANTERIORMENTE: const rolesDisponibles = ["Administrador", "Supervisor", "Analista", "Reclutador"];
    // MODIFICACIÓN: Usar TODOS_LOS_ROLES para el formulario, el backend validará.
    // Opcionalmente, podrías filtrar esta lista dinámicamente aquí si quieres ser más restrictivo en el frontend.
    const rolesParaElFormulario = TODOS_LOS_ROLES;

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Title level={3}>Gestión de Usuarios</Title>
            <Space style={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Search
                    placeholder="Buscar usuarios..." allowClear enterButton={<SearchOutlined />}
                    onSearch={setSearchText} onChange={e => setSearchText(e.target.value)}
                    style={{ width: 400, marginBottom: 10 }}
                />
                <Space wrap>
                    <Button icon={<DownloadOutlined />} onClick={handleDownloadCSV}>Descargar CSV</Button>
                    {esAdminOrganizacion && (
                        // MODIFICACIÓN: onClick ahora llama a showAddUserDrawer (renombrada)
                        <Button type="primary" icon={<PlusOutlined />} onClick={showAddUserDrawer}>
                            Agregar Usuario
                        </Button>
                    )}
                </Space>
            </Space>

            <Table {...tableProps} columns={columns} /* dataSource={filteredUsers} ya está en tableProps */ />

            {/* --- INICIO: MODIFICACIONES AL COMPONENTE DRAWER --- */}
            <Drawer
                // MODIFICACIÓN: Título dinámico
                title={drawerMode === 'add' ? 'Agregar Nuevo Usuario' : `Editar Usuario: ${editingUser?.nombreCompleto || ''}`}
                width={420}
                // MODIFICACIÓN: onClose y visible usan los nuevos estados/funciones
                onClose={onCloseDrawer}
                visible={isDrawerVisible}
                bodyStyle={{ paddingBottom: 80 }}
                destroyOnClose // Buena práctica para resetear estado interno del drawer
                footer={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Form.Item
                            form={form} // MODIFICACIÓN: Usar la instancia de form renombrada
                            name="status_inicial"
                            valuePropName="checked"
                            noStyle
                        >
                            <Switch checkedChildren="Habilitado" unCheckedChildren="En Espera" />
                        </Form.Item>
                        <Space>
                            <Button onClick={onCloseDrawer} style={{ marginRight: 8 }}> {/* MODIFICACIÓN */}
                                Cancelar
                            </Button>
                            <Button onClick={() => form.submit()} type="primary" loading={isSubmittingForm}> {/* MODIFICACIÓN */}
                                {drawerMode === 'add' ? 'Agregar' : 'Guardar Cambios'} {/* MODIFICACIÓN: Texto dinámico */}
                            </Button>
                        </Space>
                    </div>
                }
            >
                <Form
                    form={form} // MODIFICACIÓN
                    layout="vertical"
                    name="user_form" // MODIFICACIÓN: Nombre genérico
                    onFinish={handleFormSubmit} // MODIFICACIÓN
                    initialValues={{ // Estos initialValues se aplican cuando el form se monta o resetea.
                                      // Para edición, usamos form.setFieldsValue().
                        status_inicial: true,
                        rol_usuario: 'Analista', // Rol por defecto al abrir para 'add'
                        // segmento_usuario: segmentosEjemplo[0],
                    }}
                >
                    <Form.Item
                        name="correo_electronico" label="Correo Electrónico"
                        rules={[
                            { required: true, message: 'El correo electrónico es requerido.' },
                            { type: 'email', message: 'El formato del correo no es válido.' }
                        ]}
                    >
                        {/* MODIFICACIÓN: Deshabilitar correo en modo edición, ya que no se puede cambiar */}
                        <Input placeholder="usuario@ejemplo.com" disabled={drawerMode === 'edit'} />
                    </Form.Item>

                    <Form.Item
                        name="password_usuario" label="Contraseña"
                        // MODIFICACIÓN: Ayuda y reglas dinámicas para la contraseña
                        help={drawerMode === 'edit' ? "Dejar en blanco para no cambiar. Mín. 8 caracteres si se ingresa nueva." : "Mínimo 8 caracteres."}
                        rules={[
                            {
                                required: drawerMode === 'add', // Solo requerida al crear
                                message: 'La contraseña es requerida.',
                            },
                            { // Validador para la longitud si se ingresa una contraseña
                                validator: async (_, value) => {
                                    if (value && value.length > 0 && value.length < 8) { // Solo valida longitud si hay algo escrito
                                        return Promise.reject(new Error('La contraseña debe tener al menos 8 caracteres.'));
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input.Password placeholder={drawerMode === 'add' ? "Mínimo 8 caracteres" : "Nueva contraseña (opcional)"} />
                    </Form.Item>

                    <Form.Item name="nombre_usuario" label="Nombre(s)" rules={[{ required: true, message: 'El nombre es requerido.' }]}>
                        <Input placeholder="Ej: Juan Carlos" />
                    </Form.Item>
                    <Form.Item name="apellido_paterno" label="Apellido Paterno" rules={[{ required: true, message: 'El apellido paterno es requerido.' }]}>
                        <Input placeholder="Ej: Rodríguez" />
                    </Form.Item>
                    <Form.Item name="apellido_materno" label="Apellido Materno (Opcional)">
                        <Input placeholder="Ej: Pérez" />
                    </Form.Item>
                    <Form.Item name="telefono_usuario" label="Teléfono (Opcional)">
                        <Input placeholder="Ej: +52 55 1234 5678" />
                    </Form.Item>
                    <Form.Item name="rol_usuario" label="Rol" rules={[{ required: true, message: 'Por favor, selecciona un rol.' }]}>
                        <Select
                            placeholder="Selecciona un rol"
                            // MODIFICACIÓN: Deshabilitar si SuperAdmin edita su propio rol
                            disabled={
                                drawerMode === 'edit' &&
                                editingUser?.rol_usuario === 'SuperAdmin' &&
                                loggedInUser?.id_usuarios === editingUser?.id_usuarios
                            }
                        >
                            {/* MODIFICACIÓN: Usar la lista de roles definida (TODOS_LOS_ROLES o rolesParaElFormulario) */}
                            {rolesParaElFormulario.map(rol => (<Option key={rol} value={rol}>{rol}</Option>))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="segmento_usuario" label="Segmento" rules={[{ required: true, message: 'Por favor, selecciona un segmento.' }]}>
                        <Select placeholder="Selecciona un segmento">
                            {segmentosEjemplo.map(segmento => (<Option key={segmento} value={segmento}>{segmento}</Option>))}
                        </Select>
                    </Form.Item>
                </Form>
            </Drawer>
            {/* --- FIN: MODIFICACIONES AL COMPONENTE DRAWER --- */}
        </Space>
    );
};

export default UsuariosDashboard;