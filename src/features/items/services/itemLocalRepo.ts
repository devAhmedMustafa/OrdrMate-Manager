import { db } from "../../offline-support/LocalDB";
import Item from "../models/Item";

export default class ItemLocalRepo {
    async getItems(): Promise<Item[]> {
        return await db.table('items').toArray();
    }

    async getItemById(id: string): Promise<Item | undefined> {
        return await db.table('items').get(id);
    }

    async addItem(item: Item): Promise<void> {
        await db.table('items').add(item);
    }
}

export const itemLocalRepo = new ItemLocalRepo();