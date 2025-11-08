import Dexie, { Table as DBTable } from 'dexie';
import Order from '../orders/models/Order';
import Item from '../items/models/Item';
import Table from '../tables/models/Table';
import TableReservation from '../tables/models/TableReservation';
import ItemCustomization from '../customizations/models/ItemCustomization';
import OrderItem from '../orders/models/OrderItem';
import CustomizationCategory from '../customizations/models/CustomizationCategory';
import Payment from '../payments/models/Payment';
import UserCustomization from '../customizations/models/UserCustomization';

class LocalDB extends Dexie {
    orders!: DBTable<Order, string>;
    orderItems!: DBTable<OrderItem, string>;
    items!: DBTable<Item, string>;
    tableReservations!: DBTable<TableReservation, string>;
    customizationCategory!: DBTable<CustomizationCategory, string>;
    itemCustomization!: DBTable<ItemCustomization, string>;
    seatTables!: DBTable<Table, number>;
    payments!: DBTable<Payment, string>;
    userCustomizations!: DBTable<UserCustomization, {orderId: string, itemId: string}>;

    constructor() {
        super('LocalDB');
        this.version(1).stores({
            items: 'id, name, description, imageUrl, price, preparationTime, kitchenId, categoryName, priority, tags',
            customizationCategory: 'id, restaurantId, name, description, inputType, metadata',
            orders: 'id, branchId, customerId, orderTime, orderDate, status, totalAmount, orderType, isPaid, readyTime, tableReservationId, takeawayId',
            orderItems: 'orderId, itemId, quantity, price',
            tableReservations: 'reservationId, branchId, customerId, reservationTime, tableNumber, endTime, seatedTime, reservationStatus',
            itemCustomization: 'itemId, categoryId',
            seatTables: 'tableNumber, branchId, seats, isFrozen',
            payments: 'id, orderId, amount, paymentMethod, provider, transactionId, paidAt, externalRef',
            userCustomizations: '[orderId+itemId], orderId, itemId, customizationData'
        });
    }
}

export const db = new LocalDB();