import QueueInvoker from "../../../utils/QueueInvoker";
import OnlineEvent from "../../offline-support/OnlineEvent";
import OrderItemResponse from "../../orders/dtos/OrderItemResponse";
import OrderResponse from "../../orders/dtos/OrderResponse";
import OrderMapper from "../../orders/mappers/orderMapper";
import { orderLocalRepo } from "../../orders/services/orderLocalRepo";
import { OrderStatus } from "../../orders/types";
import paymentLocalRepo from "../../payments/services/paymentLocalRepo";
import TableReservationResponse from "../dtos/TableReservationResponse";
import TableResponse from "../dtos/TableResponse.dto";
import ReservationOrderMapper from "../mapper/ReservationOrderMapper";
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
                const data = await tableCloudService.getTableQueue(branchId, tableNumber);
                await tableLocalRepo.updateTableQueue(branchId, tableNumber, data.map(TableReservationMapper.fromResponseToModel));
                return data;
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

    async dequeueTable(branchId: string, tableNumber: number) : Promise<void> {
        try {
            if (OnlineEvent.getInstance().isOnline) {
                await tableCloudService.dequeueTable(branchId, tableNumber);
            }

            await tableLocalRepo.dequeueTable(branchId, tableNumber);
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

    async getReservationOrder(reservationId: string) : Promise<OrderResponse | null> {
        try {
            if (OnlineEvent.getInstance().isOnline) {
                return await tableCloudService.getReservationOrder(reservationId);
            }
            
            const orders = await orderLocalRepo.getOrdersByReservationId(reservationId);
            if (orders.length === 0) {
                return null;
            }

            const reservationOrders: OrderResponse[] = [];
            for (const order of orders) {
                const orderResponse = await OrderMapper.fromModelToResponse(order);
                reservationOrders.push(orderResponse);
            }

            return ReservationOrderMapper.mapOrdersToReservationOrder(reservationOrders);

        }
        catch(err) {
            throw err;
        }
    }

    async setOrdersAsReady(reservationId: string): Promise<void> {
        try {
            QueueInvoker.getInstance().enqueue(async () => {
                await tableCloudService.setOrdersAsReady(reservationId);
            });

            const orders = await orderLocalRepo.getOrdersByReservationId(reservationId);
            for (const order of orders) {
                order.status = OrderStatus.Ready;
                await orderLocalRepo.updateOrder(order);
            }
        }
        catch(err) {
            throw err;
        }
    }

    async changeReservationPayment(reservationId: string, paymentProvider: string): Promise<void> {
        try {
            if (OnlineEvent.getInstance().isOnline) {
                await tableCloudService.changeReservationPayment(reservationId, paymentProvider);
            }

            const orders = await orderLocalRepo.getOrdersByReservationId(reservationId);
            const payments = await Promise.all(orders.map(order => paymentLocalRepo.getPaymentByOrderId(order.id)));
            for (const payment of payments) {
                if (payment) {
                    payment.provider = paymentProvider;
                    await paymentLocalRepo.updatePayment(payment);
                }
            }
        }
        catch(err) {
            throw err;
        }
    }

    async confirmTableReservation(reservationId: string, tableNumber: number): Promise<void> {
        try {
            if (OnlineEvent.getInstance().isOnline) {
                await tableCloudService.confirmTableReservation(reservationId, tableNumber);
            }

            const tableReservation = await tableLocalRepo.getTableReservationById(reservationId);
            if (tableReservation) {
                tableReservation.tableNumber = tableNumber;
                await tableLocalRepo.updateTableReservation(tableReservation);
            }

        }
        catch(err) {
            throw err;
        }
    }

    async payOrders(reservationId: string): Promise<OrderResponse> {
        try {
            if (OnlineEvent.getInstance().isOnline) {
                return await tableCloudService.payOrders(reservationId);
            }

            QueueInvoker.getInstance().enqueue(async () => {
                await tableCloudService.payOrders(reservationId);
            });

            const orders = await orderLocalRepo.getOrdersByReservationId(reservationId);
            if (orders.length === 0) {
                throw new Error('No orders found for reservation');
            }

            for (const order of orders) {
                order.isPaid = true;
                await orderLocalRepo.updateOrder(order);
            }

            const payments = await Promise.all(orders.map(order => paymentLocalRepo.getPaymentByOrderId(order.id)));
            for (const payment of payments) {
                if (payment) {
                    payment.paidAt = new Date(Date.now());
                    await paymentLocalRepo.updatePayment(payment);
                }
            }

            const orderResponses: OrderResponse[] = [];
            for (const order of orders) {
                const orderResponse = await OrderMapper.fromModelToResponse(order);
                orderResponses.push(orderResponse);
            }

            return ReservationOrderMapper.mapOrdersToReservationOrder(orderResponses);
        }
        catch(err) {
            throw err;
        }
    }

    async pushToKitchen(reservationId: string): Promise<OrderItemResponse[]> {
        try {
            if (OnlineEvent.getInstance().isOnline) {
                return await tableCloudService.pushToKitchen(reservationId);
            }

            QueueInvoker.getInstance().enqueue(async () => {
                await tableCloudService.pushToKitchen(reservationId);
            });

            const orders = await orderLocalRepo.getOrdersByReservationId(reservationId);
            if (orders.length === 0) {
                throw new Error('No orders found for reservation');
            }

            const orderItems: OrderItemResponse[] = [];
            for (const order of orders) {
                const mappedOrder = await OrderMapper.fromModelToResponse(order);
                orderItems.push(...mappedOrder.orderItems);
                order.status = OrderStatus.InProgress;
                await orderLocalRepo.updateOrder(order);
            }

            return orderItems;
        }
        catch(err) {
            throw err;
        }
    }

}

const tableService = new TableService();
export default tableService;