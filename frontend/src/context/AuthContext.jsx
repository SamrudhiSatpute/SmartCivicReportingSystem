import { createContext, useState, useEffect } from 'react';

// 1. Export the context itself (this fixes your error)
export const AuthContext = createContext();

// 2. Export the provider wrapper
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Keep user logged in even if they refresh the page
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};