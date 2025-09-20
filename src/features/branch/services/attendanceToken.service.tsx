import api from "../../../utils/api";

export default class AttendanceTokenService {

    static async initialize(){
        
    }
    
    static async getAttendanceToken(branchId: string, token: string): Promise<string | null> {
        try {
            
            const response = await api.get(`/BranchAttendance?branchId=${branchId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return response.data.code;
            
        } catch (error) {
            console.error('Error fetching attendance token:', error);
            return null;
        }
    }

}