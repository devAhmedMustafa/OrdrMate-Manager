import { ItemDto } from "../../items/dtos/ItemDto";

export default interface OrderItemResponse {
    itemId: string;
    orderId: string;
    item: ItemDto;
    quantity: number;
    customizations?: {
        [key: string]: string;
    }
}