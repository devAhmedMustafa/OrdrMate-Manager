import React, { createContext, useState } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string, role: string, pharmacyId: string, branchId?: string) => void;
    logout: () => void;
    token: string | null;
    role: string | null;
    pharmacyId: string | null;
    branchId: string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [role, setRole] = useState<string | null>(() => localStorage.getItem('role'));
    const [pharmacyId, setPharmacyId] = useState<string | null>(() => localStorage.getItem('pharmacyId'));
    const [branchId, setBranchId] = useState<string | null>(() => localStorage.getItem('branchId'));

    const login = (newToken: string, role: string, pharmacyId: string, branchId?: string) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', role);
        localStorage.setItem('pharmacyId', pharmacyId);
        if (branchId) {
            localStorage.setItem('branchId', branchId);
        }
        setToken(newToken);
        setRole(role);
        setPharmacyId(pharmacyId);
        if (branchId) {
            setBranchId(branchId);
        }
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('pharmacyId');
        localStorage.removeItem('branchId');
        setToken(null);
        setRole(null);
        setPharmacyId(null);
        setBranchId(null);
    }

    const isAuthenticated = Boolean(token);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, token, role, pharmacyId, branchId }}>
            {children}
        </AuthContext.Provider>
    )
}