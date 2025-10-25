import Dexie, { Table } from 'dexie';
import Order from '../orders/models/Order';

class LocalDB extends Dexie {
    orders!: Table<Order, string>;

    constructor() {
        super('LocalDB');
        this.version(1).stores({
            orders: 'id, branchId, customerId, orderTime, orderDate, status, totalAmount, orderType, isPaid, readyTime, tableReservationId, takeawayId',
        });
    }
}

export const db = new LocalDB();