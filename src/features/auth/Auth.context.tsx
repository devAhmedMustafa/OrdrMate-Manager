import React, { createContext, useState } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string, role: string, restaurantId: string, branchId?: string) => void;
    logout: () => void;
    token: string | null;
    role: string | null;
    restaurantId: string | null;
    branchId: string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [role, setRole] = useState<string | null>(() => localStorage.getItem('role'));
    const [restaurantId, setRestaurantId] = useState<string | null>(() => localStorage.getItem('restaurantId'));
    const [branchId, setBranchId] = useState<string | null>(() => localStorage.getItem('branchId'));

    const login = (newToken: string, role: string, restaurantId: string, branchId?: string) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', role);
        localStorage.setItem('restaurantId', restaurantId);
        if (branchId) {
            localStorage.setItem('branchId', branchId);
        }
        setToken(newToken);
        setRole(role);
        setRestaurantId(restaurantId);
        if (branchId) {
            setBranchId(branchId);
        }
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('restaurantId');
        localStorage.removeItem('branchId');
        setToken(null);
        setRole(null);
        setRestaurantId(null);
        setBranchId(null);
    }

    const isAuthenticated = Boolean(token);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, token, role, restaurantId, branchId }}>
            {children}
        </AuthContext.Provider>
    )
}