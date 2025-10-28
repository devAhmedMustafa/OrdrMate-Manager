import { tableLocalRepo } from "../../tables/services/tableLocalRepo";
import OrderResponse from "../dtos/OrderResponse";
import Order from "../models/Order";

export default class OrderResponseMapper {
    static async fromOrderModel(order: Order) : Promise<OrderResponse> {

        let tableReservation = null;

        if (order.tableReservationId)
            tableReservation = await tableLocalRepo.getTableReservationById(order.tableReservationId);

        return {
            orderId: order.id,
            branchId: order.branchId,
            orderItems: [],
            orderStatus: order.status.toString(),
            paymentMethod: "",
            paymentProvider: "",
            orderType: order.orderType.toString(),
            orderDate: order.orderDate,
            totalAmount: order.totalAmount,
            isPaid: order.isPaid,
            customer: "",
            tableNumber: tableReservation ? tableReservation?.tableNumber : null
        };
    }
}