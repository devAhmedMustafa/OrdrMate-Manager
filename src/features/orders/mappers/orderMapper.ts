import { tableLocalRepo } from "../../tables/services/tableLocalRepo";
import OrderResponse from "../dtos/OrderResponse";
import Order from "../models/Order";
import OrderStatusMapper from "./orderStatusMapper";
import OrderTypeMapper from "./orderTypeMapper";

export default class OrderMapper {
    static async fromModelToResponse(order: Order) : Promise<OrderResponse> {

        let tableReservation = null;

        if (order.tableReservationId)
            tableReservation = await tableLocalRepo.getTableReservationById(order.tableReservationId);

        return {
            orderId: order.id,
            branchId: order.branchId,
            customerId: order.customerId,
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

    static fromResponseToModel(orderResponse: OrderResponse) : Order {
        return new Order({
            id: orderResponse.orderId,
            branchId: orderResponse.branchId,
            customerId: orderResponse.customerId,
            orderDate: orderResponse.orderDate,
            totalAmount: orderResponse.totalAmount,
            isPaid: orderResponse.isPaid,
            orderType: OrderTypeMapper.fromStringToOrderType(orderResponse.orderType),
            status: OrderStatusMapper.fromStringToOrderStatus(orderResponse.orderStatus),
            }
        );
    }
}