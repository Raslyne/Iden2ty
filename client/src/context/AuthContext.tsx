// client/src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- INICIO DE MODIFICACIONES ---
// 1. Definir la interfaz para el objeto Segmento
interface UserSegment {
    id: string;
    nombre: string;
}

// 2. Actualizar la interfaz User
interface User {
    id_usuarios: string;
    nombre_usuario: string;
    apellido_paterno: string;
    apellido_materno?: string;
    correo_electronico: string;
    rol_usuario: string;
    segmento: UserSegment | null; // MODIFICADO: de segmento_usuario?: string; a esto
    organizacion: {
        id_organizacion: string;
        nombre_organizacion: string;
        status: string;
    };
}
// --- FIN DE MODIFICACIONES ---

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
            // Cuando se parsee, se esperará la nueva estructura de User
            return storedUser ? JSON.parse(storedUser) as User : null; 
        } catch (error) {
            console.error("Error al parsear usuario desde localStorage:", error);
            // Si hay un error (posiblemente por estructura vieja), limpiar para evitar problemas
            localStorage.removeItem('authUser'); 
            localStorage.removeItem('authToken'); // También el token por consistencia
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
                // Asegurar que el parseo corresponda a la nueva interfaz User
                const parsedUser = JSON.parse(storedUser) as User; 
                
                // Verificación adicional opcional (runtime check) si quieres ser muy cuidadoso
                // durante la transición de estructuras de datos en localStorage:
                if (parsedUser && typeof parsedUser.segmento_usuario !== 'undefined') {
                     // Esto indica que es la estructura VIEJA. Forzar logout o migrar.
                    console.warn("Estructura de usuario antigua detectada en localStorage. Limpiando sesión.");
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                    setToken(null);
                    setUser(null);
                    delete axios.defaults.headers.common['Authorization'];
                    setIsLoading(false); // Asegurar que isLoading se actualice
                    return; // Salir temprano del useEffect
                }

                setUser(parsedUser);
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

    const login = (newToken: string, userData: User) => { // userData ya debería venir con la nueva estructura desde la API
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(userData)); // Se guarda la nueva estructura
        setToken(newToken);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        navigate('/dashboard');
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