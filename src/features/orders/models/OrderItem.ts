import { MenuItem } from "../../items/services/itemService";

export default interface OrderItem {
    itemId: string;
    item: MenuItem;
    quantity: number;
}