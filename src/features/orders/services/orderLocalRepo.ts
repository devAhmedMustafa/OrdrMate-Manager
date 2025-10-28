import { db } from "../../offline-support/LocalDB";
import Order from "../models/Order";

export default class OrderLocalRepo {

    async getAllOrders() : Promise<Order[]> {
        return await db.table('orders').toArray();
    }

    async addOrder(order: Order): Promise<void> {
        await db.table('orders').add(order);
    }

    async updateOrder(order: Order): Promise<void> {
        await db.table('orders').put(order);
    }

    async deleteOrder(orderId: string): Promise<void> {
        await db.table('orders').delete(orderId);
    }

}

export const orderLocalRepo = new OrderLocalRepo();