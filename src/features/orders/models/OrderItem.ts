import { MenuItem } from "../../items/services/itemService";

export default interface OrderItem {
    itemId: string;
    orderId: string;
    item: MenuItem;
    quantity: number;
    customizations?: {
        [key: string]: string;
    }
}