import OnlineEvent from "../../offline-support/OnlineEvent";
import { CustomizationCategoryResponse } from "../dtos/CustomizationCategoryResponse";
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

}

const customizationService = new CustomizationService();
export default customizationService;