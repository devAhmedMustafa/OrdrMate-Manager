import { MenuItem } from "../../items/services/itemService";

export default interface OrderItemResponse {
    itemId: string;
    orderId: string;
    item: MenuItem;
    quantity: number;
    customizations?: {
        [key: string]: string;
    }
}