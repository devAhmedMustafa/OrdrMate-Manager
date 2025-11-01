import Dexie, { Table as DBTable } from 'dexie';
import Order from '../orders/models/Order';
import Item from '../items/models/Item';
import Table from '../tables/models/Table';
import TableReservation from '../tables/models/TableReservation';
import { CustomizationCategory } from '../customizations';
import ItemCustomization from '../customizations/models/ItemCustomization';
import OrderItem from '../orders/models/OrderItem';

class LocalDB extends Dexie {
    orders!: DBTable<Order, string>;
    orderItems!: DBTable<OrderItem, string>;
    items!: DBTable<Item, string>;
    tableReservations!: DBTable<TableReservation, string>;
    customizationCategory!: DBTable<CustomizationCategory, string>;
    itemCustomization!: DBTable<ItemCustomization, string>;
    seatTables!: DBTable<Table, number>;

    constructor() {
        super('LocalDB');
        this.version(1).stores({
            items: 'id, name, description, imageUrl, price, preparationTime, kitchenId, categoryName, priority, tags',
            customizationCategory: 'id, restaurantId, name, description, inputType, metadata',
            orders: 'id, branchId, customerId, orderTime, orderDate, status, totalAmount, orderType, isPaid, readyTime, tableReservationId, takeawayId',
            orderItems: 'orderId, itemId, quantity, price',
            tableReservations: 'reservationId, branchId, customerId, reservationTime, tableNumber, endTime, seatedTime, reservationStatus',
            itemCustomization: 'itemId, categoryId',
            seatTables: 'tableNumber, branchId, seats, isFrozen'
        });
    }
}

export const db = new LocalDB();