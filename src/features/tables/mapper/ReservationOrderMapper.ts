import OrderResponse from "../../orders/dtos/OrderResponse";
import OrderStatusMapper from "../../orders/mappers/orderStatusMapper";
import { ReservationOrder } from "../services/tableCloudService";

export default class ReservationOrderMapper {
    static mapOrdersToReservationOrder(orders: OrderResponse[]): ReservationOrder {
        return {
            orderId: orders[0].orderId,
            branchId: orders[0].branchId,
            customerId: orders[0].customerId,
            orderItems: orders.flatMap(order => order.orderItems),
            totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0),
            orderStatus: OrderStatusMapper.fromOrderStatusToString(
                Math.min(...orders.map(order => OrderStatusMapper.fromStringToOrderStatus(order.orderStatus)))
            ),
            paymentMethod: orders[0].paymentMethod,
            paymentProvider: orders[0].paymentProvider,
            orderType: orders[0].orderType,
            orderDate: orders[0].orderDate,
            isPaid: orders.every(order => order.isPaid),
            customer: orders[0].customer,
        }
    }
}