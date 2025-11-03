import QueueInvoker from "../../../utils/QueueInvoker";
import OnlineEvent from "../../offline-support/OnlineEvent";
import { orderLocalRepo } from "../../orders/services/orderLocalRepo";
import TableReservationResponse from "../dtos/TableReservationResponse";
import TableResponse from "../dtos/TableResponse.dto";
import TableMapper from "../mapper/TableMapper";
import TableReservationMapper from "../mapper/TableReservationMapper";
import Table from "../models/Table";
import { tableCloudService } from "./tableCloudService";
import { tableLocalRepo } from "./tableLocalRepo";

class TableService {
    async getTables(branchId: string) : Promise<TableResponse[]> {
        try {
            if (OnlineEvent.getInstance().isOnline) {
                const data = await tableCloudService.getTables(branchId);
                await tableLocalRepo.updateTablesByBranch(branchId, data.map(TableMapper.fromResponseToModel));
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

    async moveReservation(reservationId: string, toTableNumber: number) : Promise<void> {
        try {
            if (OnlineEvent.getInstance().isOnline) {
                await tableCloudService.moveReservation(reservationId, toTableNumber);
            }

            await tableLocalRepo.moveReservation(reservationId, toTableNumber);
        }
        catch(err) {
            throw err;
        }
    }

    async dequeTable(branchId: string, tableNumber: number) : Promise<void> {
        try {
            if (OnlineEvent.getInstance().isOnline) {
                await tableCloudService.dequeueTable(branchId, tableNumber);
            }
            // Local dequeue logic can be added here if needed
        }
        catch(err) {
            throw err;
        }
    }

    async freezeTable(branchId: string, tableNumber: number): Promise<void> {
        try {
            if (OnlineEvent.getInstance().isOnline) {
                await tableCloudService.freezeTable(branchId, tableNumber);
            }
            await tableLocalRepo.freezeTable(branchId, tableNumber);
        }
        catch(err) {
            throw err;
        }
    }

    async unfreezeTable(branchId: string, tableNumber: number): Promise<void> {
        try {
            if (OnlineEvent.getInstance().isOnline) {
                await tableCloudService.unfreezeTable(branchId, tableNumber);
            }
            await tableLocalRepo.unfreezeTable(branchId, tableNumber);
        }
        catch(err) {
            throw err;
        }
    }

    async createTable(branchId: string, tableNumber: number, seats: number): Promise<void> {
        try {
            QueueInvoker.getInstance().enqueue(async () => {
                await tableCloudService.createTable({ branchId, tableNumber, seats });
            });

            await tableLocalRepo.createTable(new Table({ branchId, tableNumber, seats }));
        }
        catch(err) {
            throw err;
        }
    }
}

const tableService = new TableService();
export default tableService;