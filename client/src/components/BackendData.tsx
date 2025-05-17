// src/components/BackendData.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Importar axios
import { Spin, Alert, Typography, Card } from 'antd'; // Componentes de Ant Design

const { Title, Text } = Typography;

// Definimos la URL base de nuestra API. Es buena práctica hacerlo configurable.
// Asegúrate de que el puerto coincida con el de tu backend.
const API_BASE_URL = 'http://localhost:3000/api';

interface ApiResponse {
    message: string;
}

const BackendData: React.FC = () => {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Realizamos la solicitud GET a nuestro backend
            const response = await axios.get<ApiResponse>(`${API_BASE_URL}/test`);
            setData(response.data); // Guardamos los datos de la respuesta
        } catch (err) {
            if (axios.isAxiosError(err)) {
            console.error('Error al obtener datos del backend:', err.message);
            setError(`Error del servidor: ${err.response?.status || err.message}`);
            } else {
            console.error('Error inesperado:', err);
            setError('Ocurrió un error inesperado.');
            }
        } finally {
            setLoading(false);
        }
        };

        fetchData();
    }, []); // El array vacío como segundo argumento hace que useEffect se ejecute solo una vez (al montar el componente)

    if (loading) {
        return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <Spin tip="Cargando datos del backend..." size="large" />
        </div>
        );
    }

    if (error) {
        return <Alert message="Error de Conexión" description={error} type="error" showIcon />;
    }

    return (
        <Card title={<Title level={4}>Respuesta del Backend</Title>} style={{ margin: '20px' }}>
        {data ? (
            <Text strong>{data.message}</Text>
        ) : (
            <Text>No se recibieron datos.</Text>
        )}
        </Card>
    );
};

export default BackendData;