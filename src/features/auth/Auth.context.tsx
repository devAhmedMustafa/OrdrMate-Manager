import React, { createContext, useState } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string)=> void;
    logout: ()=> void;
    token: string | null;
}

export const AuthContext = createContext<AuthContextType|null>(null);

export const AuthProvider : React.FC<{children: React.ReactNode}> = ({children})=>{
    
    const [token, setToken] = useState<string|null>(()=> localStorage.getItem('token'));

    const login = (newToken: string)=>{
        localStorage.setItem('token', newToken);
        setToken(newToken)
    }

    const logout = ()=>{
        localStorage.removeItem('token');
        setToken(null);
    }

    const isAuthenticated = Boolean(token);

    return (
        <AuthContext.Provider value={{isAuthenticated, login, logout, token}}>
            {children}
        </AuthContext.Provider>
    )
}