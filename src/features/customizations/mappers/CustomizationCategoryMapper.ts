import { CustomizationCategoryResponse } from "../dtos/CustomizationCategoryResponse";
import CustomizationCategory from "../models/CustomizationCategory";
import InputTypeMapper from "./InputTypeMapper";

export default class CustomizationCategoryMapper {
    static fromResponseDto(dto: CustomizationCategoryResponse): CustomizationCategory {
        return new CustomizationCategory(
            {
                id: dto.id,
                restaurantId: dto.restaurantId,
                name: dto.name,
                description: dto.description,
                inputType: InputTypeMapper.fromStringToInputType(dto.inputType),
                metadata: dto.metadata
            }
        )
    }

    static toResponseDto(model: CustomizationCategory): CustomizationCategoryResponse {
        return {
            id: model.id,
            restaurantId: model.restaurantId,
            name: model.name,
            description: model.description,
            inputType: InputTypeMapper.fromInputTypeToString(model.inputType),
            metadata: model.metadata
        }
    }
}