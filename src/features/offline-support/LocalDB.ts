import Dexie, { Table } from 'dexie';
import Order from '../orders/models/Order';
import Item from '../items/models/Item';
import TableReservation from '../tables/models/TableReservation';
import { CustomizationCategory } from '../customizations';
import ItemCustomization from '../customizations/models/ItemCustomization';
import OrderItem from '../orders/models/OrderItem';

class LocalDB extends Dexie {
    orders!: Table<Order, string>;
    orderItems!: Table<OrderItem, string>;
    items!: Table<Item, string>;
    tableReservations!: Table<TableReservation, string>;
    customizationCategory!: Table<CustomizationCategory, string>;
    itemCustomization!: Table<ItemCustomization, string>;

    constructor() {
        super('LocalDB');
        this.version(1).stores({
            items: 'id, name, description, imageUrl, price, preparationTime, kitchenId, categoryName, priority, tags',
            customizationCategory: 'id, restaurantId, name, description, inputType, metadata',
            orders: 'id, branchId, customerId, orderTime, orderDate, status, totalAmount, orderType, isPaid, readyTime, tableReservationId, takeawayId',
            orderItems: 'orderId, itemId, quantity, price',
            tableReservations: 'reservationId, branchId, customerId, reservationTime, tableNumber, endTime, seatedTime',
            itemCustomization: 'itemId, categoryId'
        });
    }
}

export const db = new LocalDB();