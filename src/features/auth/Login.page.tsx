import logo from "@/assets/OrdrMate.png"
import styles from "./Login.module.css"
import axios from "axios";
import useAuth from "./useAuth.hook";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginPage(){
    const {login} = useAuth();
    const navigate = useNavigate()
    const [error, setError] = useState("");

    async function handleSubmit(e: any){
        e.preventDefault();

        try {
            const data = {
                Username: e.currentTarget.username.value,
                Password: e.currentTarget.password.value
            }

            const res = await axios.post('http://localhost:5126/api/manager/login', data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const {token, role, restaurantId} = res.data;

            if (token){
                login(token, role, restaurantId);
                navigate('/')
            }
        }
        catch(err: any){
            setError(err.response.data.err)
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-orange-50 to-white">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-10 mb-8">
                <img width={80} src={logo} alt="OrdrMate Logo" className="drop-shadow-lg" />
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-black">Ordr Mate</h1>
                    <h2 className="font-semibold text-neutral-600 mt-2">Restaurant Manager</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className={`relative z-10 ${styles.form}`}>
                <label htmlFor="username">Username</label>
                <input 
                    id="username" 
                    name="username" 
                    type="text" 
                    placeholder="Enter your username"
                    className="w-full" 
                />
                <label htmlFor="password">Password</label>
                <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="Enter your password"
                    className="w-full" 
                />
                {error && (
                    <p className="text-sm text-red-600 font-medium text-center mt-2">{error}</p>
                )}
                <button 
                    type="submit"
                    className="w-full mt-4"
                >
                    Sign In
                </button>
            </form>
        </div>
    )
}