import OrderItemResponse from "./OrderItemResponse";

export default interface OrderResponse {

    orderId: string;
    branchId: string;
    orderItems: OrderItemResponse[];
    orderStatus: string;
    paymentProvider: string;
    paymentMethod: string;
    orderType: string;
    orderDate: string;
    totalAmount: number;
    isPaid: boolean;
    customer: string;
    orderNumber?: number | null;
    tableNumber?: number | null;

}