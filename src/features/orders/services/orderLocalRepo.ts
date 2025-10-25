import { db } from "../../offline-support/LocalDB";
import Order from "../models/Order";

export default class OrderLocalRepo {

    static async getAllOrders() : Promise<Order[]> {
        return await db.table('orders').toArray();
    }

    static async addOrder(order: Order): Promise<void> {
        await db.table('orders').add(order);
    }

    static async updateOrder(order: Order): Promise<void> {
        await db.table('orders').put(order);
    }

    static async deleteOrder(orderId: string): Promise<void> {
        await db.table('orders').delete(orderId);
    }

}