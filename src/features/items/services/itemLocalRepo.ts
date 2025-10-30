import { db } from "../../offline-support/LocalDB";
import Item from "../models/Item";

export default class ItemLocalRepo {
    async getItems(): Promise<Item[]> {
        return await db.items.toArray();
    }

    async getItemById(id: string): Promise<Item | undefined> {
        return await db.items.get(id);
    }

    async addItem(item: Item): Promise<void> {
        await db.items.add(item);
    }
}

export const itemLocalRepo = new ItemLocalRepo();