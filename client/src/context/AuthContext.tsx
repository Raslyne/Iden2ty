// client/src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ... (interfaz User y AuthContextType permanecen igual) ...
interface User {
    id_usuarios: string;
    nombre_usuario: string;
    apellido_paterno: string;
    correo_electronico: string;
    rol_usuario: string;
    organizacion: {
        id_organizacion: string;
        nombre_organizacion: string;
        status: string;
    };
    }

    interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    }

    const AuthContext = createContext<AuthContextType | undefined>(undefined);

    interface AuthProviderProps {
    children: ReactNode;
    }


    export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('authUser');
        try {
        return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
        console.error("Error al parsear usuario desde localStorage:", error);
        return null;
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        if (storedToken && storedUser) {
        setToken(storedToken);
        try {
            setUser(JSON.parse(storedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } catch (error) {
            console.error("Error al parsear usuario desde localStorage en useEffect:", error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
        }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        navigate('/dashboard'); // <--- ¡CAMBIO AQUÍ! Redirige a /dashboard
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!token, user, token, isLoading, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};