import { OrderStatus } from "../types";

export default class OrderStatusMapper {
    static fromStringToOrderStatus(orderStatusStr: string) : OrderStatus {
        switch(orderStatusStr.toLowerCase()) {
            case "pending":
                return OrderStatus.Pending;
            case "inprogress":
                return OrderStatus.InProgress;
            case "queued":
                return OrderStatus.Queued;
            case "ready":
                return OrderStatus.Ready;
            case "delivered":
                return OrderStatus.Delivered;
            case "cancelled":
                return OrderStatus.Cancelled;
            default:
                throw new Error(`Invalid order status string: ${orderStatusStr}`);
        }
    }

    static fromOrderStatusToString(orderStatus: OrderStatus) : string {
        switch(orderStatus) {
            case OrderStatus.Pending:
                return "Pending";
            case OrderStatus.InProgress:
                return "InProgress";
            case OrderStatus.Queued:
                return "Queued";
            case OrderStatus.Ready:
                return "Ready";
            case OrderStatus.Delivered:
                return "Delivered";
            case OrderStatus.Cancelled:
                return "Cancelled";
            default:
                throw new Error(`Invalid order status: ${orderStatus}`);
        }
    }
}