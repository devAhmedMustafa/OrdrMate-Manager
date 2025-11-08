import OnlineEvent from "../../offline-support/OnlineEvent";
import { orderLocalRepo } from "../../orders/services/orderLocalRepo";
import { CustomizationCategoryResponse } from "../dtos/CustomizationCategoryResponse";
import OrderCustomizationResponse from "../dtos/OrderCustomizationResponse.dto";
import CustomizationCategoryMapper from "../mappers/CustomizationCategoryMapper";
import { customizationCloudService } from "./customizationCloudService";
import { customizationLocalDB } from "./customizationLocalDB";

class CustomizationService {

    async getCategories (restaurantId: string): Promise<CustomizationCategoryResponse[]>{
        if (OnlineEvent.getInstance().isOnline) {
            const data = await customizationCloudService.getCategories(restaurantId);
            await customizationLocalDB.updateCategories(data.map(CustomizationCategoryMapper.fromResponseDto));
            return data;
        }
        else{
            const localData = await customizationLocalDB.getCategories(restaurantId);
            return localData.map(CustomizationCategoryMapper.toResponseDto);
        }
    }

    async getItemCustomizations(itemId: string): Promise<CustomizationCategoryResponse[]> {
        if (OnlineEvent.getInstance().isOnline) {
            const data = await customizationCloudService.getItemCustomizations(itemId);
            await customizationLocalDB.updateItemCustomizations(itemId, data.map(CustomizationCategoryMapper.fromResponseDto));
            return data;
        }
        else{
            const localData = await customizationLocalDB.getItemCustomizationCategories(itemId);
            return localData.map(CustomizationCategoryMapper.toResponseDto);
        }
    }

    async getOrderCustomizationByReservation(reservationId: string): Promise<OrderCustomizationResponse> {
        try {
            if (OnlineEvent.getInstance().isOnline) {
                const data = await customizationCloudService.getOrderCustomizationByReservation(reservationId);
                return data;
            }
            const orders = await orderLocalRepo.getOrdersByReservationId(reservationId);

            if (orders.length === 0) {
                throw new Error("No orders found for the given reservation ID");
            }

            const orderCustomizations: OrderCustomizationResponse = {
                orderId: orders[0].id,
                items: []
            };

            for (const order of orders) {
                const userCustomization = await customizationLocalDB.getOrderCustomizations(order.id);
                for (const customization of userCustomization) {
                    orderCustomizations.items.push({
                        itemId: customization.itemId,
                        orderId: customization.orderId,
                        customization: customization.customizationsValues
                    });
                }
            }

            return orderCustomizations;
        }
        catch (error) {
            console.error("Error fetching order customizations:", error);
            throw error;
        }
    }

}

const customizationService = new CustomizationService();
export default customizationService;