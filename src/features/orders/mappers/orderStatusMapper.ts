import { OrderStatus } from "../types";

export default class OrderStatusMapper {
    static fromStringToOrderStatus(orderStatusStr: string) : OrderStatus {
        switch(orderStatusStr) {
            case "Pending":
                return OrderStatus.Pending;
            case "InProgress":
                return OrderStatus.InProgress;
            case "Queued":
                return OrderStatus.Queued;
            case "Delivered":
                return OrderStatus.Delivered;
            case "Cancelled":
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