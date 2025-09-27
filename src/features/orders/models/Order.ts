import OrderItem from "./OrderItem";

export default interface Order {

    orderId: string;
    branchId: string;
    orderItems: OrderItem[];
    orderStatus: string;
    orderType: string;
    orderDate: string;
    totalAmount: number;
    isPaid: boolean;
    customer: string;
    orderNumber?: number | null;
    tableNumber?: number | null;

}