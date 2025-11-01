import { OrderStatus } from "../types";
import ORDER_TYPE from "./ORDER_TYPE";
import { v4 as uuidv4 } from "uuid";

export default class Order {
    id: string;
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
            id?: string;
            branchId: string;
            customerId: string;
            orderType: ORDER_TYPE;
            status?: OrderStatus;
            orderDate?: string;
            totalAmount: number;
            isPaid?: boolean;
            tableReservationId?: string;
            takeawayId?: string;
        }) {
        this.id = data.id || uuidv4();
        this.branchId = data.branchId!;
        this.customerId = data.customerId!;
        this.orderTime = data.orderDate ? new Date(data.orderDate).toISOString().split('T')[1].split('.')[0] : new Date(Date.now()).toISOString().split('T')[1].split('.')[0];
        this.orderDate = data.orderDate || new Date(Date.now()).toISOString();
        this.status = data.status || OrderStatus.Pending;
        this.totalAmount = data.totalAmount || 0;
        this.orderType = data.orderType!;
        this.isPaid = data.isPaid || false;
        this.tableReservationId = data.tableReservationId!;
        this.takeawayId = data.takeawayId!;
    }
}