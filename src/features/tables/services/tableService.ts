import OnlineEvent from "../../offline-support/OnlineEvent";
import { orderLocalRepo } from "../../orders/services/orderLocalRepo";
import TableReservationResponse from "../dtos/TableReservationResponse";
import TableResponse from "../dtos/TableResponse.dto";
import TableMapper from "../mapper/TableMapper";
import TableReservationMapper from "../mapper/TableReservationMapper";
import { tableCloudService } from "./tableCloudService";
import { tableLocalRepo } from "./tableLocalRepo";

export default class TableService {
    async getTables(branchId: string) : Promise<TableResponse[]> {
        try {
            if (OnlineEvent.getInstance().isOnline) {
                const data = await tableCloudService.getTables(branchId);
                await tableLocalRepo.updateTablesByBranch(branchId, data);
                return data;
            }

            else {
                const localTables = await tableLocalRepo.getTablesByBranch(branchId);
                return localTables.map(TableMapper.fromModelToResponse);
            }
        }
        catch(err) {
            throw err;
        }
    }

    async getTableQueue(branchId: string, tableNumber: number) : Promise<TableReservationResponse[]> {
        try{
            if (OnlineEvent.getInstance().isOnline) {
                return await tableCloudService.getTableQueue(branchId, tableNumber);
            }
            else {
                const localQueue = await tableLocalRepo.getTableQueue(branchId, tableNumber);
                const reservationResponses: TableReservationResponse[] = [];

                for (const reservation of localQueue) {
                    const orders = await orderLocalRepo.getOrdersByReservationId(reservation.reservationId);
                    if (orders.length > 0) {
                        const order = orders[0];
                        const reservationResponse = TableReservationMapper.fromModelToDto(reservation, order);
                        reservationResponses.push(reservationResponse);
                    }
                }

                return reservationResponses;
            }
        }
        catch(err){
            throw err;
        }
    }
}

export const tableService = new TableService();