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

            const {token} = res.data.token;

            if (token){
                login(token);
                navigate('/')
            }

        }
        catch(err: any){
            setError(err.response.data.err)
        }
    }

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-evenly">

            <div className="flex flex-col items-center gap-10">
                <img width={60} src={logo} alt="OrdrMate Logo" />

                <div className="text-center">
                    <h1 className="text-6xl font-bold">Ordr Mate</h1>
                    <h2 className="font-semibold text-neutral-600">Restaurant Manager</h2>

                </div>
            </div>

            <form onSubmit={handleSubmit} className={"flex flex-col outline-1 rounded-sm p-4 gap-3 outline-neutral-200 "+styles.form}>
                <label htmlFor="username">Username</label>
                <input id="username" name="username" type="text" placeholder="Enter your username" />
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="text" placeholder="Enter your password" />
                {
                    error&&
                    <p className="text-sm text-red-700 font-medium text-center">{error}</p>
                }
                <button className="bg-sharp py-2 text-white rounded-lg cursor-pointer" type="submit">Sign In</button>
            </form>
        </div>
    )
}