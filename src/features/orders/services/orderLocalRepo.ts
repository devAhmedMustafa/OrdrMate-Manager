import { db } from "../../offline-support/LocalDB";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";

export default class OrderLocalRepo {

    async getAllOrders() : Promise<Order[]> {
        return await db.table('orders').toArray();
    }

    async getOrderById(orderId: string): Promise<Order | undefined> {
        return await db.table('orders').get(orderId);
    }

    async getOrdersByReservationId(reservationId: string): Promise<Order[]> {
        return await db.table('orders').where('tableReservationId').equals(reservationId).toArray();
    }

    async addOrder(order: Order): Promise<void> {
        await db.table('orders').add(order);
    }

    async addOrderItem(orderItem: OrderItem): Promise<void> {
        await db.orderItems.add(orderItem);
    }

    async updateOrder(order: Order): Promise<void> {
        await db.table('orders').put(order);
    }

    async deleteOrder(orderId: string): Promise<void> {
        await db.table('orders').delete(orderId);
    }

    async syncOrders(orders: Order[]): Promise<void> {
        const localOrders = await this.getAllOrders();
        const localOrderIds = localOrders.map(o => o.id);
        const incomingOrderIds = orders.map(o => o.id);

        const ordersToAdd = orders.filter(o => !localOrderIds.includes(o.id));
        const ordersToUpdate = localOrders.filter(o => incomingOrderIds.includes(o.id));

        await Promise.all([
            ...ordersToAdd.map(o => this.addOrder(o)),
            ...ordersToUpdate.map(o => this.updateOrder(o)),
        ]);
    }

}

export const orderLocalRepo = new OrderLocalRepo();