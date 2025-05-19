import React, { createContext, useState } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string, role: string, restaurantId: string)=> void;
    logout: ()=> void;
    token: string | null;
    role: string | null;
    restaurantId: string | null;
}

export const AuthContext = createContext<AuthContextType|null>(null);

export const AuthProvider : React.FC<{children: React.ReactNode}> = ({children})=>{
    
    const [token, setToken] = useState<string|null>(()=> localStorage.getItem('token'));
    const [role, setRole] = useState<string|null>(()=> localStorage.getItem('role'));
    const [restaurantId, setRestaurantId] = useState<string|null>(()=> localStorage.getItem('restaurantId'));

    const login = (newToken: string, role: string, restaurantId: string)=>{
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', role);
        localStorage.setItem('restaurantId', restaurantId);
        setToken(newToken)
        setRole(role)
        setRestaurantId(restaurantId)
    }

    const logout = ()=>{
        localStorage.removeItem('token');
        setToken(null);
    }

    const isAuthenticated = Boolean(token);

    return (
        <AuthContext.Provider value={{isAuthenticated, login, logout, token, role, restaurantId}}>
            {children}
        </AuthContext.Provider>
    )
}