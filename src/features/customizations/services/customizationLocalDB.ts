import CustomizationCategory from "../models/CustomizationCategory";
import {db} from "../../offline-support/LocalDB";

export default class CustomizationLocalDB {
    async getCategories(restaurantId: string): Promise<CustomizationCategory[]> {
        return await db.customizationCategory.where("restaurantId").equals(restaurantId).toArray();
    }

    async updateCategories(categories: CustomizationCategory[]): Promise<void> {
        await db.customizationCategory.bulkPut(categories);
    }

    async getItemCustomizationCategories(itemId: string): Promise<CustomizationCategory[]> {
        const itemCustomizations = await db.itemCustomization.where("itemId").equals(itemId).toArray();
        const categoryIds = itemCustomizations.map(ic => ic.categoryId);
        return await db.customizationCategory.where("id").anyOf(categoryIds).toArray();
    }

    async updateItemCustomizations(itemId: string, categories: CustomizationCategory[]): Promise<void> {
        // Remove existing customizations for the item
        await db.itemCustomization.where("itemId").equals(itemId).delete();

        // Add new item customizations
        for (const category of categories) {
            await db.itemCustomization.add({
                itemId: itemId,
                categoryId: category.id
            });
        }
    }

}

export const customizationLocalDB = new CustomizationLocalDB();