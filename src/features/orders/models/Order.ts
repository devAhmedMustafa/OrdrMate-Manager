import { OrderStatus } from "../types";
import ORDER_TYPE from "./ORDER_TYPE";
import { v4 as uuidv4 } from "uuid";

export default class Order {
    id: string = uuidv4();
    branchId: string;
    customerId: string;
    orderTime: string;
    orderDate: string;
    status: OrderStatus;
    totalAmount: number;
    orderType: ORDER_TYPE;
    isPaid: boolean = false;
    readyTime!: Date;
    tableReservationId!: string;
    takeawayId!: string;

    constructor(data: {
            branchId: string; 
            customerId: string; 
            orderType: ORDER_TYPE; 
            totalAmount?: number; 
            tableReservationId?: string; 
            takeawayId?: string
        }) {
        this.branchId = data.branchId!;
        this.customerId = data.customerId!;
        this.orderTime = new Date(Date.now()).toLocaleTimeString();
        this.orderDate = new Date(Date.now()).toLocaleDateString();
        this.status = OrderStatus.Pending;
        this.totalAmount = data.totalAmount || 0;
        this.orderType = data.orderType!;
        this.isPaid = false;
        this.tableReservationId = data.tableReservationId!;
        this.takeawayId = data.takeawayId!;
    }
}