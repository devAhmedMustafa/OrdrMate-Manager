import { ItemDto } from "../dtos/ItemDto";
import Item from "../models/Item";

export default class ItemMapper {
    static fromDto(dto: ItemDto): Item {
        return new Item({
            id: dto.id,
            name: dto.name,
            description: dto.description,
            imageUrl: dto.imageUrl,
            price: dto.price,
            preparationTime: dto.preparationTime,
            kitchenId: dto.kitchenId,
            categoryName: dto.category,
            priority: dto.priority,
            tags: dto.tags ? dto.tags.split(',') : []
        })
    }

    static toDto(item: Item): ItemDto {
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            imageUrl: item.imageUrl,
            price: item.price,
            preparationTime: item.preparationTime,
            kitchenId: item.kitchenId,
            category: item.categoryName,
            priority: item.priority,
            tags: item.tags.join(',')
        }
    }
}