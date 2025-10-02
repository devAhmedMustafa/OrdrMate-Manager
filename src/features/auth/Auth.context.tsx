import React, { createContext, useState } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string, role: string, storeId: string, branchId?: string) => void;
    logout: () => void;
    token: string | null;
    role: string | null;
    storeId: string | null;
    branchId: string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [role, setRole] = useState<string | null>(() => localStorage.getItem('role'));
    const [storeId, setStoreId] = useState<string | null>(() => localStorage.getItem('storeId'));
    const [branchId, setBranchId] = useState<string | null>(() => localStorage.getItem('branchId'));

    const login = (newToken: string, role: string, storeId: string, branchId?: string) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', role);
        localStorage.setItem('storeId', storeId); // Keep API key name for backend compatibility
        if (branchId) {
            localStorage.setItem('branchId', branchId);
        }
        setToken(newToken);
        setRole(role);
        setStoreId(storeId);
        if (branchId) {
            setBranchId(branchId);
        }
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('storeId');
        localStorage.removeItem('branchId');
        setToken(null);
        setRole(null);
        setStoreId(null);
        setBranchId(null);
    }

    const isAuthenticated = Boolean(token);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, token, role, storeId, branchId }}>
            {children}
        </AuthContext.Provider>
    )
}
