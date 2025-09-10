import { createContext, useContext, useEffect, useState } from "react";
import { websocketService } from "../../dashboard/services/websocketService";
import AttendanceTokenService from "../services/attendanceToken.service";
import useAuth from "../../auth/useAuth.hook";

interface AttendanceTokenContextType {
    attendanceTokenKey?: string;
    setAttendanceTokenKey: (key: string) => void;
}

export const AttendanceTokenContext = createContext<AttendanceTokenContextType | undefined>(undefined);

export const AttendanceTokenProvider = ({ children }: { children: React.ReactNode }) => {

    const [attendanceTokenKey, setAttendanceTokenKey] = useState<string | undefined>(undefined);
    const {branchId, token} = useAuth();

    const initialize = async () => {
        if (!branchId || !token) {
            throw new Error("Branch ID or token is missing");
        }

        const code = await AttendanceTokenService.getAttendanceToken(branchId, token);
        setAttendanceTokenKey(code || undefined);
    }

    useEffect(()=> {
        initialize();
        websocketService.on('message', (data: any)=> {
            if (data.type === 'AttendanceCodeUpdate') {
                setAttendanceTokenKey(data.code);
            }
        })
    }, [])

    return (
        <AttendanceTokenContext.Provider value={{ attendanceTokenKey, setAttendanceTokenKey }}>
            {children}
        </AttendanceTokenContext.Provider>
    );
};

export const useAttendanceToken = () => {
    const context = useContext(AttendanceTokenContext);
    if (!context) {
        throw new Error("useAttendanceToken must be used within an AttendanceTokenProvider");
    }
    return context;
};