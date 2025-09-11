import { useAttendanceToken } from "./contexts/attemdanceToken.context";

export default function AttendanceCodePage() {
    const { attendanceTokenKey } = useAttendanceToken();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-[1.1rem] text-purple-800 font-medium mb-2 tracking-wide text-center">Attendance Code</div>
            <div
                className="bg-gradient-to-r from-purple-800 to-purple-500 text-white text-2xl font-bold tracking-wider px-12 py-8 rounded-xl shadow-lg mt-8 mb-8 text-center select-all border-2 border-purple-100 transition-shadow hover:shadow-2xl"
            >
                {attendanceTokenKey || "-"}
            </div>
        </div>
    );
}

