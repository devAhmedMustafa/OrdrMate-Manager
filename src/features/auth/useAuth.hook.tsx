import { useContext } from "react";
import { AuthContext } from "./Auth.context";

export default function useAuth(){
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be within AuthProvider");
    return ctx;
}