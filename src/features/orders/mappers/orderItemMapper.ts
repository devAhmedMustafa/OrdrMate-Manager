import ItemMapper from "../../items/mappers/ItemMapper";
import { itemLocalRepo } from "../../items/services/itemLocalRepo";
import OrderItemResponse from "../dtos/OrderItemResponse";
import OrderItem from "../models/OrderItem";

export default class OrderItemMapper {
    static fromResponseToModel(orderItemResponse: OrderItemResponse): OrderItem {
        return new OrderItem({
            orderId: orderItemResponse.orderId,
            itemId: orderItemResponse.itemId,
            quantity: orderItemResponse.quantity,
        });
    }

    static async fromModelToResponse(orderItem: OrderItem): Promise<OrderItemResponse> {

        const item = await itemLocalRepo.getItemById(orderItem.itemId);

        if (!item) {
            throw new Error(`Item with ID ${orderItem.itemId} not found`);
        }

        const itemDto = ItemMapper.toDto(item);

        return {
            orderId: orderItem.orderId,
            itemId: orderItem.itemId,
            quantity: orderItem.quantity,
            item: itemDto
        };
    }
}