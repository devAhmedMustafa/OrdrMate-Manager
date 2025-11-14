import CustomizationCategory from "../models/CustomizationCategory";
import {db} from "../../offline-support/LocalDB";
import UserCustomization from "../models/UserCustomization";

export default class CustomizationLocalDB {
    async getCategories(restaurantId: string): Promise<CustomizationCategory[]> {
        return await db.customizationCategory.where("restaurantId").equals(restaurantId).toArray();
    }

    async updateCategories(categories: CustomizationCategory[]): Promise<void> {
        const existingCategories = await db.customizationCategory.toArray();
        const existingCategoryIds = new Set(existingCategories.map(cat => cat.id));
        for (const category of categories) {
            if (existingCategoryIds.has(category.id)) {
                await db.customizationCategory.put(category);
            } else {
                await db.customizationCategory.add(category);
            }
        }
    }

    async getItemCustomizationCategories(itemId: string): Promise<CustomizationCategory[]> {
        const itemCustomizations = await db.itemCustomization.where("itemId").equals(itemId).toArray();
        const categoryIds = itemCustomizations.map(ic => ic.categoryId);
        return await db.customizationCategory.where("id").anyOf(categoryIds).toArray();
    }

    async updateItemCustomizations(itemId: string, categories: CustomizationCategory[]): Promise<void> {
        await db.itemCustomization.where("itemId").equals(itemId).delete();

        for (const category of categories) {
            await db.itemCustomization.add({
                itemId: itemId,
                categoryId: category.id
            });
        }
    }

    async getOrderCustomizations(orderId: string): Promise<UserCustomization[]> {
        return await db.userCustomizations.where("orderId").equals(orderId).toArray();
    }
}

export const customizationLocalDB = new CustomizationLocalDB();