import TableResponse from "../dtos/TableResponse.dto";

export default class TableService {
    async getTables(branchId: string) : Promise<TableResponse[]> {
        throw new Error("Method not implemented.");
    }

    async getTableQueue(branchId: string, tableNumber: number) : Promise<any[]> {
        throw new Error("Method not implemented.");
    }
}

export const tableService = new TableService();