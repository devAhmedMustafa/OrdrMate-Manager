import Dexie, { Table } from 'dexie';
import Order from '../orders/models/Order';

class LocalDB extends Dexie {
    orders!: Table<Order, string>;

    constructor() {
        super('LocalDB');
        this.version(1).stores({
            items: 'id, name, description, imageUrl, price, preparationTime, kitchenId, categoryName, priority, tags',
            orders: 'id, branchId, customerId, orderTime, orderDate, status, totalAmount, orderType, isPaid, readyTime, tableReservationId, takeawayId',
            tableReservations: 'reservationId, branchId, customerId, reservationTime, tableNumber, endTime, seatedTime'
        });
    }
}

export const db = new LocalDB();